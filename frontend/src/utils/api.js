export const fetchPlotData = async (filePath) => {
    try {
        const response = await fetch(`http://127.0.0.1:5000/plot_data/${encodeURIComponent(filePath)}`, { method: 'GET' });
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

  export const fetchModelFiles = async (folderPath) => {
    try {
        const url = `http://127.0.0.1:5000/folder/${encodeURIComponent(folderPath)}`;
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data = await response.json(); 

        if (!data.files) {
            throw new Error("No files found in response.");
        }

        const files = {};
        for (const [filename, base64Data] of Object.entries(data.files)) {
            files[filename] = base64ToBlobURL(base64Data, getMimeType(filename));
        }

        return files; 
    } catch (error) {
        console.error("Error fetching model files:", error);
        throw error;
    }
};

const base64ToBlobURL = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
};

const getMimeType = (filename) => {
    if (filename.endsWith(".stl")) return "model/stl";
    if (filename.endsWith(".glb")) return "model/gltf-binary";
    return "application/octet-stream"; 
};

  