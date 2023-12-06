import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol/build/3Dmol.js';
import { fetchStructureData, fetchCubeData } from '../utils/api';

const MolecularViewer = ({ filePath, orbitalPath, isAnimating }) => {
    const viewerRef = useRef();
    const viewer = useRef(null);
    const animationFrameId = useRef();

    useEffect(() => {
        console.log("viewerRef.current:", viewerRef.current);
        if (!viewerRef.current) {
            console.error("Viewer element is not mounted correctly");
            return;
        }

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

        if (orbitalPath) {
            fetchCubeData(orbitalPath)
                .then((orbitalData) =>{
                    console.log(orbitalData);
                    var voldata = new $3Dmol.VolumeData(orbitalData, "cube");
                    if (viewer && viewer.current.addIsosurface) {
                        viewer.current.addIsosurface(voldata, {isoval: 0.01, color: "blue", alpha: 0.95, smoothness: 10});
                        viewer.current.addIsosurface(voldata, {isoval: -0.01, color: "red", alpha: 0.95, smoothness: 10});
                        viewer.current.setStyle({}, {stick:{}});
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
    }, [filePath, orbitalPath]);

    useEffect(() => {
        function animate() {
            if (viewer.current) {
                viewer.current.rotate(1, { y: 0.5 });
                viewer.current.render();
                animationFrameId.current = requestAnimationFrame(animate);
            }
        }
        if (isAnimating) {
            animate();
        } else if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        }
    }, [isAnimating]);

    return <div ref={viewerRef} style={{ width: '400px', height: '400px' }} />;
};

export default MolecularViewer;
