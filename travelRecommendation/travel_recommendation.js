// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    const resultsContainer = document.getElementById('results');

    // Store fetched data
    let travelData = null;

    // Fetch the JSON data
    fetch('travel_recommendation_api.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            travelData = data;
            console.log('Travel data loaded:', data); // Verification
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            resultsContainer.innerHTML = '<p style="color:red; padding:2rem;">Failed to load travel data. Please try again later.</p>';
        });

    // Search handler
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!travelData) {
            resultsContainer.innerHTML = '<p style="padding:2rem;">Data is still loading. Please wait...</p>';
            return;
        }
        const keyword = searchInput.value.trim().toLowerCase();
        if (keyword === '') return;
    
        let results = [];
    
        // NEW: show all countries if the user searches "country" or "countries"
        if (keyword === 'country' || keyword === 'countries') {
            travelData.countries.forEach(country => {
                results = results.concat(country.cities);
            });
        }
        // Check for beach keyword
        else if (keyword.includes('beach')) {
            results = travelData.beaches;
        }
        // Check for temple keyword
        else if (keyword.includes('temple')) {
            results = travelData.temples;
        }
        // Check for specific country matches
        else {
            for (const country of travelData.countries) {
                if (country.name.toLowerCase().includes(keyword)) {
                    results = results.concat(country.cities);
                }
            }
        }
    
        displayResults(results, keyword);
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        resultsContainer.innerHTML = '';
        searchInput.value = '';
    });

    // Function to display results
    function displayResults(items, keyword) {
        if (!items || items.length === 0) {
            resultsContainer.innerHTML = '<p style="padding:2rem; color:#fff;">No recommendations found for your search. Try "beach", "temple", or a country name.</p>';
            return;
        }

        let html = '';
        items.forEach(item => {
            html += `
                <div class="result-card">
                    <img src="${item.imageUrl}" alt="${item.name}">
                    <div class="info">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        ${getTimeHTML(item.name, keyword)}
                    </div>
                </div>
            `;
        });
        resultsContainer.innerHTML = html;
    }

    // Optional: Display local time for country recommendations
    function getTimeHTML(placeName, keyword) {
        // Only show time if keyword was a country name
        if (!keyword) return '';
        const lowerPlace = placeName.toLowerCase();
        // Map city names to timezones (simplified)
        const timezoneMap = {
            'sydney': 'Australia/Sydney',
            'melbourne': 'Australia/Melbourne',
            'tokyo': 'Asia/Tokyo',
            'kyoto': 'Asia/Tokyo',
            'rio de janeiro': 'America/Sao_Paulo',
            'são paulo': 'America/Sao_Paulo'
        };

        let timezone = null;
        for (const [city, tz] of Object.entries(timezoneMap)) {
            if (lowerPlace.includes(city)) {
                timezone = tz;
                break;
            }
        }

        if (timezone) {
            const options = { timeZone: timezone, hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
            try {
                const localTime = new Date().toLocaleTimeString('en-US', options);
                return `<p class="time-display">🕒 Local time: ${localTime}</p>`;
            } catch (e) {
                return '';
            }
        }
        return '';
    }
});