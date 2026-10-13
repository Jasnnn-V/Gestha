from flask import Blueprint, request, jsonify
from database import get_db
from auth import verify_token

cattle_bp = Blueprint('cattle', __name__)

def get_user_from_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    return verify_token(token)

# GET semua sapi milik user + POST tambah sapi baru
@cattle_bp.route('/cattle', methods=['GET', 'POST'])
def cattle_list():
    user_id = get_user_from_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db()

    if request.method == 'GET':
        rows = conn.execute(
            'SELECT * FROM cattle WHERE user_id = ? ORDER BY created_at DESC',
            (user_id,)
        ).fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])

    if request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('name'):
            return jsonify({"error": "Nama sapi wajib diisi"}), 400
        conn.execute(
            'INSERT INTO cattle (user_id, name, tag_id, birth_date, notes, ib_date) VALUES (?, ?, ?, ?, ?, ?)',
            (user_id, data['name'], data.get('tag_id'), data.get('birth_date'), data.get('notes'), data.get('ib_date'))
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Sapi berhasil ditambahkan!"}), 201

# GET detail + PUT edit + DELETE hapus sapi by ID
@cattle_bp.route('/cattle/<int:cattle_id>', methods=['GET', 'PUT', 'DELETE'])
def cattle_detail(cattle_id):
    user_id = get_user_from_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db()
    sapi = conn.execute(
        'SELECT * FROM cattle WHERE id = ? AND user_id = ?',
        (cattle_id, user_id)
    ).fetchone()

    if not sapi:
        conn.close()
        return jsonify({"error": "Sapi tidak ditemukan"}), 404

    if request.method == 'GET':
        conn.close()
        return jsonify(dict(sapi))

    if request.method == 'PUT':
        data = request.get_json()
        conn.execute(
            'UPDATE cattle SET name=?, tag_id=?, birth_date=?, notes=?, ib_date=? WHERE id=?',
            (
                data.get('name', sapi['name']),
                data.get('tag_id', sapi['tag_id']),
                data.get('birth_date', sapi['birth_date']),
                data.get('notes', sapi['notes']),
                data.get('ib_date', sapi['ib_date']),
                cattle_id
            )
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Data sapi berhasil diupdate!"})

    if request.method == 'DELETE':
        conn.execute('DELETE FROM cattle WHERE id = ?', (cattle_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Sapi berhasil dihapus!"})