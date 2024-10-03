const apiKey = 'cab56abc71dba88a54826e3b27a6bb68'; // TODO: update & hide key, delete this one
const geoUrl = 'https://api.openweathermap.org/geo/1.0/direct'
const zipUrl = 'https://api.openweathermap.org/geo/1.0/zip';
const currentWeatherBaseUrl = 'https://api.openweathermap.org/data/2.5/weather';
const autocompleteUrl = 'https://api.geoapify.com/v1/geocode/autocomplete';

const zipRe = /^\d{5}(-\d{4})?(?!-)$/;

const locationInput = document.getElementById('locationInput');
const inputContainer = document.getElementById('inputContainer');

const cityStateCountryInput = document.getElementById('cityStateCountryInput');
const zipInput = document.getElementById('zipCode');

const searchButton = document.getElementById('searchButton');
const locationElement = document.getElementById('location');
const coordinatesElement = document.getElementById('coordinates');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');

let cityName;
let stateName;
let countryCode;
let postCode;

autoSuggestions(inputContainer, (data) => {});

searchButton.addEventListener('click', () => {
    event.preventDefault();
    let location = locationInput.value;

    try {
        console.log(location);
        fetchWeatherByGeo(location);
        
        cityName = undefined;
        stateName = undefined;
        countryCode = undefined;
        postCode = undefined;

        autoSuggestions.closeDropDownList();            // TODO: troubleshoot
    } catch(error) {
        console.log(error);
    }
});

function buildPreciseUrl(input) {
    let url;
    let limit = 1;

    if (cityName && stateName && countryCode) {
        url = encodeURI(`${geoUrl}?q=${cityName},${stateName},${countryCode}&limit=${limit}&appid=${apiKey}`);
    } else if (postCode) {
        url = encodeURI(`${zipUrl}?zip=${postCode},${countryCode}&appid=${apiKey}`);
    }
    else {
        throw new Error('Error');
    }

    return url;
}

function buildGeoUrlRetry(city, state, country) {
    let url;
    let limit = 1;

    city = cityName;
    state = stateName;
    country = countryCode;

    url = encodeURI(`${geoUrl}?q=${cityName},${stateName},${countryCode}&limit=${limit}&appid=${apiKey}`);

    return url;
}

const fetchGeo = async location => {
    let url;
    let geoData;
    const usZipCode = zipRe.test(location);

    console.log(`postCode: ${postCode}`);

    if (usZipCode) {
        url = `${zipUrl}?zip=${encodeURI(location)}&appid=${apiKey}`;
    } else if (!postCode && !cityName && !stateName && !countryCode) {
        url = `${geoUrl}?q=${encodeURI(location)}&limit=1&appid=${apiKey}`;
    } else {
        url = buildPreciseUrl();
    };

    console.log(`geo url: ${url}`)

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
            const latitude = fetchedGeoData.lat;
            const longitude = fetchedGeoData.lon;
            const weatherUrl = `${currentWeatherBaseUrl}?lat=${latitude}&lon=${longitude}&exclude=minutely&units=${tempUnits}&appid=${apiKey}`;

            const displayedState = stateName ? stateName : fetchedGeoData.state;

            console.log(`weatherUrl: ${weatherUrl}`)

            // Try to fetch the weather data
            const weatherResponse = await fetch(weatherUrl);
            if (weatherResponse.ok) {
                weatherData = await weatherResponse.json();
            }
            console.log(`Weather Data: ${weatherData.name}, ${Math.round(weatherData.main.temp)}°C, ${weatherData.weather[0].description}`)

            // locationElement.textContent = `${weatherData.name}, ${fetchedGeoData.state}`;
            locationElement.textContent = `${weatherData.name}, ${displayedState}`;
            coordinatesElement.textContent = `lat: ${latitude}, long: ${longitude}`;
            temperatureElement.textContent = `${Math.round(weatherData.main.temp)}° ${unitIndicator}`;
            descriptionElement.textContent = weatherData.weather[0].description;

            changeBackgroundImage(weatherData.weather[0].icon)
        }
    } catch(error) {
        console.log(error)
    }
};

function changeBackgroundImage(weather) {
    let weatherDoge;
    switch (weather) {
        case '03d':
        case '03n':
            weatherDoge = 'cloudy';
            break;
        case '50d':
        case '50n':
            weatherDoge = 'foggy';
            break;
        case '11d':
        case '11n':
            weatherDoge = 'lightning';
            break;
        case '04d':
        case '04n':
            weatherDoge = 'overcast';
            break;
        case '02d':
        case '02n':
            weatherDoge = 'partly_cloudy';
            break;
        case '09d':
        case '09n':
        case '10d':
        case '10n':
            weatherDoge = 'rainy';
            break;
        case '13d':
        case '13n':
            weatherDoge = 'snowy';
            break;
        case '01d':
        case '01n':
            weatherDoge = 'sunny';
            break;
    };

    document.body.style.backgroundImage = `url('weather_images/${weatherDoge}.jpg')`;
};

function autoSuggestions(containerElement, callback) {
    let currentPromiseReject;
    let currentItems;

    let inputElement = document.getElementById('locationInput');
    containerElement.appendChild(inputElement);

    inputElement.addEventListener('input', function(e) {
        closeDropDownList();
        let currentValue = this.value;

        if (currentPromiseReject) {
            currentPromiseReject({ canceled: true});
        }

        if (!currentValue) {
            return false;
        }

        let promise = new Promise((resolve, reject) => {
            let geoapifyKey = '96f166ff8faf4a0390893f1c75b4b2f1';
            let params = `?text=${encodeURIComponent(currentValue)}&limit=5&apiKey=${geoapifyKey}`;

            currentPromiseReject = reject;

            let url = `${autocompleteUrl}${params}`;
            console.log(url);

            fetch(url)
                .then(response => {
                    if (response.ok) {
                        response.json().then(data => resolve(data));
                    } else {
                        response.json().then(data => reject(data));
                    }
                });
        });

        promise.then(data => {
            currentItems = data.features;

            let autocompleteItemsElement = document.createElement('div');
            autocompleteItemsElement.setAttribute('class', 'autocomplete-items');
            containerElement.appendChild(autocompleteItemsElement);
            
            data.features.forEach((feature, index) => {
                let itemElement = document.createElement('DIV');
                itemElement.innerHTML = feature.properties.formatted;

                itemElement.addEventListener('click', function(e) {
                    setInputValue(currentItems[index]);
                    closeDropDownList();
                });

                autocompleteItemsElement.appendChild(itemElement);
            });
        }, err => {
            if (!err.canceled) {
                console.log(err);
            }
        });

        if (e.target !== inputElement) {
            closeDropDownList();
        } 
        else if (!containerElement.querySelector('.autocomplete-items')) {
            const inputEvent = new Event('input', {'bubbles': true, 'cancelable': true});
            document.dispatchEvent(inputEvent);

        }
    });

    containerElement.addEventListener('keydown', function(e) {
        let autocompleteItemsElement = containerElement.querySelector('.autocomplete-items');
        if (autocompleteItemsElement) {
            let itemElements = autocompleteItemsElement.getElementsByTagName('div');
            if (e.key == 'ArrowDown') {
                e.preventDefault();
                focusedItemIndex = focusedItemIndex !== itemElements.length - 1 ? focusedItemIndex + 1 : 0;
                setActive(itemElements, focusedItemIndex);
            }
            else if (e.key == 'ArrowUp') {
                e.preventDefault();
                focusedItemIndex = focusedItemIndex !== 0 ? focusedItemIndex - 1 : focusedItemIndex = (itemElements.length - 1);
                setActive(itemElements, focusedItemIndex);
            }
            else if (e.key == 'Enter') {
                e.preventDefault();
                if (focusedItemIndex > -1) {
                    closeDropDownList();
                }
            }
            else {
                if (e.key == 'ArrowDown') {
                    let event = document.createEvent('Event');
                    event('input', true, true);
                    containerElement.dispatchEvent(event);
                }
            }
        }
    });

    function setActive(items, index) {
        if (!items || !items.length) return false;

        for (var i=0; i < items.length; i++) {
            items[i].classList.remove('autocomplete-active');
        }
        items[index].classList.add('autocomplete-active');
        setInputValue(currentItems[index]);
    }

    function closeDropDownList() {
        let autocompleteItemsElement = containerElement.querySelector('.autocomplete-items');
        if (autocompleteItemsElement) {
            containerElement.removeChild(autocompleteItemsElement);
        }
        focusedItemIndex = -1;
    }

    function setInputValue(item) {
        inputElement.value = item.properties.formatted;

        cityName = item.properties.city;
        stateName = item.properties.state;
        countryCode = item.properties.country_code;
        postCode = item.properties.postcode;

        console.log(`setInputValue > ${cityName}, ${stateName}, ${countryCode}, ${postCode}`)

        callback(item);
    }
}