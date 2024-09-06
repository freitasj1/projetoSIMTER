from flask import Flask, jsonify, request
import signal
import os

app = Flask(__name__)

data = {}

@app.route('/api', methods=['POST'])
def update_data():

    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    update = request.get_json()

    if "lab" in update:
        data["lab"] = update["lab"]

    if "ids" in update:
        if isinstance(update["ids"], list):
            data["ids"] = update["ids"]
        else:
            return jsonify({"error": "'ids' must be a list"}), 400


    return jsonify(data), 200

@app.route('/shutdown', methods=['GET'])
def shutdown():
    os.kill(os.getpid(), signal.SIGINT)
    return 'Server shutting down...'

@app.route('/api', methods=['GET'])
def get_data():

    return jsonify(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)