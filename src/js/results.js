import { dataService } from './dataService.js';
import { playPronunciation } from './pronunciation.js';

let currentResults = {
    fpgs: [],
    uupgs: []
};

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
        currentResults = await performSearch(searchParams);
        displayResults(currentResults);

        // Initialize sorting
        initializeSorting();

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

function initializeSorting() {
    const sortButtons = document.querySelectorAll('.sort-button');
    
    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sortType = button.dataset.sort;
            const currentDirection = button.dataset.direction || 'none';
            const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';

            // Update button states
            sortButtons.forEach(btn => {
                btn.dataset.direction = btn === button ? newDirection : 'none';
                btn.querySelector('.sort-icon').textContent = 
                    btn === button 
                        ? (newDirection === 'asc' ? 'arrow_upward' : 'arrow_downward')
                        : 'unfold_more';
            });

            // Sort and display results
            sortResults(sortType, newDirection);
        });
    });

    // Initial sort by distance
    sortResults('distance', 'desc');
}

function sortResults(sortType, direction) {
    const sortFn = (a, b) => {
        const multiplier = direction === 'asc' ? 1 : -1;
        
        switch (sortType) {
            case 'distance':
                return multiplier * (a.distance - b.distance);
            case 'population':
                return multiplier * (parseInt(b.population) - parseInt(a.population));
            case 'type':
                return multiplier * a.type.localeCompare(b.type);
            case 'religion':
                return multiplier * a.religion.localeCompare(b.religion);
            case 'language':
                return multiplier * a.language.localeCompare(b.language);
            default:
                return 0;
        }
    };

    currentResults.fpgs.sort(sortFn);
    currentResults.uupgs.sort(sortFn);
    displayResults(currentResults);
}

async function performSearch(params) {
    try {
        const { upg, radius, unit, searchType } = params;
        const results = await dataService.findGroupsWithinRadius(
            upg.latitude,
            upg.longitude,
            radius,
            unit,
            searchType
        );

        return {
            fpgs: results.filter(group => group.type === 'FPG'),
            uupgs: results.filter(group => group.type === 'UUPG')
        };
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
