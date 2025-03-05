import numpy as np
import sys

def parse_obj(file_name):
    """Parses an OBJ file and extracts vertices and faces."""
    vertices = []
    faces = []
    
    with open(file_name, 'r') as file:
        for line in file:
            if line.startswith('v '):
                vertices.append([float(x) for x in line.split()[1:]])
            elif line.startswith('f '):
                face = [int(vertex.split('/')[0]) for vertex in line.split()[1:]]
                faces.append(face)
    
    return np.array(vertices), faces

def calculate_normal(v1, v2, v3):
    """Calculates the normal vector of a triangle given three vertices."""
    normal = np.cross(v2 - v1, v3 - v1)
    norm = np.linalg.norm(normal)
    return normal / norm if norm != 0 else normal

def write_stl(file_name, vertices, faces):
    """Writes a list of vertices and faces to an ASCII STL file."""
    with open(file_name, 'w') as file:
        file.write("solid model\n")
        
        for face in faces:
            v1, v2, v3 = vertices[face[0]-1], vertices[face[1]-1], vertices[face[2]-1]
            normal = calculate_normal(v1, v2, v3)
            
            file.write(f"  facet normal {normal[0]:.6E} {normal[1]:.6E} {normal[2]:.6E}\n")
            file.write("    outer loop\n")
            file.write(f"      vertex {v1[0]:.6E} {v1[1]:.6E} {v1[2]:.6E}\n")
            file.write(f"      vertex {v2[0]:.6E} {v2[1]:.6E} {v2[2]:.6E}\n")
            file.write(f"      vertex {v3[0]:.6E} {v3[1]:.6E} {v3[2]:.6E}\n")
            file.write("    endloop\n")
            file.write("  endfacet\n")
        
        file.write("endsolid model\n")

def main():
    """Main function to convert OBJ to STL using command-line arguments."""
    if len(sys.argv) != 3:
        print("Usage: python convert_obj_to_stl.py <input_file.obj> <output_file.stl>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    # Parse the OBJ file
    try:
        vertices, faces = parse_obj(input_file)
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found.")
        sys.exit(1)

    # Write to the STL file
    write_stl(output_file, vertices, faces)
    print(f"Conversion complete. Output written to {output_file}")

if __name__ == "__main__":
    main()
