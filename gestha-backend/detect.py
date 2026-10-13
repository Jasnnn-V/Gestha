from flask import Blueprint, request, jsonify
from database import get_db
from predict_utils import predict_image
from auth import verify_token
import os

detect_bp = Blueprint('detect', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_user_from_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    return verify_token(token)

@detect_bp.route('/detect', methods=['POST'])
def detect():
    user_id = get_user_from_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file"}), 400

    file = request.files['file']
    allowed = {'jpg', 'jpeg', 'png'}
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in allowed:
        return jsonify({"error": "Format file harus JPG atau PNG"}), 400

    # cattle_id wajib ada
    cattle_id = request.form.get('cattle_id')
    if not cattle_id:
        return jsonify({"error": "cattle_id wajib diisi"}), 400

    # Pastikan sapi milik user ini
    conn = get_db()
    sapi = conn.execute(
        'SELECT id FROM cattle WHERE id = ? AND user_id = ?',
        (cattle_id, user_id)
    ).fetchone()
    if not sapi:
        conn.close()
        return jsonify({"error": "Sapi tidak ditemukan"}), 404

    # Simpan file
    filepath = os.path.join(UPLOAD_FOLDER, f"detect_{user_id}_{file.filename}")
    file.save(filepath)

    try:
        result = predict_image(filepath)

        label      = result.get('label', 'Unknown')
        confidence = result.get('confidence', 0.0)

        # Simpan ke database sesuai struktur tabel detections
        cursor = conn.execute(
            '''INSERT INTO detections 
               (cattle_id, photo_path, result, confidence)
               VALUES (?, ?, ?, ?)''',
            (cattle_id, filepath, label, confidence)
        )
        conn.commit()
        detection_id = cursor.lastrowid
        conn.close()

        return jsonify({
            "detection_id": detection_id,
            "cattle_id"   : cattle_id,
            "result"      : label,
            "confidence"  : confidence,
            "message"     : f"Sapi diprediksi: {label} ({confidence:.1f}%)"
        })

    except Exception as e:
        conn.close()
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": str(e)}), 500


@detect_bp.route('/detect/history/<int:cattle_id>', methods=['GET'])
def detection_history(cattle_id):
    user_id = get_user_from_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db()

    # Pastikan sapi milik user ini
    sapi = conn.execute(
        'SELECT id FROM cattle WHERE id = ? AND user_id = ?',
        (cattle_id, user_id)
    ).fetchone()
    if not sapi:
        conn.close()
        return jsonify({"error": "Sapi tidak ditemukan"}), 404

    rows = conn.execute(
        '''SELECT * FROM detections 
           WHERE cattle_id = ? 
           ORDER BY created_at DESC''',
        (cattle_id,)
    ).fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])