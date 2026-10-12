const weatherDB = {
    'toshkent': { temp: '26°C', desc: 'Quyoshli va musaffo', icon: '☀️', hum: '38%', wind: '12 km/s' },
    'samarqand': { temp: '24°C', desc: 'Biroz bulutli', icon: '⛅', hum: '44%', wind: '16 km/s' },
    'buxoro': { temp: '28°C', desc: 'Issiq va quyoshli', icon: '☀️', hum: '25%', wind: '18 km/s' },
    'andijon': { temp: '22°C', desc: "Yomg'irli", icon: '🌧️', hum: '72%', wind: '8 km/s' },
    'london': { temp: '14°C', desc: 'Tuman va shabada', icon: '🌫️', hum: '85%', wind: '22 km/s' }
};

function getWeatherData() {
    const city = document.getElementById('cityInput').value.toLowerCase().trim();
    const data = weatherDB[city] || { temp: '20°C', desc: 'Ochiq havo', icon: '🌤️', hum: '50%', wind: '10 km/s' };

    document.getElementById('tempDisplay').textContent = data.temp;
    document.getElementById('cityName').textContent = city.charAt(0).toUpperCase() + city.slice(1);
    document.getElementById('weatherDesc').textContent = data.desc;
    document.getElementById('weatherIcon').textContent = data.icon;
    document.getElementById('humidity').textContent = data.hum;
    document.getElementById('windSpeed').textContent = data.wind;
}