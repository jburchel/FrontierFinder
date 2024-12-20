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
            const response = await fetch('/FrontierFinder/data/existing_upgs.csv');
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
        // TODO: Implement actual distance calculation and filtering
        // For now, return sample data
        return [
            {
                name: "Sample Group 1",
                pronunciation: "sam-pul",
                type: "FPG",
                country: "Sample Country",
                population: 100000,
                religion: "Sample Religion",
                language: "Sample Language",
                evangelical: 0.5,
                distance: 10
            },
            {
                name: "Sample Group 2",
                pronunciation: "sam-pul",
                type: "UUPG",
                country: "Sample Country",
                population: 200000,
                religion: "Sample Religion",
                language: "Sample Language",
                evangelical: 1.0,
                distance: 20
            }
        ];
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
