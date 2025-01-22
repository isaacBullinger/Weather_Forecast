const locationURL = "https://nominatim.openstreetmap.org/search";
const forecastURL = "https://api.open-meteo.com/v1/forecast";

cardContents = [
    {
        date: "1/18",
        forecast: "&#127781;",
        temperature: 50,
        humidity: 30
    },
    {
        date: "1/19",
        forecast: "&#127777;",
        temperature: 52,
        humidity: 35
    },
    {
        date: "1/20",
        forecast: "&#127780;",
        temperature: 48,
        humidity: 40
    },
    {
        date: "1/21",
        forecast: "&#127782;",
        temperature: 46,
        humidity: 45
    },
    {
        date: "1/22",
        forecast: "&#127774;",
        temperature: 55,
        humidity: 25
    },
    {
        date: "1/23",
        forecast: "&#127775;",
        temperature: 53,
        humidity: 33
    },
    {
        date: "1/24",
        forecast: "&#127776;",
        temperature: 49,
        humidity: 38
    }
]

document.getElementById('search').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        location = event.target.value;
        fetchWeatherForLocation(location);
    }
})

document.getElementById('search-button').addEventListener('click', () => {
    location = document.getElementById('search').value;
    fetchWeatherForLocation(location);
})

async function getCoordinates(location) {
    const params = new URLSearchParams({
        q: location,
        format: "json",
        limit: 1,
    });

    const response = await fetch(`${locationURL}?${params}`);
    if (!response.ok) {
        throw new Error(`Geocoding error: ${response.status}`);
    }

    const data = await response.json();
    if (data.length === 0) {
        throw new Error("Location not found.");
    }

    return {
        latitude: data[0].lat,
        longitude: data[0].lon,
    };
}

// Function to fetch weather data based on coordinates
async function getWeather(latitude, longitude) {
    const params = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        current_weather: "true",
    });

    const response = await fetch(`${forecastURL}?${params}`);
    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }

    return await response.json();
}

// Main function to get weather for user input
async function fetchWeatherForLocation(location) {
    try {
        const { latitude, longitude } = await getCoordinates(location);
        const weatherData = await getWeather(latitude, longitude);

        console.log(`Weather for ${location}:`, weatherData.current_weather);
    } catch (error) {
        console.error(error.message);
    }
}

week = document.querySelector('.week-cards');

week.innerHTML = '';

cardContents.forEach(cardContent => {
    week.innerHTML += `
        <div class="day-card">
            <h3 class="date">${cardContent.date}</h3>
            <p class="forecast">${cardContent.forecast}</p>
            <p class="temp">&#127777 ${cardContent.temperature}&#176; C</p>
            <p class="humid">H: ${cardContent.humidity}%</p>
        </div>
    `;
})