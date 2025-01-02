async function findGroupsWithinRadius(country, upgId, radius, radiusUnit, searchType) {
    try {
        const url = `${process.env.REACT_APP_API_BASE_URL}/api/v2/people-groups?api-key=${process.env.REACT_APP_API_KEY}`;
        console.log("Fetching from URL:", url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Add error checking
        if (!response.ok) {
            throw new Error(`API request failed: ${data.message || response.statusText}`);
        }
        
        // Add logging to see the structure of the response
        console.log("API Response:", data);
        
        // Check if data has the expected structure
        if (!Array.isArray(data)) {
            throw new Error('Expected array of people groups but received different data structure');
        }

        return data;
    } catch (error) {
        console.error("Error in findGroupsWithinRadius:", error);
        throw error;
    }
} 