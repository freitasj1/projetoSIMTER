from flask import Flask, jsonify
import signal
import os

app = Flask(__name__)

@app.route('/api', methods=['GET'])
def get_data():
    data = {"lab": 1, "ids": [1, 2, 3]}

    return jsonify(data)

@app.route('/shutdown', methods=['GET'])
def shutdown():
    os.kill(os.getpid(), signal.SIGINT)
    return 'Server shutting down...'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
