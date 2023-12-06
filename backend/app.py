from flask import Flask, jsonify, Response
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)

CORS(app, resources={r"*": {"origins": "*"}})

@app.route('/plot_data', methods=['GET'])
def plot_data():
    relative_path = 'deloc-vis-main/data/pndit/sorted_deloc_energies.pndit.csv'
    df = pd.read_csv(relative_path)
    df = df[['Phi', 'Theta', 'E_deloc']]
    data = df.to_dict(orient='records')
    return jsonify(data)

@app.route('/structures/<path:file_path>', methods=['GET'])
def structures(file_path):
    base_path = 'deloc-vis-main/data/pndit/structures/'
    full_path = os.path.join(base_path, file_path)
    
    if not os.path.isfile(full_path):
        return jsonify({"error": "File not found"}), 404
    
    with open(full_path, 'r') as file:
        content = file.read()

    return jsonify({"data": content})

@app.route('/cubes/<path:file_path>', methods=['GET'])
def cubes(file_path):
    base_path = 'p3ht/planar-orbitals-p3mt/'
    full_path = os.path.join(base_path, file_path)
    
    if not os.path.isfile(full_path):
        return "File not found", 404
    
    with open(full_path, 'r') as file:
        content = file.read()

    return Response(content)

if __name__ == '__main__':
    app.run(debug=True)