import { dataService } from './dataService.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await dataService.init();
        await initializeSearchForm();
    } catch (error) {
        console.error('Error initializing search page:', error);
    }
});

async function initializeSearchForm() {
    const countrySelect = document.getElementById('country');
    const upgSelect = document.getElementById('upg');
    
    try {
        const countries = await dataService.getCountries();
        
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
            const upgs = await dataService.getUPGsForCountry(selectedCountry);
            
            // Clear existing options
            upgSelect.innerHTML = '';
            
            // Add new options
            upgs.forEach(upg => {
                const option = document.createElement('option');
                option.value = upg.id;
                option.textContent = upg.name;
                upgSelect.appendChild(option);
            });
        });

        // Handle form submission
        const searchForm = document.querySelector('form');
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const selectedUPG = await dataService.getUPGById(upgSelect.value);
            if (!selectedUPG) {
                alert('Please select a UPG');
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
        });
    } catch (error) {
        console.error('Error setting up search form:', error);
    }
}
