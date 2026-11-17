import axios from 'axios';

const ISS_API_URL = 'https://api.wheretheiss.at/v1/satellites/25544';

const getISSData = async () => {
  try {
    const response = await axios.get(ISS_API_URL);
    const data = response.data;

    console.table(data);

    return data;
  } catch (error) {
    console.error('Could not retrieve ISS position:', error);
    return null;
  }
};

export { getISSData };
