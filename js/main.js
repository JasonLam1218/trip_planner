document.addEventListener('DOMContentLoaded', function() {
    // --- Username display and login protection ---
    let username = localStorage.getItem('tripPlannerUser') || sessionStorage.getItem('tripPlannerUser');
    if (!username) {
        window.location.href = 'login.html';
        return;
    }
    const mainUsername = document.getElementById('main-username');
    if (mainUsername) mainUsername.textContent = username;

    // --- Logout button ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('tripPlannerUser');
            sessionStorage.removeItem('tripPlannerUser');
            window.location.href = 'login.html';
        });
    }

    // --- New Trip Button Navigation ---
    const newTripBtn = document.querySelector('.new-trip-btn');
    if (newTripBtn) {
        newTripBtn.addEventListener('click', function() {
            window.location.href = 'itinerary.html';
        });
    }

    // --- Editable Checklist Feature ---
    const DEFAULT_CHECKLIST = [
        "Passport", "Medications", "Travel Insurance", "Tickets/Itinerary",
        "Electronics", "Chargers", "Clothes", "Money/Cards"
    ];
    function getChecklist() {
        const stored = localStorage.getItem('checklistItems');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {}
        }
        return [...DEFAULT_CHECKLIST];
    }
    function saveChecklist(list) {
        localStorage.setItem('checklistItems', JSON.stringify(list));
    }
    function renderChecklist() {
        const checklist = getChecklist();
        const list = document.getElementById('checklist-items');
        if (!list) return;
        list.innerHTML = '';
        checklist.forEach((item, idx) => {
            const li = document.createElement('li');
            li.className = 'checklist-row';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'checklist-checkbox';
            checkbox.id = `check-${idx}`;
            const label = document.createElement('label');
            label.className = 'checklist-label';
            label.htmlFor = `check-${idx}`;
            label.textContent = item;
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.type = 'button';
            delBtn.className = 'delete-checklist-item';
            delBtn.onclick = () => {
                const current = getChecklist();
                current.splice(idx, 1);
                saveChecklist(current);
                renderChecklist();
            };
            li.appendChild(checkbox);
            li.appendChild(label);
            li.appendChild(delBtn);
            list.appendChild(li);
        });
    }
    // Add new item logic
    const addChecklistBtn = document.getElementById('add-checklist-item');
    if (addChecklistBtn) {
        addChecklistBtn.onclick = function() {
            const input = document.getElementById('new-checklist-item');
            if (!input) return;
            const value = input.value.trim();
            if (value) {
                const current = getChecklist();
                current.push(value);
                saveChecklist(current);
                input.value = '';
                renderChecklist();
            }
        };
    }
    const checklistInput = document.getElementById('new-checklist-item');
    if (checklistInput) {
        checklistInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                if (addChecklistBtn) addChecklistBtn.click();
                e.preventDefault();
            }
        });
    }
    // Initial render
    renderChecklist();

    // --- Location Search with Autocomplete and Place Card Update ---
    const geoapifyApiKey = '3093a86a55c04f38a88f76f5b7e3341d'; // Geoapify
    const pexelsApiKey = '3ALWgUIgB3TKe9XKjiHc7PnviX2JLZFf5saoKL0HCDZMVJYOZWaSvRKi'; // Pexels
    const searchInput = document.getElementById('location-search');
    const autocompleteResults = document.getElementById('autocomplete-results');
    const placeCards = document.querySelectorAll('.place-card');
    let currentSuggestions = [];
    let debounceTimer = null;
    if (searchInput && autocompleteResults) {
        searchInput.addEventListener('input', function() {
            const value = searchInput.value.trim();
            clearTimeout(debounceTimer);
            autocompleteResults.innerHTML = '';
            autocompleteResults.style.display = 'none';
            if (value.length < 2) return;
            debounceTimer = setTimeout(() => {
                fetchAutocompleteSuggestions(value);
            }, 250);
        });
        async function fetchAutocompleteSuggestions(query) {
            const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&apiKey=${geoapifyApiKey}`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    console.error("Autocomplete API error:", response.status, response.statusText);
                    return;
                }
                const data = await response.json();
                currentSuggestions = data.features;
                renderAutocomplete(currentSuggestions);
            } catch (err) {
                console.error("Autocomplete fetch error:", err);
            }
        }
        function renderAutocomplete(suggestions) {
            autocompleteResults.innerHTML = '';
            if (!suggestions.length) {
                autocompleteResults.style.display = 'none';
                return;
            }
            // Style the container for better appearance
            autocompleteResults.style.display = 'block';
            autocompleteResults.style.background = '#fff';
            autocompleteResults.style.border = '1px solid #ccc';
            autocompleteResults.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            autocompleteResults.style.position = 'absolute';
            autocompleteResults.style.zIndex = '1000';
            autocompleteResults.style.width = searchInput.offsetWidth + 'px';
            suggestions.forEach((feature) => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = feature.properties.formatted;
                item.style.padding = '10px 16px';
                item.style.cursor = 'pointer';
                item.style.borderBottom = '1px solid #eee';
                item.addEventListener('mouseover', () => {
                    item.style.background = '#f5f5f5';
                });
                item.addEventListener('mouseout', () => {
                    item.style.background = '#fff';
                });
                item.addEventListener('click', () => {
                    searchInput.value = feature.properties.formatted;
                    autocompleteResults.innerHTML = '';
                    autocompleteResults.style.display = 'none';
                    handleLocationSelect(feature);
                });
                autocompleteResults.appendChild(item);
            });
            // Remove last border
            if (autocompleteResults.lastChild) {
                autocompleteResults.lastChild.style.borderBottom = 'none';
            }
        }
        document.addEventListener('click', function(e) {
            if (!autocompleteResults.contains(e.target) && e.target !== searchInput) {
                autocompleteResults.style.display = 'none';
            }
        });
    }
    // --- Fetch Places and Images from Geoapify and Pexels ---
    async function handleLocationSelect(feature) {
        const [lon, lat] = feature.geometry.coordinates;
        const placesUrl = `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:${lon},${lat},10000&limit=${placeCards.length}&apiKey=${geoapifyApiKey}`;
        let places = [];
        try {
            const response = await fetch(placesUrl);
            if (!response.ok) throw new Error("Places API error");
            const data = await response.json();
            places = data.features || [];
        } catch (e) {
            console.error("Geoapify Places fetch error:", e);
        }
        await Promise.all(Array.from(placeCards).map(async (card, idx) => {
            const place = places[idx];
            card.innerHTML = '';
            if (place) {
                const name = place.properties.name || place.properties.address_line1 || place.properties.street || "Unknown Place";
                const address = place.properties.formatted || '';
                let imgUrl = await fetchPexelsImage(name);
                if (!imgUrl && place.properties.datasource && place.properties.datasource.raw && place.properties.datasource.raw.image) {
                    imgUrl = place.properties.datasource.raw.image;
                }
                if (!imgUrl) {
                    imgUrl = "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&w=600";
                }
                const img = document.createElement('img');
                img.src = imgUrl;
                img.alt = name;
                const title = document.createElement('h3');
                title.textContent = name;
                const addrDiv = document.createElement('div');
                addrDiv.className = 'place-country';
                addrDiv.textContent = address;
                card.appendChild(img);
                card.appendChild(title);
                card.appendChild(addrDiv);
            } else {
                const img = document.createElement('img');
                img.src = "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&w=600";
                img.alt = "No place";
                const title = document.createElement('h3');
                title.textContent = "No place found";
                card.appendChild(img);
                card.appendChild(title);
            }
        }));
        // Fetch weather for the selected location
        fetchWeather(lat, lon);
        // Money conversion: get country/currency from feature
        const country = getCountryFromFeature(feature);
        const toCurrency = getCurrencyCode(country);
        fetchMoneyConversion('HKD', toCurrency);
    }
    async function fetchPexelsImage(query) {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
        try {
            const response = await fetch(url, {
                headers: { Authorization: pexelsApiKey }
            });
            if (!response.ok) throw new Error('Image fetch failed');
            const data = await response.json();
            if (data.photos && data.photos.length > 0) {
                return data.photos[0].src.landscape || data.photos[0].src.medium;
            }
        } catch (e) {}
        return null;
    }
    // --- Initial load: show random popular places ---
    const randomLocations = [
        { name: "Bali", country: "Indonesia" },
        { name: "Maldives", country: "Maldives" },
        { name: "Santorini", country: "Greece" },
        { name: "Cappadocia", country: "Turkey" },
        { name: "Kyoto", country: "Japan" },
        { name: "Paris", country: "France" },
        { name: "Banff", country: "Canada" },
        { name: "Rome", country: "Italy" },
        { name: "Barcelona", country: "Spain" },
        { name: "Queenstown", country: "New Zealand" }
    ];
    function getRandomUniqueLocations(count) {
        const arr = [...randomLocations];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.slice(0, count);
    }
    async function fetchLocationImage(locationName) {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(locationName)}&per_page=1`;
        try {
            const response = await fetch(url, {
                headers: { Authorization: pexelsApiKey }
            });
            if (!response.ok) throw new Error('Image fetch failed');
            const data = await response.json();
            if (data.photos && data.photos.length > 0) {
                return data.photos[0].src.landscape || data.photos[0].src.medium;
            }
        } catch (e) {}
        return "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&w=600";
    }
    async function showRandomPlaceCards() {
        if (!placeCards.length) return;
        const uniqueLocations = getRandomUniqueLocations(placeCards.length);
        await Promise.all(Array.from(placeCards).map(async (placeCard, idx) => {
            const location = uniqueLocations[idx] || getRandomUniqueLocations(1)[0];
            const imageUrl = await fetchLocationImage(location.name);
            placeCard.innerHTML = '';
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = location.name;
            const title = document.createElement('h3');
            title.textContent = location.name;
            const country = document.createElement('div');
            country.className = 'place-country';
            country.textContent = location.country;
            placeCard.appendChild(img);
            placeCard.appendChild(title);
            placeCard.appendChild(country);
        }));
    }
    showRandomPlaceCards();

    // --- Weather Widget: Next 3 Days Forecast ---
    const weatherWidget = document.getElementById('weather-widget');
    const weatherApiKey = '3e9b51742505c6f63606c48611fcfbdb'; // <-- Replace with your OpenWeatherMap API key
    const defaultLat = 22.302711; // Hong Kong latitude
    const defaultLon = 114.177216; // Hong Kong longitude

    async function fetchWeather(lat, lon) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Weather API error:', response.status, errorText);
                throw new Error('Weather API error');
            }
            const data = await response.json();
            // Group by date
            const days = {};
            data.list.forEach(item => {
                const date = item.dt_txt.split(' ')[0];
                if (!days[date]) days[date] = [];
                days[date].push(item);
            });
            // Get next 3 *future* days (skip today if partial)
            const today = new Date().toISOString().split('T')[0];
            const allDates = Object.keys(days).filter(d => d > today);
            const next3 = allDates.slice(0, 3).map(date => {
                const temps = days[date].map(i => i.main.temp);
                const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
                // Find the most frequent weather description for the day
                const weatherCounts = {};
                days[date].forEach(i => {
                    const desc = i.weather[0].description;
                    weatherCounts[desc] = (weatherCounts[desc] || 0) + 1;
                });
                const weather = Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0][0];
                return { date, avgTemp, weather };
            });
            renderWeather(next3);
        } catch (e) {
            console.error('Failed to load weather:', e);
            weatherWidget.textContent = 'Failed to load weather.';
        }
    }

    function renderWeather(days) {
        if (!days.length) {
            weatherWidget.innerHTML = 'No forecast available.';
            return;
        }
        weatherWidget.innerHTML = days.map(day =>
            `<div><strong>${day.date}</strong>: ${day.weather}, ${day.avgTemp}°C</div>`
        ).join('');
    }

    // --- Money Conversion Widget: Today's Rate ---
    const moneyWidget = document.getElementById('money-widget');
    // Helper: Map country to currency code (expand as needed)
    const countryToCurrency = {
        'Hong Kong': 'HKD',
        'China': 'CNY',
        'Japan': 'JPY',
        'France': 'EUR',
        'Turkey': 'TRY',
        'Greece': 'EUR',
        'United States': 'USD',
        'Italy': 'EUR',
        'Spain': 'EUR',
        'Canada': 'CAD',
        'New Zealand': 'NZD',
        'Maldives': 'MVR',
        'Indonesia': 'IDR',
        'Afghanistan': 'AFN',
        'Albania': 'ALL',
        'Algeria': 'DZD',
        'Thailand': 'THB',
        'Taiwan': 'TWD',
        'Vietnam': 'VND',
        'Philippines': 'PHP',
        'Malaysia': 'MYR',
        'Singapore': 'SGD',
        'Indonesia': 'IDR',
        'India': 'INR',
        'Angola': 'AOA',
        'Argentina': 'ARS',
        'Australia': 'AUD',
        'Aruba': 'AWG',
        'Azerbaijan': 'AZN',
        'Bahamas': 'BSD',
        'Bahrain': 'BHD',
        'Bangladesh': 'BDT',
        'Barbados': 'BBD',
        'Belarus': 'BYN',
        'Belize': 'BZD',
        'Benin': 'XOF',
        'Bermuda': 'BMD',
        'Bhutan': 'BTN',
        'Bolivia (Plurinational State of)': 'BOB',
        'Bosnia and Herzegovina': 'BAM',
        'Botswana': 'BWP',
        'Brazil': 'BRL',
        'Brunei Darussalam': 'BND',
        'Bulgaria': 'BGN',
        'Burundi': 'BIF',
        'Cabo Verde': 'CVE',
        'Cambodia': 'KHR',
        'Cameroon': 'XAF',
        'Cayman Islands': 'KYD',
        'Chile': 'CLP',
        'Colombia': 'COP',
        'Comoros': 'KMF',
        'Congo (The Democratic Republic of the)': 'CDF',
        'Costa Rica': 'CRC',
        'Cuba': 'CUP',
        'Curaçao': 'ANG',
        'Czech Republic (The)': 'CZK',
        'Denmark': 'DKK',
        'Djibouti': 'DJF',
        'Dominica': 'XCD',
        'Dominican Republic (The)': 'DOP',
        'Egypt': 'EGP',
        'El Salvador': 'SVC',
        'Eritrea': 'ERN',
        'Ethiopia': 'ETB',
        'Fiji': 'FJD',
        'Gabon': 'XAF',
        'Gambia (The)': 'GMD',
        'Georgia': 'GEL',
        'Ghana': 'GHS',
        'Gibraltar': 'GIP',
        // End of additional countries
    };
    // Helper: Extract country from Geoapify feature
    function getCountryFromFeature(feature) {
        // Try to get the most specific country name
        return feature.properties.country || feature.properties.country_code || '';
    }
    // Helper: Get currency code from country name
    function getCurrencyCode(country) {
        // Try direct match, fallback to HKD
        return countryToCurrency[country] || 'HKD';
    }
    async function fetchMoneyConversion(fromCurrency, toCurrency) {
        if (!moneyWidget) return;
        const url = `https://api.currencylayer.com/live?access_key=8a54059f70c4cc6a4fc53344c3e49b0c&currencies=${toCurrency},HKD`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Money API error:', response.status, errorText);
                moneyWidget.innerHTML = `Error: ${response.status} - ${errorText}`;
                throw new Error('Money API error');
            }
            const data = await response.json();

            if (data && data.success && data.quotes) {
                const usdToTargetRate = data.quotes[`USD${toCurrency}`];
                const usdToHkdRate = data.quotes['USDHKD'];

                if (usdToTargetRate && usdToHkdRate) {
                    const hkdToUsdRate = 1 / usdToHkdRate;
                    const hkdToTargetRate = hkdToUsdRate * usdToTargetRate;
                    moneyWidget.innerHTML = `1 ${fromCurrency} = ${hkdToTargetRate.toFixed(2)} ${toCurrency} (today)`;
                } else {
                    moneyWidget.innerHTML = `Rates not available for ${fromCurrency} or ${toCurrency}.`;
                }
            } else {
                moneyWidget.innerHTML = `No conversion rate available. API Response: ${data.error ? data.error.info : JSON.stringify(data)}.`;
            }
        } catch (e) {
            console.error('Failed to load money conversion:', e);
            moneyWidget.innerHTML = 'Failed to load conversion.';
        }
    }
    // Call money conversion on initial load (default HKD to HKD)
    fetchMoneyConversion('HKD', 'HKD');
});
