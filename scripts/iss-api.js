import axios from 'axios';

// 1. Define API endpoint
const ISS_API_URL = 'https://api.wheretheiss.at/v1/satellites/25544';

// 2. Create fetch data from API function
const getISSData = async () => {
  // On success:
  // Return data (as an object)
  try {
    const response = await axios.get(ISS_API_URL);
    const data = response.data;
    return data;

    // On failure:
    // Log the error in console
  } catch (error) {
    console.error('Could not retrieve ISS position:', error);
    return null;
  }
};

export { getISSData };
