const apiKey = 'cab56abc71dba88a54826e3b27a6bb68'; // TODO: update & hide key, delete this one
const geoUrl = 'https://api.openweathermap.org/geo/1.0/direct'
const zipUrl = 'https://api.openweathermap.org/geo/1.0/zip';
const currentWeatherBaseUrl = 'https://api.openweathermap.org/data/2.5/weather';
// const cities;
// TODO: Guess I'll need to pull in the list of cities via some API somehow after all

//const zipRe = /^\d{5}$/;
const zipRe = /^\d{5}(-\d{4})?(?!-)$/;

const locationInput = document.getElementById('locationInput');

const cityStateCountryInput = document.getElementById('cityStateCountryInput');
const zipInput = document.getElementById('zipCode');

const searchButton = document.getElementById('searchButton');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');

searchButton.addEventListener('click', () => {
    event.preventDefault();
    const location = locationInput.value;
    if (location) {
        fetchWeatherByGeo(location);
    }
});

const fetchGeo = async location => {
    let url;
    let geoData;
    const zipCode = zipRe.test(location);

    if (zipCode) {
        url = `${zipUrl}?zip=${location}&appid=${apiKey}`;
        // url = `${zipUrl}?zip=${location},${countryCode}&appid=${apiKey}`;
    } else {
        url = `${geoUrl}?q=${location}&limit=1&appid=${apiKey}`;
        // url = `${geoUrl}?q=${cityName},${stateName},${countryCode}&limit=${limit}&appid=${apiKey}`;
    };

    console.log(`ziptest: ${zipCode}`)
    console.log(`url: ${url}`)

    try {
        const geoResponse = await fetch(url, {method: "GET"});
        if (geoResponse.ok) {
            geoData = await geoResponse.json();

            if (!geoData.name) {
                return geoData[0];
            } else {
                return geoData;
            }
        }
    } catch(error) {
        console.log(error);
    }
    return geoData;
};

const fetchWeatherByGeo = async inputLocation => {
    let weatherData;
    let tempUnits;
    let unitIndicator;

    if (document.getElementById('celsius').checked) {
        tempUnits = 'metric';
        unitIndicator = 'C';
    }
    else if (document.getElementById('fahrenheit').checked) {
        tempUnits = 'imperial';
        unitIndicator = 'F';
    }
    else {
        tempUnits = 'standard';
        unitIndicator = 'K';
    }

    try {
        const fetchedGeoData = await fetchGeo(inputLocation);
        
        if (fetchedGeoData) {
            const weatherUrl = `${currentWeatherBaseUrl}?lat=${fetchedGeoData.lat}&lon=${fetchedGeoData.lon}&exclude=minutely&units=${tempUnits}&appid=${apiKey}`;

            console.log(`weatherUrl: ${weatherUrl}`)

            // Try to fetch the weather data
            const weatherResponse = await fetch(weatherUrl);
            if (weatherResponse.ok) {
                weatherData = await weatherResponse.json();
            }
            console.log(`Weather Data: ${weatherData.name}, ${Math.round(weatherData.main.temp)}°C, ${weatherData.weather[0].description}`)
            locationElement.textContent = weatherData.name;
            temperatureElement.textContent = `${Math.round(weatherData.main.temp)}°${unitIndicator}`;
            descriptionElement.textContent = weatherData.weather[0].description;
        }
    } catch(error) {
        console.log(error)
    }
};