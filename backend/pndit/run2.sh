#!/bin/bash

# Define the full Blender path for macOS
BLENDER_PATH="/Applications/Blender.app/Contents/MacOS/Blender"

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Loop through each subdirectory in the script's directory
for dir in "$SCRIPT_DIR"/*/; do
    # Find all INC files in the subdirectory
    inc_files=$(find "$dir" -maxdepth 1 -type f -name "*.inc")

    # Check if there are any INC files in the directory
    if [[ -n "$inc_files" ]]; then
        for inc_file in $inc_files; do
            # Define the output file name (same name but with .obj extension)
            output_file="${inc_file%.inc}.obj"

            # Run Blender with the Python script, ensuring arguments are correctly passed
            echo "Processing: $inc_file -> $output_file"
            "$BLENDER_PATH" --background --python "$SCRIPT_DIR/code_1.py" -- "$inc_file" "$output_file"
        done
    fi
done
