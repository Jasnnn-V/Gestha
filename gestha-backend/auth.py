from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db
import jwt
import datetime
import os

auth_bp = Blueprint('auth', __name__)
SECRET_KEY = os.environ.get('SECRET_KEY', 'gestha-secret-2026')

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except:
        return None

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email dan password wajib diisi"}), 400
    
    conn = get_db()
    try:
        conn.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (data.get('username', ''), data['email'], 
             generate_password_hash(data['password']))
        )
        conn.commit()
        return jsonify({"message": "Registrasi berhasil!"}), 201
    except Exception as e:
        return jsonify({"error": "Email sudah terdaftar"}), 400
    finally:
        conn.close()

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email dan password wajib diisi"}), 400
    
    conn = get_db()
    user = conn.execute(
        'SELECT * FROM users WHERE email = ?', (data['email'],)
    ).fetchone()
    conn.close()
    
    if not user or not check_password_hash(user['password_hash'], data['password']):
        return jsonify({"error": "Email atau password salah"}), 401
    
    token = generate_token(user['id'])
    return jsonify({
        "message": "Login berhasil!",
        "token": token,
        "username": user['username']
    })