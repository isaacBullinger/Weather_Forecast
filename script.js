const locationURL = "https://nominatim.openstreetmap.org/search";
const forecastURL = "https://api.open-meteo.com/v1/forecast";

let user_location;

let cardContents = []

const pictures = {
    0: '&#9728',
    1: '&#127780',
    2: '&#127781',
    3: '&#127781',
    51: '&#127782',
    53: '&#127782',
    55: '&#127783',
    71: '&#127784',
    73: '&#127784',
    75: '&#127784',
    80: '&#127783',
    81: '&#127783',
    82: '&#127783',
    85: '&#127784',
    86: '&#127784',
    95: '&#127785'
}

document.getElementById('search').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        displayWeather()
    }
})

document.getElementById('search-button').addEventListener('click', function(event) {
    event.preventDefault();
    displayWeather()
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

async function fetchWeatherForLocation(location) {
    try {
        const { latitude, longitude } = await getCoordinates(location);
        const weatherData = await getWeather(latitude, longitude);

        return weatherData.daily;
    } catch (error) {
        console.error(error.message);
    }
}

async function displayWeather() {
    const user_location = document.getElementById('search').value;

    try {
        const weather_data = await fetchWeatherForLocation(user_location);
        const daily_data = weather_data;
        
        cardContents = []

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
            )
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
        })

    } catch (error) {
        console.error("Error fetching weather data:", error)
    }

}
