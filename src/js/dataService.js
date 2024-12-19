class DataService {
    constructor() {
        this.existingUPGs = [];
        this.uupgData = [];
        this.database = firebase.database();
    }

    async init() {
        try {
            // Load CSV data
            await this.loadExistingUPGs();
            await this.loadUUPGData();
            
            // Initialize Firebase data structure if needed
            await this.initializeFirebaseData();
        } catch (error) {
            console.error('Error initializing data service:', error);
            throw error;
        }
    }

    async loadExistingUPGs() {
        try {
            const response = await fetch('data/existing_upgs_updated.csv');
            const csvText = await response.text();
            this.existingUPGs = this.parseCSV(csvText);
        } catch (error) {
            console.error('Error loading existing UPGs:', error);
            throw error;
        }
    }

    async loadUUPGData() {
        try {
            const response = await fetch('data/updated_uupg.csv');
            const csvText = await response.text();
            this.uupgData = this.parseCSV(csvText);
        } catch (error) {
            console.error('Error loading UUPG data:', error);
            throw error;
        }
    }

    parseCSV(csvText) {
        try {
            const lines = csvText.split('\n');
            const headers = lines[0].split(',').map(header => header.trim());
            
            return lines.slice(1)
                .filter(line => line.trim() !== '')
                .map(line => {
                    const values = line.split(',');
                    const entry = {};
                    headers.forEach((header, index) => {
                        entry[header] = values[index]?.trim() || '';
                    });
                    return entry;
                });
        } catch (error) {
            console.error('Error parsing CSV:', error);
            throw error;
        }
    }

    getCountries() {
        try {
            const countries = [...new Set(this.existingUPGs.map(upg => upg.Country))];
            return countries.sort();
        } catch (error) {
            console.error('Error getting countries:', error);
            return [];
        }
    }

    getUPGsByCountry(country) {
        try {
            return this.existingUPGs
                .filter(upg => upg.Country === country)
                .map(upg => ({
                    name: upg.PeopNameInCountry,
                    latitude: parseFloat(upg.Latitude),
                    longitude: parseFloat(upg.Longitude),
                    pronunciation: upg.Pronunciation || ''
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Error getting UPGs by country:', error);
            return [];
        }
    }

    async initializeFirebaseData() {
        try {
            const topListRef = this.database.ref('top100List');
            const snapshot = await topListRef.once('value');
            
            if (!snapshot.exists()) {
                await topListRef.set([]);
            }
        } catch (error) {
            console.error('Error initializing Firebase data:', error);
            throw error;
        }
    }

    // Calculate distance between two points using Haversine formula
    calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
        const R = unit === 'km' ? 6371 : 3959; // Earth's radius in km or miles
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRad(value) {
        return value * Math.PI / 180;
    }

    // Find FPGs and UUPGs within radius
    findGroupsWithinRadius(centerLat, centerLon, radius, unit = 'km') {
        return this.uupgData.filter(group => {
            const distance = this.calculateDistance(
                centerLat, centerLon,
                parseFloat(group.latitude),
                parseFloat(group.longitude),
                unit
            );
            return distance <= radius;
        }).map(group => ({
            ...group,
            type: parseFloat(group.evangelical) < 0.1 ? 'FPG' : 'UUPG'
        }));
    }

    // Top 100 list management
    async addToTop100(groups) {
        const topListRef = this.database.ref('top100List');
        const snapshot = await topListRef.once('value');
        const currentList = snapshot.val() || [];
        
        // Add new groups, avoiding duplicates
        const updatedList = [...new Set([...currentList, ...groups])].slice(0, 100);
        await topListRef.set(updatedList);
    }

    async removeFromTop100(groupId) {
        const topListRef = this.database.ref('top100List');
        const snapshot = await topListRef.once('value');
        const currentList = snapshot.val() || [];
        
        const updatedList = currentList.filter(id => id !== groupId);
        await topListRef.set(updatedList);
    }
}

// Create global instance
const dataService = new DataService();
