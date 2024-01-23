from flask import Flask, jsonify, Response
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)

CORS(app, resources={r"*": {"origins": "*"}})

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

if __name__ == '__main__':
    app.run(debug=True)