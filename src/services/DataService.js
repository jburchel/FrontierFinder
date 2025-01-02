async function findGroupsWithinRadius(country, upgId, radius, radiusUnit, searchType) {
    try {
        // Build query parameters
        const params = new URLSearchParams({
            'api-key': process.env.JOSHUA_PROJECTAPI_KEY,
            'country': country || '',
            'radius': radius || '',
            'rad-unit': radiusUnit || 'miles',
            'search-type': searchType || 'both'
        });
        
        if (upgId) {
            params.append('upg', upgId);
        }

        const url = `https://api.joshuaproject.net/v1/people_groups.json?${params.toString()}`;
        console.log("Fetching from URL:", url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Add error checking
        if (!response.ok) {
            throw new Error(`API request failed: ${data.message || response.statusText}`);
        }
        
        // Add logging to see the structure of the response
        console.log("API Response:", data);

        return data;
    } catch (error) {
        console.error("Error in findGroupsWithinRadius:", error);
        throw error;
    }
} 