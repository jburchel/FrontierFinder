document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize services
        await dataService.init();
        
        // Get search parameters from sessionStorage
        const searchParams = JSON.parse(sessionStorage.getItem('searchParams'));
        if (!searchParams) {
            window.location.href = 'index.html';
            return;
        }
        
        const { upg, radius, unit } = searchParams;
        
        // Find groups within radius
        const groups = dataService.findGroupsWithinRadius(
            upg.latitude,
            upg.longitude,
            radius,
            unit
        );
        
        // Get filter elements
        const sortSelect = document.getElementById('sortCriteria');
        const languageFilter = document.getElementById('languageFilter');
        const religionFilter = document.getElementById('religionFilter');
        const typeFilter = document.getElementById('typeFilter');
        const evangelicalFilter = document.getElementById('evangelicalPercent');
        
        // Populate filter dropdowns
        const languages = [...new Set(groups.map(g => g.language))].sort();
        const religions = [...new Set(groups.map(g => g.religion))].sort();
        
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang;
            languageFilter.appendChild(option);
        });
        
        religions.forEach(rel => {
            const option = document.createElement('option');
            option.value = rel;
            option.textContent = rel;
            religionFilter.appendChild(option);
        });
        
        // Function to filter and sort groups
        function updateResults() {
            let filteredGroups = groups;
            
            // Apply filters
            if (languageFilter.value) {
                filteredGroups = filteredGroups.filter(g => g.language === languageFilter.value);
            }
            if (religionFilter.value) {
                filteredGroups = filteredGroups.filter(g => g.religion === religionFilter.value);
            }
            if (typeFilter.value) {
                filteredGroups = filteredGroups.filter(g => g.type === typeFilter.value);
            }
            if (evangelicalFilter.value) {
                filteredGroups = filteredGroups.filter(g => 
                    parseFloat(g.evangelical) <= parseFloat(evangelicalFilter.value)
                );
            }
            
            // Sort groups
            const sortBy = sortSelect.value;
            filteredGroups.sort((a, b) => {
                switch (sortBy) {
                    case 'distance':
                        return a.distance - b.distance;
                    case 'population':
                        return parseInt(b.population) - parseInt(a.population);
                    case 'language':
                        return a.language.localeCompare(b.language);
                    case 'religion':
                        return a.religion.localeCompare(b.religion);
                    case 'type':
                        return a.type.localeCompare(b.type);
                    default:
                        return 0;
                }
            });
            
            displayResults(filteredGroups);
        }
        
        // Function to display results
        function displayResults(groupsToDisplay) {
            const container = document.getElementById('results-container');
            container.innerHTML = '';
            
            groupsToDisplay.forEach(group => {
                const groupElement = document.createElement('div');
                groupElement.classList.add('upg-item');
                
                const nameContainer = document.createElement('div');
                nameContainer.classList.add('upg-name');
                nameContainer.textContent = group.name;
                nameContainer.appendChild(
                    pronunciationService.createPronunciationElement(
                        group.name,
                        group.pronunciation
                    )
                );
                
                const details = document.createElement('div');
                details.classList.add('upg-details');
                details.innerHTML = `
                    <p>Type: ${group.type}</p>
                    <p>Population: ${parseInt(group.population).toLocaleString()}</p>
                    <p>Language: ${group.language}</p>
                    <p>Religion: ${group.religion}</p>
                    <p>Evangelical: ${group.evangelical}%</p>
                    <p>Distance: ${group.distance.toFixed(1)} ${unit}</p>
                `;
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = group.id;
                checkbox.classList.add('group-select');
                
                groupElement.appendChild(checkbox);
                groupElement.appendChild(nameContainer);
                groupElement.appendChild(details);
                container.appendChild(groupElement);
            });
        }
        
        // Add event listeners
        sortSelect.addEventListener('change', updateResults);
        languageFilter.addEventListener('change', updateResults);
        religionFilter.addEventListener('change', updateResults);
        typeFilter.addEventListener('change', updateResults);
        evangelicalFilter.addEventListener('input', updateResults);
        
        // Handle form submission (adding to Top 100)
        document.getElementById('selectionForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const selectedGroups = Array.from(
                document.querySelectorAll('.group-select:checked')
            ).map(cb => cb.value);
            
            if (selectedGroups.length > 0) {
                await dataService.addToTop100(selectedGroups);
                window.location.href = 'top_100.html';
            }
        });
        
        // Initial display
        updateResults();
    } catch (error) {
        console.error('Error initializing results page:', error);
        alert('An error occurred while loading the results. Please try again later.');
    }
});
