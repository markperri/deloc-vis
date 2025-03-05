#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Loop through each subdirectory in the script's directory
for dir in "$SCRIPT_DIR"/*/; do
    # Find all OBJ files in the subdirectory
    obj_files=$(find "$dir" -maxdepth 1 -type f -name "*.obj")

    # Check if there are any OBJ files in the directory
    if [[ -n "$obj_files" ]]; then
        for obj_file in $obj_files; do
            # Normalize the path to avoid double slashes
            obj_file=$(realpath "$obj_file")
            
            # Define the output file name (same name but with .stl extension)
            output_file="${obj_file%.obj}.stl"

            # Run Python script (tostl.py) to convert OBJ to STL
            echo "Processing: $obj_file -> $output_file"
            python3 "$SCRIPT_DIR/tostl.py" "$obj_file" "$output_file"
        done
    fi
done
