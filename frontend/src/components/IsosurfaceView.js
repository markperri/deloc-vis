import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { fetchModelFiles } from "../utils/api";

const materialCache = {};

const getAtomMaterial = (groupName) => {
    if (!materialCache[groupName]) {
        const materialMap = {
            grp1: new THREE.MeshStandardMaterial({ color: 0x202020, metalness: 0.1, roughness: 0.5 }), // Carbon (black/gray)
            grp3621: new THREE.MeshStandardMaterial({ color: 0xFFFF00, metalness: 0.1, roughness: 0.5 }), // Sulfur (yellow)
            grp7241: new THREE.MeshStandardMaterial({ color: 0xFF0000, metalness: 0.1, roughness: 0.5 }), // Oxygen (red)
            grp7965: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.1, roughness: 0.5 }), // Hydrogen (white)
            default: new THREE.MeshStandardMaterial({ color: 0x00FF00, metalness: 0.1, roughness: 0.5 }) // Default green
        };
        materialCache[groupName] = materialMap[groupName] || materialMap.default;
    }
    return materialCache[groupName];
};

const IsosurfaceView = ({ folderPath }) => {
    const [stlMesh, setStlMesh] = useState(null);
    const [meshMesh, setMeshMesh] = useState(null);
    const [glbScene, setGlbScene] = useState(null);
    const groupRef = useRef();

    useEffect(() => {
        const loadModels = async () => {
            console.log("Fetching models for:", folderPath);
            try {
                const files = await fetchModelFiles(folderPath);
                console.log("Files received:", files);

                const stlLoader = new STLLoader();
                const gltfLoader = new GLTFLoader();

                if (files["Molekeul.stl"]) {
                    stlLoader.load(files["Molekeul.stl"], (geometry) => {
                        const mesh = new THREE.Mesh(
                            geometry,
                            new THREE.MeshStandardMaterial({ color: 0x00ff00 })
                        );
                        mesh.rotation.x = -Math.PI;
                        mesh.scale.set(0.5, 0.5, 0.5);
                        setStlMesh(mesh);
                        console.log("Loaded Molekeul.stl");
                    });
                }

                if (files["Isoober.stl"]) {
                    stlLoader.load(files["Isoober.stl"], (geometry) => {
                        const mesh = new THREE.Mesh(
                            geometry,
                            new THREE.MeshStandardMaterial({ color: 0xffffff })
                        );
                        mesh.rotation.x = -Math.PI;
                        mesh.scale.set(0.5, 0.5, 0.5);
                        setMeshMesh(mesh);
                        console.log("Loaded Isoober.stl");
                    });
                }

                if (files["color.glb"]) {
                    gltfLoader.load(files["color.glb"], (gltf) => {
                        if (glbScene) {
                            glbScene.traverse((child) => {
                                if (child.isMesh) {
                                    child.geometry.dispose();
                                    if (child.material.map) child.material.map.dispose();
                                    child.material.dispose();
                                }
                            });
                        }

                        gltf.scene.rotation.x = -Math.PI;
                        gltf.scene.scale.set(0.5, 0.5, 0.5);

                        console.log("GLTF Scene:", gltf.scene);

                        const mainObject = gltf.scene.children.find(child => 
                            child.name.includes("Methylthiophene")
                        );

                        if (!mainObject) {
                            console.error("Main object not found inside GLB!");
                            return;
                        }

                        console.log("Main Object:", mainObject);

                        mainObject.children.forEach((group) => {
                            if (group.isObject3D) {
                                group.children.forEach((mesh) => {
                                    if (mesh.isMesh) {
                                        mesh.material = getAtomMaterial(group.name);
                                    }
                                });
                            }
                        });

                        setGlbScene(gltf.scene);
                        console.log("Loaded color.glb with colored atoms");
                    });
                }
            } catch (error) {
                console.error("Error loading models:", error);
            }
        };

        loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [folderPath]);

    useEffect(() => {
        if (stlMesh && glbScene) {
            const stlBox = new THREE.Box3().setFromObject(stlMesh);
            const stlCenter = stlBox.getCenter(new THREE.Vector3());

            const glbBox = new THREE.Box3().setFromObject(glbScene);
            const glbCenter = glbBox.getCenter(new THREE.Vector3());

            glbScene.position.sub(glbCenter);
            glbScene.position.add(stlCenter);
        }
    }, [stlMesh, glbScene]);

    return (
        <Canvas style={{ width: "500px", height: "500px" }} shadows>
            <ambientLight intensity={2} />
            <directionalLight position={[1, 1, 1]} intensity={1} />

            <group ref={groupRef}>
                {stlMesh && <primitive object={stlMesh} />}
                {glbScene && <primitive object={glbScene} />}
                {meshMesh && <primitive object={meshMesh} />}
            </group>

            <PerspectiveCamera makeDefault position={[0, 0, 6]} /> {/* Adjusted for new dimensions */}
            <OrbitControls />
        </Canvas>
    );
};

export default IsosurfaceView;
