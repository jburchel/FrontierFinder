document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize services
        await dataService.init();
        
        // Get form elements
        const countrySelect = document.getElementById('country');
        const upgSelect = document.getElementById('upg');
        const searchForm = document.getElementById('searchForm');
        
        // Populate country dropdown
        const countries = dataService.getCountries();
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
        
        // Handle country selection
        countrySelect.addEventListener('change', () => {
            const selectedCountry = countrySelect.value;
            const upgs = dataService.getUPGsByCountry(selectedCountry);
            
            // Clear and populate UPG dropdown
            upgSelect.innerHTML = '';
            upgs.forEach(upg => {
                const option = document.createElement('option');
                option.value = JSON.stringify({
                    name: upg.name,
                    latitude: upg.latitude,
                    longitude: upg.longitude
                });
                
                // Create container for name and pronunciation
                const container = document.createElement('div');
                container.textContent = upg.name;
                container.appendChild(
                    pronunciationService.createPronunciationElement(
                        upg.name,
                        upg.pronunciation
                    )
                );
                
                option.appendChild(container);
                upgSelect.appendChild(option);
            });
        });
        
        // Handle form submission
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const selectedUPG = JSON.parse(upgSelect.value);
            const radius = document.getElementById('radius').value;
            const unit = document.querySelector('input[name="unit"]:checked').value;
            
            // Store search parameters in sessionStorage
            sessionStorage.setItem('searchParams', JSON.stringify({
                upg: selectedUPG,
                radius,
                unit
            }));
            
            // Navigate to results page
            window.location.href = 'results.html';
        });
    } catch (error) {
        console.error('Error initializing search page:', error);
        // Show user-friendly error message
        alert('An error occurred while loading the page. Please try again later.');
    }
});
