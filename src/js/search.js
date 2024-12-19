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
                
                // Add new options
                upgs.forEach(upg => {
                    const option = document.createElement('option');
                    option.value = upg.id;
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
            
            if (!upgSelect.value) {
                alert('Please select a UPG');
                return;
            }

            try {
                const selectedUPG = await dataService.getUPGById(upgSelect.value);
                if (!selectedUPG) {
                    alert('Selected UPG not found');
                    return;
                }

                const searchParams = {
                    upg: selectedUPG,
                    radius: document.getElementById('radius').value,
                    unit: document.querySelector('input[name="unit"]:checked').value,
                    searchType: document.getElementById('searchType').value
                };

                // Store search parameters
                sessionStorage.setItem('searchParams', JSON.stringify(searchParams));
                
                // Navigate to results page
                window.location.href = 'results.html';
            } catch (error) {
                console.error('Error during search:', error);
                alert('Error processing search. Please try again.');
            }
        });
    } catch (error) {
        console.error('Error setting up search form:', error);
        alert('Error setting up the search form. Please refresh the page.');
    }
}
