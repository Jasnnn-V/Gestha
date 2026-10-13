from flask import Flask, request, jsonify
from flask_cors import CORS
from predict_utils import predict_image
from camera import camera
from auth import auth_bp
from cattle import cattle_bp
from database import init_db
from detect import detect_bp
import cv2
import base64
import numpy as np 
import os

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(cattle_bp)
app.register_blueprint(detect_bp)
init_db()

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "GESTHA API berjalan!", "version": "1.0.0"})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file"}), 400
    file = request.files['file']
    allowed = {'jpg', 'jpeg', 'png'}
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in allowed:
        return jsonify({"error": "Format file harus JPG atau PNG"}), 400
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    try:
        result = predict_image(filepath)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

@app.route('/camera/start', methods=['POST'])
def start_camera():
    camera.start()
    return jsonify({"status": "Camera started"})

@app.route('/camera/stop', methods=['POST'])
def stop_camera():
    camera.stop()
    return jsonify({"status": "Camera stopped"})

@app.route('/camera/frame', methods=['GET'])
def get_frame():
    frame_b64 = camera.get_frame_base64()
    if frame_b64 is None:
        return jsonify({"error": "No frame available"}), 404
    return jsonify({"frame": frame_b64})

@app.route('/camera/scan', methods=['POST'])
def scan_frame():
    if camera.frame is None:
        return jsonify({"error": "Kamera belum aktif"}), 400
    filepath = 'uploads/live_frame.jpg'
    cv2.imwrite(filepath, camera.frame)
    try:
        result = predict_image(filepath)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/camera/scan-frame', methods=['POST'])
def scan_from_frontend():
    data = request.get_json()
    if not data or 'frame' not in data:
        return jsonify({"error": "Tidak ada frame"}), 400
    try:
        frame_data = data['frame'].split(',')[1] if ',' in data['frame'] else data['frame']
        img_bytes = base64.b64decode(frame_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        filepath = 'uploads/scan_frontend.jpg'
        cv2.imwrite(filepath, frame)
        result = predict_image(filepath)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)