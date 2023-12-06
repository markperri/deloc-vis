export const fetchPlotData = async () => {
    try {
        const response = await fetch('http://127.0.0.1:5000/plot_data', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        const data = await response.json();
        console.log(data);
        return data;
      } catch (error) {
        console.error('Error fetching plot data:', error);
        throw error;
      }
  };

export const fetchStructureData = async (filePath) => {
    try {
        const url = `http://127.0.0.1:5000/structures/${encodeURIComponent(filePath)}`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching structure data:', error);
        throw error;
    }
};

export const fetchCubeData = async (filePath) => {
    try {
        const url = `http://127.0.0.1:5000/cubes/${encodeURIComponent(filePath)}`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error fetching cube data:', error);
        throw error;
    }
  };
  