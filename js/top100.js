document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize services
        await dataService.init();
        
        const sortSelect = document.getElementById('sortCriteria');
        const container = document.getElementById('top100-container');
        
        // Function to load and display Top 100 list
        async function loadTop100() {
            const topListRef = firebase.database().ref('top100List');
            const snapshot = await topListRef.once('value');
            const topList = snapshot.val() || [];
            
            // Get full details for each group in the list
            const groupDetails = topList.map(groupId => {
                const group = dataService.uupgData.find(g => g.id === groupId);
                return {
                    ...group,
                    type: parseFloat(group.evangelical) < 0.1 ? 'FPG' : 'UUPG'
                };
            });
            
            // Sort groups
            const sortBy = sortSelect.value;
            groupDetails.sort((a, b) => {
                switch (sortBy) {
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
            
            // Display groups
            container.innerHTML = '';
            groupDetails.forEach(group => {
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
                `;
                
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('delete-button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = async () => {
                    await dataService.removeFromTop100(group.id);
                    await loadTop100();
                };
                
                groupElement.appendChild(nameContainer);
                groupElement.appendChild(details);
                groupElement.appendChild(deleteButton);
                container.appendChild(groupElement);
            });
        }
        
        // Add event listeners
        sortSelect.addEventListener('change', loadTop100);
        
        // Initial load
        await loadTop100();
    } catch (error) {
        console.error('Error initializing top 100 page:', error);
        alert('An error occurred while loading the Top 100 list. Please try again later.');
    }
});
