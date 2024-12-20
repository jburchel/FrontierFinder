import { dataService } from './dataService.js';
import { playPronunciation, createPronunciationElement } from './pronunciation.js';

let currentResults = {
    fpgs: [],
    uupgs: []
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await dataService.init();
        const params = new URLSearchParams(window.location.search);
        
        // Get all required parameters
        const searchParams = {
            country: params.get('country'),
            upgId: params.get('upg'),
            upgName: params.get('name'),
            latitude: parseFloat(params.get('lat')),
            longitude: parseFloat(params.get('lng')),
            radius: parseFloat(params.get('radius')),
            unit: params.get('unit'),
            type: params.get('type')
        };

        // Validate parameters
        if (!searchParams.country || !searchParams.upgId || !searchParams.radius || 
            !searchParams.unit || !searchParams.type || 
            isNaN(searchParams.latitude) || isNaN(searchParams.longitude)) {
            alert('Invalid search parameters. Please try searching again.');
            window.location.href = 'index.html';
            return;
        }

        // Perform the search
        await performSearch(searchParams);
        
        // Initialize UI components
        initializeSorting();
        initializeEventListeners();
    } catch (error) {
        console.error('Error initializing results page:', error);
        alert('An error occurred while loading results. Please try again.');
        window.location.href = 'index.html';
    }
});

function initializeEventListeners() {
    // Add event listener for play buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.play-button')) {
            const button = e.target.closest('.play-button');
            const card = button.closest('.upg-card');
            const name = card.querySelector('.upg-name').textContent;
            const pronunciation = button.dataset.pronunciation;
            playPronunciation(name, pronunciation);
        }
    });

    // Add event listener for "Add to Top 100" button
    const addToTop100Button = document.getElementById('addToTop100');
    if (addToTop100Button) {
        addToTop100Button.addEventListener('click', async () => {
            const selectedGroups = getSelectedGroups();
            if (selectedGroups.length > 0) {
                try {
                    await dataService.addToTop100(selectedGroups);
                    window.location.href = 'top100.html';
                } catch (error) {
                    console.error('Error adding groups to Top 100:', error);
                    alert('Error adding groups to Top 100 list. Please try again.');
                }
            } else {
                alert('Please select at least one group to add to the Top 100 list.');
            }
        });
    }
}

async function performSearch(params) {
    try {
        const results = await dataService.findGroupsWithinRadius(
            params.latitude,
            params.longitude,
            params.radius,
            params.unit,
            params.type
        );

        currentResults = results;
        displayResults(results);
        
        // Enable the "Add to Top 100" button if we have results
        const addToTop100Button = document.getElementById('addToTop100');
        if (addToTop100Button) {
            addToTop100Button.disabled = false;
        }
    } catch (error) {
        console.error('Error performing search:', error);
        alert('Error performing search. Please try again.');
    }
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results-list');
    resultsContainer.innerHTML = '';

    if (!results.fpgs.length && !results.uupgs.length) {
        resultsContainer.innerHTML = '<p class="no-results">No groups found within the specified radius.</p>';
        return;
    }

    // Display FPGs
    if (results.fpgs.length > 0) {
        const fpgSection = document.createElement('div');
        fpgSection.className = 'results-section';
        fpgSection.innerHTML = '<h3>Frontier People Groups (FPGs)</h3>';
        
        results.fpgs.forEach(group => {
            fpgSection.appendChild(createGroupCard(group, 'fpg'));
        });
        
        resultsContainer.appendChild(fpgSection);
    }

    // Display UUPGs
    if (results.uupgs.length > 0) {
        const uupgSection = document.createElement('div');
        uupgSection.className = 'results-section';
        uupgSection.innerHTML = '<h3>Unengaged Unreached People Groups (UUPGs)</h3>';
        
        results.uupgs.forEach(group => {
            uupgSection.appendChild(createGroupCard(group, 'uupg'));
        });
        
        resultsContainer.appendChild(uupgSection);
    }
}

function createGroupCard(group, type) {
    const card = document.createElement('div');
    card.className = 'upg-card';
    
    const header = document.createElement('div');
    header.className = 'upg-card-header';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'upg-card-checkbox';
    checkbox.dataset.groupId = `${type}-${group.name}`;
    
    const name = document.createElement('h3');
    name.className = 'upg-name';
    name.textContent = group.name;
    
    // Create pronunciation element with play button
    const pronunciationElement = createPronunciationElement(group.name, group.pronunciation);
    
    header.appendChild(checkbox);
    header.appendChild(name);
    header.appendChild(pronunciationElement);
    
    const content = document.createElement('div');
    content.className = 'upg-card-content';
    content.innerHTML = `
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
    `;
    
    card.appendChild(header);
    card.appendChild(content);
    return card;
}

function getSelectedGroups() {
    const checkboxes = document.querySelectorAll('.upg-card-checkbox:checked');
    return Array.from(checkboxes).map(checkbox => {
        const [type, name] = checkbox.dataset.groupId.split('-');
        const group = [...currentResults.fpgs, ...currentResults.uupgs]
            .find(g => g.name === name);
        return { ...group, type };
    });
}

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
    displayResults({ fpgs: currentResults.fpgs, uupgs: currentResults.uupgs });
}
