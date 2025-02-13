import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol/build/3Dmol.js';
import { fetchStructureData, fetchCubeData } from '../utils/api';

const Mol2Viewer = ({Phi, Theta, filePath, orbitalPath, showOrbitals }) => {
    const viewerRef = useRef();
    const viewer = useRef(null);

    useEffect(() => {
        // Clear previous viewer if it exists
        if (viewer.current) {
            viewer.current.clear();
            viewer.current = null;
        }

        console.log("viewerRef.current:", viewerRef.current);
        if (!viewerRef.current) {
            console.error("Viewer element is not mounted correctly");
            return;
        }

    
        if(!showOrbitals){
        fetchStructureData(filePath)
            .then((data) => {
                viewer.current = new $3Dmol.createViewer(viewerRef.current);
                viewer.current.addModel(data.data, "mol2");
                viewer.current.setStyle({}, { stick: {radius: 0.1}, sphere: {radius: 0.5} });
                viewer.current.zoomTo();
                viewer.current.render();
            })
            .catch((error) => {
                console.error("Error loading .mol2 file:", error);
            });
        }
        if (showOrbitals && orbitalPath) {
            fetchCubeData(orbitalPath)
                .then((orbitalData) =>{
                    console.log(orbitalData);
                    if (viewer) {
                        viewer.current = new $3Dmol.createViewer(viewerRef.current);
                        fetchStructureData(filePath)
                            .then((data) => {
                                viewer.current.addModel(data.data, "mol2");
                                viewer.current.setStyle({}, { stick: {radius: 0.1}, sphere: {radius: 0.5} });
                                viewer.current.zoomTo();
                                viewer.current.render();
                            })
                            .catch((error) => {
                                console.error("Error loading .mol2 file:", error);
                            });
                        var voldata = new $3Dmol.VolumeData(orbitalData, "cube");
                        viewer.current.addIsosurface(voldata, {isoval: 0.01, color: "blue", alpha: 0.95, smoothness: 10});
                        viewer.current.addIsosurface(voldata, {isoval: -0.01, color: "red", alpha: 0.95, smoothness: 10});
                        viewer.current.zoomTo();
                        viewer.current.render();
                    } else {
                        console.error("viewer is not initialized correctly or addIsosurface method is missing");
                    }
                })
                .catch((error) => {
                    console.error("Error loading cube file:", error);
                });
        }

        // Cleanup function
        return () => {
            if (viewer.current) {
                viewer.current.clear();
                viewer.current = null;
            }
        };
    }, [filePath, orbitalPath, showOrbitals]);

    return <div ref={viewerRef} style={{ width: '500px', height: '500px' }} />;
};

export default Mol2Viewer;
