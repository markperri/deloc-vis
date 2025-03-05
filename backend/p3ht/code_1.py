import bpy
import re
import sys

def parse_mesh_data(mesh_data):
    vertices = []
    normals = []
    faces = []
    vertex_map = {}

    # Regular expression to match smooth_triangle and extract vertex and normal data
    triangle_pattern = re.compile(
        r'smooth_triangle\s*{\s*'
        r'<([-+]?[\d.]+),([-+]?[\d.]+),([-+]?[\d.]+)>\s*,\s*'  # Vertex 1
        r'<([-+]?[\d.]+),([-+]?[\d.]+),([-+]?[\d.]+)>\s*,\s*'  # Normal 1
        r'<([-+]?[\d.]+),([-+]?[\d.]+),([-+]?[\d.]+)>\s*,\s*'  # Vertex 2
        r'<([-+]?[\d.]+),([-+]?[\d.]+),([-+]?[\d.]+)>\s*,\s*'  # Normal 2
        r'<([-+]?[\d.]+),([-+]?[\d.]+),([-+]?[\d.]+)>\s*,\s*'  # Vertex 3
        r'<([-+]?[\d.]+),([-+]?[\d.]+),([-+]?[\d.]+)>\s*}'    # Normal 3
    )

    for match in triangle_pattern.finditer(mesh_data):
        # Extract vertices and normals
        v1 = (float(match.group(1)), float(match.group(2)), float(match.group(3)))
        n1 = (float(match.group(4)), float(match.group(5)), float(match.group(6)))
        v2 = (float(match.group(7)), float(match.group(8)), float(match.group(9)))
        n2 = (float(match.group(10)), float(match.group(11)), float(match.group(12)))
        v3 = (float(match.group(13)), float(match.group(14)), float(match.group(15)))
        n3 = (float(match.group(16)), float(match.group(17)), float(match.group(18)))

        # Ensure unique vertices and normals
        v1_index = add_to_list(vertices, vertex_map, v1)
        v2_index = add_to_list(vertices, vertex_map, v2)
        v3_index = add_to_list(vertices, vertex_map, v3)

        n1_index = add_to_list(normals, {}, n1)
        n2_index = add_to_list(normals, {}, n2)
        n3_index = add_to_list(normals, {}, n3)

        # Store the face
        faces.append((v1_index, v2_index, v3_index, n1_index, n2_index, n3_index))

    return vertices, normals, faces

def add_to_list(lst, index_map, item):
    """ Ensures unique values in a list and returns 1-based index. """
    if item in index_map:
        return index_map[item] + 1  # OBJ uses 1-based indexing
    index_map[item] = len(lst)
    lst.append(item)
    return len(lst)

def write_obj_file(vertices, normals, faces, output_filename):
    with open(output_filename, 'w') as obj_file:
        # Write vertices
        for vertex in vertices:
            obj_file.write(f"v {vertex[0]} {vertex[1]} {vertex[2]}\n")

        # Write normals
        for normal in normals:
            obj_file.write(f"vn {normal[0]} {normal[1]} {normal[2]}\n")

        # Write faces with normal indices
        for face in faces:
            obj_file.write(f"f {face[0]}//{face[3]} {face[1]}//{face[4]} {face[2]}//{face[5]}\n")

def main():
    # Ensure correct number of arguments

    print(f"Received arguments: {sys.argv}")  # Debugging line


    input_file = sys.argv[5]
    output_file = sys.argv[6]

    print("input file", input_file)
    print("output file", output_file)
    # Read the contents of the .inc file
    try:
        with open(input_file, 'r') as file:
            mesh_data = file.read()
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found.")
        sys.exit(1)

    # Process the file and write to .obj
    vertices, normals, faces = parse_mesh_data(mesh_data)
    write_obj_file(vertices, normals, faces, output_file)
    print(f"OBJ file '{output_file}' created successfully!")

if __name__ == "__main__":
    main()
