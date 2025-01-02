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
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': window.location.origin
            },
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API Response:", data);
        return data;

    } catch (error) {
        console.error("Error in findGroupsWithinRadius:", error);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
    }
} 