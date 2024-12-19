import { dataService } from './dataService.js';
import { playPronunciation } from './pronunciation.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await dataService.init();
        const searchParams = JSON.parse(sessionStorage.getItem('searchParams'));
        
        if (!searchParams) {
            alert('No search parameters found. Please perform a search first.');
            window.location.href = 'index.html';
            return;
        }

        // Load and display results
        const results = await performSearch(searchParams);
        displayResults(results);

        // Handle adding to Top 100
        document.getElementById('addToTop100').addEventListener('click', async () => {
            const selectedGroups = getSelectedGroups();
            if (selectedGroups.length === 0) {
                alert('Please select at least one group to add to the Top 100 list.');
                return;
            }

            try {
                await dataService.addToTop100(selectedGroups);
                alert('Selected groups have been added to the Top 100 list.');
            } catch (error) {
                console.error('Error adding to Top 100:', error);
                alert('An error occurred while adding to the Top 100 list.');
            }
        });
    } catch (error) {
        console.error('Error initializing results page:', error);
        alert('An error occurred while loading the results.');
    }
});

async function performSearch(params) {
    try {
        const { upg, radius, unit, searchType } = params;
        const results = {
            fpgs: [],
            uupgs: []
        };

        // TODO: Implement actual search logic here
        // This is just placeholder data
        if (searchType === 'fpg' || searchType === 'both') {
            results.fpgs = [
                {
                    name: 'Sample FPG 1',
                    pronunciation: 'sam-pul',
                    country: 'Country 1',
                    population: 100000,
                    religion: 'Religion 1',
                    language: 'Language 1',
                    evangelical: 0.1
                }
                // Add more sample FPGs
            ];
        }

        if (searchType === 'uupg' || searchType === 'both') {
            results.uupgs = [
                {
                    name: 'Sample UUPG 1',
                    pronunciation: 'sam-pul',
                    country: 'Country 2',
                    population: 200000,
                    religion: 'Religion 2',
                    language: 'Language 2',
                    evangelical: 0.2
                }
                // Add more sample UUPGs
            ];
        }

        return results;
    } catch (error) {
        console.error('Error performing search:', error);
        throw error;
    }
}

function displayResults(results) {
    const fpgContainer = document.getElementById('fpgResults');
    const uupgContainer = document.getElementById('uupgResults');

    // Display FPGs
    fpgContainer.innerHTML = results.fpgs.map(group => createGroupCard(group, 'fpg')).join('');

    // Display UUPGs
    uupgContainer.innerHTML = results.uupgs.map(group => createGroupCard(group, 'uupg')).join('');

    // Add event listeners for play buttons
    document.querySelectorAll('.play-button').forEach(button => {
        button.addEventListener('click', () => {
            const pronunciation = button.dataset.pronunciation;
            playPronunciation(pronunciation);
        });
    });
}

function createGroupCard(group, type) {
    return `
        <div class="upg-card">
            <div class="upg-card-header">
                <input type="checkbox" class="upg-card-checkbox" data-group-id="${type}-${group.name}">
                <h3 class="upg-name">${group.name}</h3>
                <span class="pronunciation">(${group.pronunciation})</span>
                <button class="play-button" data-pronunciation="${group.pronunciation}">
                    <span class="material-icons">play_arrow</span>
                </button>
            </div>
            <div class="upg-card-content">
                <div class="upg-info-left">
                    <div>
                        <div class="upg-info-label">Country</div>
                        <div class="upg-info-value">${group.country}</div>
                    </div>
                    <div>
                        <div class="upg-info-label">Population</div>
                        <div class="upg-info-value">${group.population.toLocaleString()}</div>
                    </div>
                </div>
                <div class="upg-info-right">
                    <div>
                        <div class="upg-info-label">Religion</div>
                        <div class="upg-info-value">${group.religion}</div>
                    </div>
                    <div>
                        <div class="upg-info-label">Language</div>
                        <div class="upg-info-value">${group.language}</div>
                    </div>
                    <div>
                        <div class="upg-info-label">Evangelical %</div>
                        <div class="upg-info-value">${group.evangelical}%</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getSelectedGroups() {
    const selectedGroups = [];
    document.querySelectorAll('.upg-card-checkbox:checked').forEach(checkbox => {
        selectedGroups.push(checkbox.dataset.groupId);
    });
    return selectedGroups;
}
