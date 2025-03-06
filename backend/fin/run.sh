#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Loop through each subdirectory in the script's directory
for dir in "$SCRIPT_DIR"/*/; do
    # Find the PDB file in the subdirectory
    pdb_file=$(find "$dir" -maxdepth 1 -type f -name "*.pdb")

    # Check if a PDB file exists
    if [[ -n "$pdb_file" ]]; then
        # Define the output file name (same name but with .gltf extension)
        output_file="${pdb_file%.pdb}.glb"
        
        # Run the Python script
        echo "Processing: $pdb_file -> $output_file"
        python "$SCRIPT_DIR/script.py" "$pdb_file" "$output_file"
    fi
done
