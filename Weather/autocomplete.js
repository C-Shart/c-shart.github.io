const gn_username = 'tar_geonames';
const gn_url = 'http://api.geonames.org/postalCodeLookupJSON';

const autocompleteUrl = 'https://api.geoapify.com/v1/geocode/autocomplete';

function autocomplete(containerElement, callback) {
    let inputElement = document.createElement('input');
    let currentPromiseReject;

    inputElement.setAttribute('type', 'text');
    inputElement.setAttribute('placeholder', 'Enter a city or US zip code');
    containerElement.appendChild(inputElement);

    inputElement.addEventListener('input', function(e) {
        closeDropDownList();
        let currentValue = this.value;
        let currentItems;

        if (currentPromiseReject) {
            currentPromiseReject({ canceled: true});
        }

        if (!currentValue) {
            return false;
        }

        let promise = new Promise((resolve, reject) => {
            let apiKey = '96f166ff8faf4a0390893f1c75b4b2f1';
            let params = `?text=${encodeURIComponent(currentValue)}&limit=5&apikey=${apiKey}`;

            currentPromiseReject = reject;

            let url = `${autocompleteUrl}${params}`;

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
                    inputElement.value = currentItems[index].properties.formatted;
                    callback(currentItems[index]);
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
            let event = document.createEvent('Event');
            event('input', true, true);
            inputElement.dispatchEvent(event);
        }
    });

    inputElement.addEventListener('keydown', function(e) {
        let autocompleteItemsElement = containerElement.querySelector('.autocomplete-items');
        if (autocompleteItemsElement) {
            let itemElements = autocompleteITemsElement.getElementsByTagName('div');
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
                    inputElement.dispatchEvent(event);
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

        inputElement.value = currentItems[index].properties.formatted;
        callback(currentItems[index]);
    }

    function closeDropDownList() {
        let autocompleteItemsElement = containerElement.querySelector('.autocomplete-items');
        if (autocompleteItemsElement) {
            containerElement.removeChild(autocompleteItemsElement);
        }
        focusedItemIndex = -1;
    }
}


autocomplete(document.getElementById('autocomplete'), data => {
    console.log('Selected option: ');
    console.log(data);
});