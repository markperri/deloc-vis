import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol/build/3Dmol.js';
import { fetchStructureData } from '../utils/api';

const MolecularViewer = ({ filePath, isAnimating}) => {
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
                console.log("Molecule data:", data); 
                viewer.current= new $3Dmol.createViewer(viewerRef.current);

                viewer.current.addModel(data.data, "mol2");
                viewer.current.setStyle({}, { stick: {radius: 0.1}, sphere: {radius: 0.5} });
                viewer.current.zoomTo();
                viewer.current.render();
            })
            .catch((error) => {
                console.error("Error loading .mol2 file:", error);
            });
    }, [filePath]);

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
        }else if(animationFrameId.current){
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
