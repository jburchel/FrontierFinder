import { dataService } from './dataService.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing search page...');
        
        // Initialize services
        await dataService.init();
        
        // Get form elements
        const countrySelect = document.getElementById('country');
        const upgSelect = document.getElementById('upg');
        const searchForm = document.getElementById('searchForm');
        
        // Add default option to country dropdown
        const defaultCountryOption = document.createElement('option');
        defaultCountryOption.value = '';
        defaultCountryOption.textContent = 'Select Country';
        countrySelect.appendChild(defaultCountryOption);
        
        // Add default option to UPG dropdown
        const defaultUPGOption = document.createElement('option');
        defaultUPGOption.value = '';
        defaultUPGOption.textContent = 'Select UPG';
        upgSelect.appendChild(defaultUPGOption);
        
        // Populate country dropdown
        console.log('Populating country dropdown...');
        const countries = dataService.getCountries();
        console.log('Countries received:', countries);
        
        if (countries.length === 0) {
            console.error('No countries found in the data');
            throw new Error('No countries available');
        }
        
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
        
        // Handle country selection
        countrySelect.addEventListener('change', () => {
            const selectedCountry = countrySelect.value;
            console.log('Country selected:', selectedCountry);
            
            // Reset UPG dropdown
            upgSelect.innerHTML = '';
            upgSelect.appendChild(defaultUPGOption.cloneNode(true));
            
            if (selectedCountry) {
                const upgs = dataService.getUPGsByCountry(selectedCountry);
                console.log('UPGs for country:', upgs);
                
                // Populate UPG dropdown
                upgs.forEach(upg => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify({
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
            }
        });
        
        // Handle form submission
        searchForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const selectedCountry = countrySelect.value;
            const selectedUPGData = upgSelect.value ? JSON.parse(upgSelect.value) : null;
            const radius = document.getElementById('radius').value;
            const unit = document.getElementById('unit').value;
            const searchType = document.getElementById('searchType').value;
            
            if (!selectedCountry || !selectedUPGData || !radius) {
                alert('Please fill in all required fields');
                return;
            }
            
            try {
                console.log('Submitting search with params:', {
                    country: selectedCountry,
                    upg: selectedUPGData,
                    radius,
                    unit,
                    searchType
                });
                
                // Store search parameters in session storage
                sessionStorage.setItem('searchParams', JSON.stringify({
                    country: selectedCountry,
                    upg: selectedUPGData,
                    radius: radius,
                    unit: unit,
                    searchType: searchType
                }));
                
                // Redirect to results page
                window.location.href = 'results.html';
            } catch (error) {
                console.error('Error during form submission:', error);
                alert('An error occurred while processing your request. Please try again.');
            }
        });
    } catch (error) {
        console.error('Error initializing search page:', error);
        alert('An error occurred while loading the page. Please refresh and try again.');
    }
});
