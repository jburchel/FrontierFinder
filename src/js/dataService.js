import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { app, JOSHUA_PROJECT_API_KEY } from './config.js';

class DataService {
    constructor() {
        this.db = getDatabase(app);
        this.existingUPGs = null;
        this.uupgs = null;
        this.jpApiKey = JOSHUA_PROJECT_API_KEY; // We'll need to get this from environment variables
    }

    async init() {
        try {
            // Load UPGs data if not already loaded
            if (!this.existingUPGs) {
                await this.loadUPGsData();
            }
            if (!this.uupgs) {
                await this.loadUUPGsData();
            }
            // Load Joshua Project API key
            // TODO: Implement secure way to get API key
        } catch (error) {
            console.error('Error initializing DataService:', error);
            throw error;
        }
    }

    async loadUPGsData() {
        try {
            const response = await fetch('data/existing_upgs_updated.csv');
            const csvText = await response.text();
            this.existingUPGs = this.parseCSV(csvText);
            console.log('UPGs data loaded:', this.existingUPGs);
        } catch (error) {
            console.error('Error loading UPGs data:', error);
            throw error;
        }
    }

    async loadUUPGsData() {
        try {
            const response = await fetch('data/updated_uupg.csv');
            const csvText = await response.text();
            this.uupgs = this.parseCSV(csvText);
            console.log('UUPGs data loaded:', this.uupgs);
        } catch (error) {
            console.error('Error loading UUPGs data:', error);
            this.uupgs = []; // Initialize as empty if file doesn't exist yet
        }
    }

    async fetchFPGFromJoshuaProject(lat, lon, radius, unit) {
        try {
            if (!this.jpApiKey) {
                console.error('Joshua Project API key not set');
                return [];
            }

            // Ensure values are properly formatted
            const formattedLat = parseFloat(lat).toFixed(6);
            const formattedLon = parseFloat(lon).toFixed(6);
            const formattedRadius = parseInt(radius);
            const formattedUnit = unit.toLowerCase();

            // Validate values
            if (isNaN(formattedLat) || isNaN(formattedLon) || isNaN(formattedRadius)) {
                console.error('Invalid coordinates or radius');
                return [];
            }

            // Build URL with validated parameters
            const url = new URL('https://api.joshuaproject.net/v1/people_groups/search.json');
            url.searchParams.append('api_key', this.jpApiKey);
            url.searchParams.append('latitude', formattedLat);
            url.searchParams.append('longitude', formattedLon);
            url.searchParams.append('radius', formattedRadius);
            url.searchParams.append('radius_unit', formattedUnit);
            url.searchParams.append('frontier_only', 'true');

            console.log('Fetching from URL:', url.toString());  // For debugging

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Joshua Project API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    response: errorText
                });
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Transform Joshua Project data to match our format
            return data.map(fpg => ({
                id: `${fpg.peo_name}-${fpg.cntry_name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                PeopleName: fpg.peo_name,
                pronunciation: fpg.peo_pronunciation || '',
                Country: fpg.cntry_name,
                Population: fpg.peo_population || '0',
                Language: fpg.primary_language_name || 'Unknown',
                Religion: fpg.primary_religion_name || 'Unknown',
                Latitude: fpg.latitude.toString(),
                Longitude: fpg.longitude.toString(),
                'Global Status of  Evangelical Christianity': fpg.gsec || '',
                'Evangelical Engagement': 'Unengaged',
                'Physical Exertion': 'Unknown',
                'Freedom Index': fpg.persecution_level || 'Unknown',
                'Government Restrictions Index': 'Unknown',
                'Social Hostilities Index': 'Unknown',
                'Threat Level': 'Unknown',
                ROP: fpg.rop3 || '',
                distance: 0 // Will be calculated later
            }));
        } catch (error) {
            console.error('Error fetching from Joshua Project:', error);
            return [];
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
                // Handle quoted values that may contain commas
                const values = [];
                let currentValue = '';
                let insideQuotes = false;
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        insideQuotes = !insideQuotes;
                    } else if (char === ',' && !insideQuotes) {
                        values.push(currentValue.trim());
                        currentValue = '';
                    } else {
                        currentValue += char;
                    }
                }
                values.push(currentValue.trim()); // Add the last value
                
                const record = {};
                headers.forEach((header, index) => {
                    let value = values[index] || '';
                    // Remove any remaining quotes
                    value = value.replace(/^"|"$/g, '').trim();
                    record[header] = value;
                });
                
                // Create a unique ID using PeopleName and Country
                record.id = `${record.PeopleName}-${record.Country}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                return record;
            });
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    async findGroupsWithinRadius(lat, lon, radius, unit, type) {
        if (!this.existingUPGs || !this.uupgs) {
            throw new Error('Data not loaded');
        }

        // Convert radius to kilometers if in miles
        const radiusInKm = unit === 'miles' ? radius * 1.60934 : radius;

        let results = [];

        // Handle FPGs from Joshua Project API
        if (type === 'FPG') {
            results = await this.fetchFPGFromJoshuaProject(lat, lon, radius, unit);
        } 
        // Handle UUPGs from CSV data
        else if (type === 'UUPG') {
            results = this.uupgs
                .filter(group => {
                    if (!group.Latitude || !group.Longitude) return false;
                    const distance = this.calculateDistance(
                        lat, lon,
                        parseFloat(group.Latitude),
                        parseFloat(group.Longitude)
                    );
                    return distance <= radiusInKm;
                })
                .map(group => ({
                    ...group,
                    distance: this.calculateDistance(
                        lat, lon,
                        parseFloat(group.Latitude),
                        parseFloat(group.Longitude)
                    )
                }))
                .sort((a, b) => a.distance - b.distance);
        }
        // If no type specified, get both FPGs and UUPGs
        else {
            const fpgs = await this.fetchFPGFromJoshuaProject(lat, lon, radius, unit);
            const uupgs = this.uupgs
                .filter(group => {
                    if (!group.Latitude || !group.Longitude) return false;
                    const distance = this.calculateDistance(
                        lat, lon,
                        parseFloat(group.Latitude),
                        parseFloat(group.Longitude)
                    );
                    return distance <= radiusInKm;
                })
                .map(group => ({
                    ...group,
                    distance: this.calculateDistance(
                        lat, lon,
                        parseFloat(group.Latitude),
                        parseFloat(group.Longitude)
                    )
                }));

            results = [...fpgs, ...uupgs].sort((a, b) => a.distance - b.distance);
        }

        return results;
    }

    async addToTop100(groups) {
        const top100Ref = ref(this.db, 'top100');
        const existingData = (await get(top100Ref)).val() || {};
        
        groups.forEach(groupId => {
            existingData[groupId] = true;
        });
        
        await set(top100Ref, existingData);
    }

    async removeFromTop100(groupId) {
        const groupRef = ref(this.db, `top100/${groupId}`);
        await remove(groupRef);
    }

    async getUPGsForCountry(country) {
        if (!this.existingUPGs) {
            throw new Error('UPGs data not loaded');
        }
        
        const upgs = this.existingUPGs.filter(upg => upg.country === country);
        console.log('UPGs for country', country, ':', upgs);
        
        return upgs.map(upg => ({
            id: upg.id,
            name: upg.name,
            pronunciation: upg.pronunciation,
            latitude: parseFloat(upg.latitude),
            longitude: parseFloat(upg.longitude),
            population: parseInt(upg.population),
            language: upg.language,
            religion: upg.religion,
            evangelical: parseFloat(upg.evangelical)
        }));
    }

    async getUPGById(id) {
        if (!this.existingUPGs) {
            throw new Error('UPGs data not loaded');
        }
        
        console.log('Looking for UPG with ID:', id);
        console.log('Available UPGs:', this.existingUPGs);
        
        const upg = this.existingUPGs.find(upg => upg.id === id);
        console.log('Found UPG:', upg);
        
        if (!upg) {
            throw new Error(`UPG with ID ${id} not found`);
        }
        
        return {
            id: upg.id,
            name: upg.name,
            pronunciation: upg.pronunciation,
            latitude: parseFloat(upg.latitude),
            longitude: parseFloat(upg.longitude),
            population: parseInt(upg.population),
            language: upg.language,
            religion: upg.religion,
            evangelical: parseFloat(upg.evangelical)
        };
    }

    getCountries() {
        if (!this.existingUPGs) {
            throw new Error('UPGs data not loaded');
        }
        return [...new Set(this.existingUPGs.map(upg => upg.country))].sort();
    }
}

export const dataService = new DataService();
