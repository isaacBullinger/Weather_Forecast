// Set URLs for API calls
const locationURL = "https://nominatim.openstreetmap.org/search";
const forecastURL = "https://api.open-meteo.com/v1/forecast";

// Initialize variables
let user_location;
let cardContents = [];

// Map weather codes to weather emojis
const pictures = {
    0: '&#9728',    // Clear
    1: '&#127780',  // Mainly clear
    2: '&#127781',  // Partly cloudy
    3: '&#127781',  // Overcast
    45: '&#127787', // Fog
    48: '&#127787', // Depositing rime fog
    51: '&#127782', // Light drizzle
    53: '&#127782', // Moderate drizzle
    55: '&#127783', // Dense drizzle
    56: '&#127783', // Freezing light drizzle
    57: '&#127783', // Freezing dense drizzle
    61: '&#127783', // Light rain
    63: '&#127783', // Moderate rain
    65: '&#127783', // Heavy rain
    66: '&#127783', // Freezing light rain
    67: '&#127783', // Freezing heavy rain
    71: '&#127784', // Slight snow fall
    73: '&#127784', // Moderate snow fall
    75: '&#127784', // Heavy snow fall
    77: '&#127784', // Snow grains
    80: '&#127783', // Slight rain showers
    81: '&#127783', // Moderate rain showers
    82: '&#127783', // Violent rain showers
    85: '&#127784', // Slight snow showers
    86: '&#127784', // Heavy snow showers
    95: '&#127785'  // Thunderstorm
}

// Display the weather cards when the enter key is pressed
document.getElementById('search').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        displayWeather()
    }
})

// Display the weather cards when the search button is clicked
document.getElementById('search-button').addEventListener('click', function(event) {
    event.preventDefault();
    displayWeather()
})

// Determines the latitude and longitude from input location
async function getCoordinates(location) {
    const params = new URLSearchParams({
        q: location,
        format: "json",
        limit: 1,
    });

    const response = await fetch(`${locationURL}?${params}`);
    if (!response.ok) {
        throw new Error(`Location error: ${response.status}`);
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

// Gets 7 days of weather data using the latitude and longitude
async function getWeather(latitude, longitude) {
    const params = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_mean,weathercode"
    });
    
    const response = await fetch(`${forecastURL}?${params}`);
    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }

    return await response.json();
}

// Combines the above 2 functions to get weather based on location.
async function fetchWeatherForLocation(location) {
    try {
        const { latitude, longitude } = await getCoordinates(location);
        const weatherData = await getWeather(latitude, longitude);

        return weatherData.daily;
    } catch (error) {
        console.error(error.message);
    }
}

// Formats and displays weather data on 7 cards
async function displayWeather() {
    const user_location = document.getElementById('search').value;

    try {
        const weather_data = await fetchWeatherForLocation(user_location);
        const daily_data = weather_data;
        
        // console.log(daily_data);

        cardContents = [];

        for (i = 0; i < daily_data.time.length; i++) {
            const date = dayjs(daily_data.time[i]).format('MMM D');

            cardContents.push(
                {
                precipitation: daily_data.precipitation_probability_mean[i],
                max_temp: daily_data.temperature_2m_max[i],
                min_temp: daily_data.temperature_2m_min[i],
                code: daily_data.weathercode[i],
                date: date
                }
            );
        }

        week = document.querySelector('.week-cards');

        week.innerHTML = '';

        cardContents.forEach(cardContent => {
            week.innerHTML += `
                <div class="day-card">
                    <h3 class="date">${cardContent.date}</h3>
                    <p class="forecast">${pictures[cardContent.code]}</p>
                    <p class="temp">&#127777 High: ${cardContent.max_temp}&#176; F</p>
                    <p class="temp">&#127777 Low: ${cardContent.min_temp}&#176; F</p>
                    <p class="precip">Precipitation: ${cardContent.precipitation}%</p>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error fetching weather data:", error)
    }
}
