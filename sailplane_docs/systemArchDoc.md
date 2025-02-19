# System Architecture

## Technology Stack
- Frontend:
  - React
  - Three.js for 3D rendering
  - Plotly.js for data visualization
  - CRACO for CRA configuration override

- Backend:
  - Flask
  - Pandas for data processing
  - Flask-CORS for cross-origin support

## Directory Structure
```
deloc-vis/
├── backend/
│   ├── app.py
│   ├── graph-data/
│   ├── pdb-files/
│   └── rotation-cubes/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Plot/
│   │   │   │   ├── Plot.js
│   │   │   │   └── Plot.css
│   │   ├── utils/
│   │   └── App.js
│   ├── public/
│   └── package.json
└── scripts/
```