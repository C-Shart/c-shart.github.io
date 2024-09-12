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
    const location = locationInput.value;
    if (location) {
        fetchWeatherByGeo(location);
    }
});

async function fetchGeo(location) {
    var url;

    zipCode = zipRe.test(location)

    if (zipCode) {
        url = `${zipUrl}?zip=${location}&appid=${apiKey}`;
        // url = `${zipUrl}?zip=${location},${countryCode}&appid=${apiKey}`;
    } else {
        url = `${geoUrl}?q=${location}&limit=1&appid=${apiKey}`;
        // url = `${geoUrl}?q=${cityName},${stateName},${countryCode}&limit=${limit}&appid=${apiKey}`;
    };

    console.log(`ziptest: ${zipCode}`)
    console.log(`url: ${url}`)

    geoResponse = await fetch(url);
    geoData = await geoResponse.json();

    console.log(`geoData: ${geoData}`)

    return geoData

    /* 
    return fetch(url)
        .then((geoResponse) => geoResponse.json())
        .then((data) => console.log(data))
        .catch((error) => {
            console.error('Error fetching geo data:', error);
        });
    */
}

async function fetchWeatherByGeo(inputLocation) {
    const fetchedGeoData = await fetchGeo(inputLocation);
    const weatherUrl = `${currentWeatherBaseUrl}?lat=${fetchedGeoData.lat}&lon=${fetchedGeoData.long}&exclude=minutely&units=metric&appid=${apiKey}`;

    console.log(`weatherUrl: ${weatherUrl}`)

    weatherResponse = await fetch(weatherUrl);
    weatherData = await weatherResponse.json();

    console.log(`Weather Data: ${weatherData.name}, ${Math.round(weatherData.main.temp)}°C, ${weatherData.weather[0].description}`)

    /* locationElement.textContent = weatherData.name;
    temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
    descriptionElement.textContent = data.weather[0].description;

    fetch(weatherUrl)
        .then((response) => response.json())
        .then((weatherData) => {
            locationElement.textContent = weatherData.name;
            temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
            descriptionElement.textContent = data.weather[0].description;
        })
        .catch((error) => {
            console.error('Error fetching weather data:', error);
            console.error('HTTP Response:', response?.status);
        }); */
}

// Autocomplete function stuff, currently non functional

/*
function autocomplete(input, cities) {
    var currentFocus;

    input.addEventListener("input", function(e) {
        var autocompleteDiv, matchDiv, i, val = this.value;
        closeAllLists();

        if (!val) { return false;}
        currentFocus = -1;

        // Creates a div that contains the values
        autocompleteDiv = document.createElement("DIV");
        autocompleteDiv.setAttribute("id", this.id + "autocomplete-list");
        autocompleteDiv.setAttribute("class", "autocomplete-items");

        // Appends div as child of the autocomplete container
        this.parentNode.appendChild(autocompleteDiv);

        for (i = 0; i < cities.length; i++) {
            if (cities[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {

                matchDiv = document.createElement("DIV");
                matchDiv.innerHTML = "<strong>" + cities[i].substr(0, val.length) + "</strong>";
                matchDiv.innerHTML += cities[i].substr(val.length);

                // Inserts input field that holds the current array item's value:
                matchDiv.innerHTML += "<input type='hidden' value='" + cities[i] + "'>";

                // Inserts value when clicked & closes the list
                matchDiv.addEventListener("click", function(e) {
                    input.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });
                autocompleteDiv.appendChild(matchDiv);
            }
        }
    });

    // keypress function
    input.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        // press DOWN
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        // press UP
        } else if (e.keyCode == 38) { //up
            currentFocus--;
            addActive(x);
        // press ENTER (simulate click)
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });

    // Classifies item as active
    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != input) {
            x[i].parentNode.removeChild(x[i]);
        }
    }
}

document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}

autocomplete(document.getElementById("locationInput"), cities);
*/