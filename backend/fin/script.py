import os
import argparse
import numpy as np
import pyvista as pv
import parmed as pmd

def create_merged_spheres(coords, radius=0.3, resolution=12):
    merged = pv.PolyData()
    for (x, y, z) in coords:
        sphere = pv.Sphere(radius=radius,
                           center=(x, y, z),
                           theta_resolution=resolution,
                           phi_resolution=resolution)
        if merged.n_points == 0:
            merged = sphere
        else:
            merged = merged.merge(sphere)
    return merged

def create_merged_cylinders(bond_list, bond_radius=0.1, resolution=12):
    merged = pv.PolyData()
    for (start, end) in bond_list:
        start = np.array(start)
        end   = np.array(end)
        direction = end - start
        length = np.linalg.norm(direction)
        if length < 1e-6:
            continue
        center = start + 0.5 * direction
        cylinder = pv.Cylinder(
            center=center,
            direction=direction,
            radius=bond_radius,
            height=length,
            resolution=resolution
        )
        if merged.n_points == 0:
            merged = cylinder
        else:
            merged = merged.merge(cylinder)
    return merged

def pdb_to_licorice_colored_gltf(
    pdb_file,
    output_file="colored_molecule.gltf",
    atom_radius=0.3,
    bond_radius=0.25,
    sphere_resolution=20,
    cylinder_resolution=20
):
    structure = pmd.load_file(pdb_file)
    element_colors = {
        "H":  "white",
        "C":  "gray",
        "O":  "red",
        "N":  "blue",
        "S":  "yellow",
        "P":  "orange",
    }
    element_coords = {}
    for atom in structure.atoms:
        coords = (atom.xx, atom.xy, atom.xz)
        elem = atom.name.strip().capitalize()
        if elem not in element_coords:
            element_coords[elem] = []
        element_coords[elem].append(coords)
    bond_list = []
    for bond in structure.bonds:
        start = (bond.atom1.xx, bond.atom1.xy, bond.atom1.xz)
        end   = (bond.atom2.xx, bond.atom2.xy, bond.atom2.xz)
        bond_list.append((start, end))
    bond_mesh = create_merged_cylinders(
        bond_list, bond_radius=bond_radius, resolution=cylinder_resolution
    )
    plotter = pv.Plotter(off_screen=True)
    for elem, coords in element_coords.items():
        mesh_elem = create_merged_spheres(coords,
                                          radius=atom_radius,
                                          resolution=sphere_resolution)
        color_name = element_colors.get(elem, "pink")
        plotter.add_mesh(mesh_elem, color=color_name, name=f"atoms_{elem}")
    plotter.add_mesh(bond_mesh, color="silver", name="bonds")
    temp_obj = output_file.replace(".gltf", ".obj").replace(".glb", ".obj")
    plotter.export_obj(temp_obj)
    os.system(f"assimp export {temp_obj} {output_file}")
    if os.path.exists(temp_obj):
        os.remove(temp_obj)
    mtl_file = temp_obj.replace(".obj", ".mtl")
    if os.path.exists(mtl_file):
        os.remove(mtl_file)
    print(f"Exported licorice model with colors to: {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert PDB to colored GLTF/GLB molecule model.")
    parser.add_argument("input_pdb", help="Path to the input PDB file.")
    parser.add_argument("output_gltf", help="Path to the output GLTF/GLB file.")
    args = parser.parse_args()
    pdb_to_licorice_colored_gltf(args.input_pdb, args.output_gltf)