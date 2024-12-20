import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { app } from './config.js';

class DataService {
    constructor() {
        this.db = getDatabase(app);
        this.existingUPGs = null;
    }

    async init() {
        try {
            // Load UPGs data if not already loaded
            if (!this.existingUPGs) {
                await this.loadUPGsData();
            }
        } catch (error) {
            console.error('Error initializing DataService:', error);
            throw error;
        }
    }

    async loadUPGsData() {
        try {
            const response = await fetch('data/existing_upgs_updated.csv');
            const csvText = await response.text();
            
            // Parse CSV
            this.existingUPGs = this.parseCSV(csvText);
            console.log('UPGs data loaded:', this.existingUPGs);
        } catch (error) {
            console.error('Error loading UPGs data:', error);
            throw error;
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
                const values = line.split(',').map(v => v.trim());
                const record = {};
                headers.forEach((header, index) => {
                    record[header] = values[index];
                });
                // Generate a unique ID for each UPG
                record.id = record.name.toLowerCase().replace(/\s+/g, '-');
                return record;
            });
    }

    getCountries() {
        if (!this.existingUPGs) {
            throw new Error('UPGs data not loaded');
        }
        return [...new Set(this.existingUPGs.map(upg => upg.country))].sort();
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

    async findGroupsWithinRadius(lat, lon, radius, unit, type) {
        if (!this.existingUPGs) {
            throw new Error('UPGs data not loaded');
        }

        // Convert radius to kilometers if in miles
        const radiusInKm = unit === 'miles' ? radius * 1.60934 : radius;

        // Function to calculate distance between two points using Haversine formula
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

        // Filter UPGs based on distance and type
        const filteredGroups = this.existingUPGs
            .filter(upg => {
                // Skip if latitude or longitude is missing
                if (!upg.latitude || !upg.longitude) return false;

                // Calculate distance
                const distance = calculateDistance(
                    lat,
                    lon,
                    parseFloat(upg.latitude),
                    parseFloat(upg.longitude)
                );

                // Convert distance to miles if needed
                const displayDistance = unit === 'miles' ? distance / 1.60934 : distance;

                // Add distance to the UPG object
                upg.distance = Math.round(displayDistance * 10) / 10;

                // Check if within radius
                return distance <= radiusInKm;
            })
            .filter(upg => {
                // Filter by type if specified
                if (type === 'both') return true;
                return upg.type.toLowerCase() === type.toLowerCase();
            })
            .map(upg => ({
                id: upg.id,
                name: upg.name,
                pronunciation: upg.pronunciation,
                type: upg.type,
                country: upg.country,
                population: parseInt(upg.population),
                religion: upg.religion,
                language: upg.language,
                evangelical: parseFloat(upg.evangelical),
                distance: upg.distance
            }));

        // Separate into FPGs and UUPGs
        return {
            fpgs: filteredGroups.filter(g => g.type.toLowerCase() === 'fpg'),
            uupgs: filteredGroups.filter(g => g.type.toLowerCase() === 'uupg')
        };
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
}

export const dataService = new DataService();
