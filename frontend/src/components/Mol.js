import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol/build/3Dmol.js';
import { fetchStructureData, fetchCubeData } from '../utils/api';

const Mol2Viewer = ({Phi, Theta, filePath, orbitalPath, showOrbitals }) => {
    const viewerRef = useRef();
    const viewer = useRef(null);
    const containerRef = useRef(null);

    // Function to update viewer size
    const updateViewerSize = () => {
        if (containerRef.current && viewer.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            viewer.current.resize(width, height);
            viewer.current.render();
        }
    };

    // Initialize viewer with proper configuration
    const initializeViewer = (element) => {
        const config = {
            backgroundColor: 'white',
            antialias: true,
            defaultcolors: $3Dmol.rasmolElementColors,
        };
        
        const v = new $3Dmol.createViewer(element, config);
        v.setStyle({}, { stick: {radius: 0.1}, sphere: {radius: 0.5} });
        v.resize();
        v.zoomTo();
        
        return v;
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            requestAnimationFrame(updateViewerSize);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize and update viewer
    const setupViewer = async (v, structureData) => {
        v.addModel(structureData, "mol2");
        v.setStyle({}, { stick: {radius: 0.1}, sphere: {radius: 0.5} });
        v.zoomTo();
        v.render();
        updateViewerSize();
    };

    // Setup HOMO visualization
    const setupHOMO = async (v, structureData, orbitalData) => {
        await setupViewer(v, structureData);
        const voldata = new $3Dmol.VolumeData(orbitalData, "cube");
        v.addIsosurface(voldata, {isoval: 0.01, color: "blue", alpha: 0.95, smoothness: 10});
        v.addIsosurface(voldata, {isoval: -0.01, color: "red", alpha: 0.95, smoothness: 10});
        v.zoomTo();
        v.render();
        updateViewerSize();
    };

    useEffect(() => {
        // Clear previous viewer if it exists
        if (viewer.current) {
            viewer.current.clear();
            viewer.current = null;
        }

        if (!viewerRef.current) {
            console.error("Viewer element is not mounted correctly");
            return;
        }

        const loadViewer = async () => {
            try {
                viewer.current = initializeViewer(viewerRef.current);

                if (showOrbitals && orbitalPath) {
                    const [structureData, orbitalData] = await Promise.all([
                        fetchStructureData(filePath),
                        fetchCubeData(orbitalPath)
                    ]);
                    await setupHOMO(viewer.current, structureData.data, orbitalData);
                } else {
                    const { data } = await fetchStructureData(filePath);
                    await setupViewer(viewer.current, data);
                }
            } catch (error) {
                console.error("Error loading viewer:", error);
            }
        };

        loadViewer();

        // Cleanup function
        return () => {
            if (viewer.current) {
                viewer.current.clear();
                viewer.current = null;
            }
        };
    }, [filePath, orbitalPath, showOrbitals]);

    return (
        <div 
            ref={containerRef} 
            style={{ 
                width: '100%', 
                height: '100%',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            }}
        >
            <div 
                ref={viewerRef} 
                style={{ 
                    width: '100%', 
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }} 
            />
        </div>
    );
};

export default Mol2Viewer;
