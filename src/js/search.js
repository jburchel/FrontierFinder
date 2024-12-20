import { dataService } from './dataService.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await dataService.init();
        await initializeSearchForm();
    } catch (error) {
        console.error('Error initializing search page:', error);
        alert('Error loading the search page. Please try refreshing.');
    }
});

async function initializeSearchForm() {
    const countrySelect = document.getElementById('country');
    const upgSelect = document.getElementById('upg');
    
    try {
        // Add default options
        countrySelect.innerHTML = '<option value="">Select Country</option>';
        upgSelect.innerHTML = '<option value="">Select UPG</option>';

        const countries = await dataService.getCountries();
        console.log('Countries loaded:', countries);
        
        // Populate country dropdown
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });

        // Handle country selection
        countrySelect.addEventListener('change', async () => {
            const selectedCountry = countrySelect.value;
            upgSelect.innerHTML = '<option value="">Select UPG</option>';
            
            if (!selectedCountry) return;

            try {
                const upgs = await dataService.getUPGsForCountry(selectedCountry);
                console.log('UPGs loaded for', selectedCountry, ':', upgs);
                
                upgs.forEach(upg => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify({
                        id: upg.id,
                        name: upg.name,
                        latitude: upg.latitude,
                        longitude: upg.longitude
                    });
                    option.textContent = upg.name;
                    if (upg.pronunciation) {
                        option.textContent += ` (${upg.pronunciation})`;
                    }
                    upgSelect.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading UPGs:', error);
                alert('Error loading UPGs for the selected country.');
            }
        });

        // Handle form submission
        const searchForm = document.querySelector('form');
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const selectedUPGData = upgSelect.value;
            if (!selectedUPGData) {
                alert('Please select a UPG');
                return;
            }

            try {
                const selectedUPG = JSON.parse(selectedUPGData);
                const radius = document.getElementById('radius').value;
                const unit = document.querySelector('input[name="unit"]:checked').value;
                const type = document.getElementById('searchType').value;

                // Build URL with search parameters
                const params = new URLSearchParams({
                    country: countrySelect.value,
                    upg: selectedUPG.id,
                    name: selectedUPG.name,
                    lat: selectedUPG.latitude,
                    lng: selectedUPG.longitude,
                    radius: radius,
                    unit: unit,
                    type: type
                });

                // Navigate to results page with parameters
                window.location.href = `results.html?${params.toString()}`;
            } catch (error) {
                console.error('Error during search:', error);
                alert('Error processing search: ' + error.message);
            }
        });
    } catch (error) {
        console.error('Error setting up search form:', error);
        alert('Error setting up the search form. Please refresh the page.');
    }
}
