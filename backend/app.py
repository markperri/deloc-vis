from flask import Flask, jsonify, Response
from flask_cors import CORS
import pandas as pd
import os
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={r"*": {"origins": allowed_origins}})

def encode_file_to_base64(file_path):
    """Reads a file and returns its base64-encoded content."""
    with open(file_path, "rb") as file:
        return base64.b64encode(file.read()).decode("utf-8")

@app.route('/plot_data/<path:file_path>', methods=['GET'])
def plot_data(file_path):
    base_path = 'graph-data/'
    relative_path = os.path.join(base_path, file_path)
    if not os.path.isfile(relative_path):
        return jsonify({"error": "File not found"}), 404
    df = pd.read_csv(relative_path)
    df = df[['Phi', 'Theta', 'E_deloc']]
    data = df.to_dict(orient='records')
    return jsonify(data)

@app.route('/structures/<path:file_path>', methods=['GET'])
def structures(file_path):
    base_path = 'rotation-mol2s/'
    full_path = os.path.join(base_path, file_path)
    
    if not os.path.isfile(full_path):
        return jsonify({"error": "File not found"}), 404
    
    with open(full_path, 'r') as file:
        content = file.read()

    return jsonify({"data": content})

@app.route('/cubes/<path:file_path>', methods=['GET'])
def cubes(file_path):
    base_path = 'rotation-cubes/'
    full_path = os.path.join(base_path, file_path)
    
    if not os.path.isfile(full_path):
        return "File not found", 404
    
    with open(full_path, 'r') as file:
        content = file.read()

    return Response(content)


@app.route('/folder/<path:folder_path>', methods=['GET'])
def p3ht_folder(folder_path):
    base_path = folder_path
    if not os.path.exists(base_path) or not os.path.isdir(base_path):
        return jsonify({"error": "Folder not found"}), 404

    required_files = ["Isoober.stl", "Molekeul.stl"]
    file_data = {}

    for file in required_files:
        file_path = os.path.join(base_path, file)
        if os.path.exists(file_path):
            file_data[file] = encode_file_to_base64(file_path)

    glb_files = [f for f in os.listdir(base_path) if f.endswith(".glb")]
    if glb_files:
        glb_file_path = os.path.join(base_path, glb_files[0])
        renamed_glb_path = os.path.join(base_path, "color.glb")
        os.rename(glb_file_path, renamed_glb_path)
        file_data["color.glb"] = encode_file_to_base64(renamed_glb_path)

    if not file_data:
        return jsonify({"error": "No required files found"}), 404

    return jsonify({"files": file_data})


if __name__ == '__main__':
    app.run(debug=True)