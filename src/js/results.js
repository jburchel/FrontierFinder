import { dataService } from './dataService.js';
import { playPronunciation, createPronunciationElement } from './pronunciation.js';

let currentResults = {
    fpgs: [],
    uupgs: []
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await dataService.init();
        const urlParams = new URLSearchParams(window.location.search);
        const searchParams = {
            country: urlParams.get('country'),
            upg: urlParams.get('upg'),
            radius: urlParams.get('radius'),
            unit: urlParams.get('unit'),
            type: urlParams.get('type')
        };
        
        if (!searchParams.country || !searchParams.upg || !searchParams.radius || !searchParams.unit || !searchParams.type) {
            alert('No search parameters found. Please perform a search first.');
            window.location.href = 'index.html';
            return;
        }

        // Load and display results
        currentResults = await performSearch(searchParams);
        displayResults(currentResults);

        // Initialize sorting
        initializeSorting();

        // Initialize event listeners
        initializeEventListeners();
    } catch (error) {
        console.error('Error initializing results page:', error);
        // TODO: Show error message to user
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
                    // TODO: Show error message to user
                }
            } else {
                alert('Please select at least one group to add to the Top 100 list.');
            }
        });
    }
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
    displayResults(currentResults);
}

async function performSearch(params) {
    try {
        const { upg, radius, unit, type } = params;
        const results = await dataService.findGroupsWithinRadius(
            upg.latitude,
            upg.longitude,
            radius,
            unit,
            type
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
    fpgContainer.innerHTML = '';
    results.fpgs.forEach(group => {
        const card = createGroupCard(group, 'fpg');
        fpgContainer.appendChild(card);
    });

    // Display UUPGs
    uupgContainer.innerHTML = '';
    results.uupgs.forEach(group => {
        const card = createGroupCard(group, 'uupg');
        uupgContainer.appendChild(card);
    });
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
    const selectedGroups = [];
    document.querySelectorAll('.upg-card-checkbox:checked').forEach(checkbox => {
        selectedGroups.push(checkbox.dataset.groupId);
    });
    return selectedGroups;
}
