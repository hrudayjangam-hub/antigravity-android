const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const cache = new NodeCache({ stdTTL: 600 });

app.set('trust proxy', 1); // Respect headers from cloud proxies (Render/Heroku)

// --- MongoDB Configuration ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecotracker';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const searchSchema = new mongoose.Schema({
    city: String,
    username: { type: String, default: 'Anonymous' },
    lat: Number,
    lon: Number,
    aqi: Number,
    weather: {
        temp: Number,
        condition: String,
        humidity: Number
    },
    source: { type: String, enum: ['search', 'gps'], default: 'search' },
    timestamp: { type: Date, default: Date.now }
});

const preferenceSchema = new mongoose.Schema({
    userId: { type: String, default: 'default_user' },
    theme: { type: String, default: 'dark' },
    units: { type: String, default: 'metric' }
});

const Search = mongoose.model('Search', searchSchema);
const Preference = mongoose.model('Preference', preferenceSchema);

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static('./public'));

const checkCache = (req, res, next) => {
    const key = req.originalUrl;
    const cachedData = cache.get(key);
    if (cachedData) return res.json(cachedData);
    next();
};

const API_KEY = process.env.OPENWEATHER_API_KEY || '8093db5f8f902787e91d5755ba9b4b0e';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// --- API Endpoints ---

// History & Preferences
app.get('/api/history', async (req, res) => {
    try {
        const history = await Search.find().sort({ timestamp: -1 }).limit(10);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

app.get('/api/preferences', async (req, res) => {
    try {
        let prefs = await Preference.findOne({ userId: 'default_user' });
        if (!prefs) prefs = await Preference.create({ userId: 'default_user' });
        res.json(prefs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

app.post('/api/preferences', async (req, res) => {
    try {
        const { theme, units } = req.body;
        const prefs = await Preference.findOneAndUpdate(
            { userId: 'default_user' },
            { theme, units },
            { new: true, upsert: true }
        );
        res.json(prefs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save preferences' });
    }
});

// Weather Proxy (with auto-logging)
app.get('/api/weather', checkCache, async (req, res) => {
    const { lat, lon, units = 'metric' } = req.query;
    try {
        const response = await axios.get(`${BASE_URL}/weather`, {
            params: { lat, lon, units, appid: API_KEY }
        });

        // Fetch AQI for logging in history
        let aqiVal = null;
        try {
            const aqiRes = await axios.get(`${BASE_URL}/air_pollution`, {
                params: { lat, lon, appid: API_KEY }
            });
            aqiRes.data.list?.[0]?.main?.aqi && (aqiVal = aqiRes.data.list[0].main.aqi);
        } catch (e) { console.error('AQI Log fetch error', e); }

        // Log search (async, don't block response)
        const username = req.query.username || 'Anonymous';
        const source = req.query.source || 'search';

        Search.create({
            city: response.data.name,
            username,
            lat,
            lon,
            aqi: aqiVal,
            weather: {
                temp: response.data.main.temp,
                condition: response.data.weather[0].main,
                humidity: response.data.main.humidity
            },
            source
        }).catch(e => console.error('Log error', e));

        cache.set(req.originalUrl, response.data);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch weather' });
    }
});

app.get('/api/aqi', checkCache, async (req, res) => {
    const { lat, lon } = req.query;
    try {
        const response = await axios.get(`${BASE_URL}/air_pollution`, {
            params: { lat, lon, appid: API_KEY }
        });
        cache.set(req.originalUrl, response.data);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch AQI' });
    }
});

app.get('/api/forecast', checkCache, async (req, res) => {
    const { lat, lon, units = 'metric' } = req.query;
    try {
        const response = await axios.get(`${BASE_URL}/forecast`, {
            params: { lat, lon, units, appid: API_KEY }
        });
        cache.set(req.originalUrl, response.data);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch forecast' });
    }
});

app.get('/api/geo', checkCache, async (req, res) => {
    const { q } = req.query;
    try {
        const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct`, {
            params: { q, limit: 1, appid: API_KEY }
        });
        cache.set(req.originalUrl, response.data);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to find city' });
    }
});

app.get('/api/health', (req, res) => {
    const status = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({ database: status, uptime: process.uptime() });
});

app.listen(port, () => {
    console.log(`EcoTracker Server running at http://localhost:${port}`);
});
