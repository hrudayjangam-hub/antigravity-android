# 🌍 EcoTracker: Full-Stack Sustainability Dashboard

EcoTracker is a modern, responsive web application that provides real-time weather intelligence, Air Quality Index (AQI) monitoring, and a precipitation forecast. It includes a persistent data layer using MongoDB for search history and user preferences.

## 🚀 Features
- **Real-time Geolocation**: Detects your location for instant data.
- **AQI & Health**: Actionable health advice based on air quality.
- **Smarter Metrics**: Sustainability scoring based on current environmental conditions.
- **Glassmorphism UI**: High-end futuristic design with Dark/Light mode support.

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Chart.js.
- **Backend**: Node.js, Express, Axios.
- **Database**: MongoDB (Mongoose).

## 📦 How to "Download" or Move the App
Since you are currently using this workspace, the files are already on your computer!
- **Location**: `c:\eco tracker\`
- **To Move to Another Machine**: Simply copy the `c:\eco tracker` folder or compress it into a ZIP file.

## 🏁 How to Run
1. **Prequisites**: Ensure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed.
2. **Installation**:
   ```bash
   cd "c:\eco tracker"
   npm install
   ```
3. **Environment**:
   - Check the `.env` file and verify your OpenWeatherMap API key and MongoDB URI.
4. **Launch**:
   ```bash
   npm start
   ```
5. **View**: Open `http://localhost:3000` in your browser.

## 📂 Project Structure
- `/public`: Contains `index.html` (Frontend).
- `server.js`: Node.js/Express backend.
- `package.json`: Project dependencies.
- `.env`: Environment variables and API keys.
