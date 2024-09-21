from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from config import app, db
from models import User, Note
from auth_helpers import login_required

# Register new user
@app.route("/register", methods=["POST"])
def register():
    print(request.json, 'request.json')
    username = request.json["username"]
    email = request.json["email"]
    password = request.json["password"]
    print("Registering user:", username, email, password)

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"error": "Username or email already exists"}), 409

    try:
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return user.to_json(), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Login user
@app.route("/login", methods=["POST"])
def login():
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id, expires_delta=timedelta(hours=1))  # 1 hour expiration
        return jsonify({
            "token": access_token,
            "username": user.username
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401


# Create new note
@app.route('/notes', methods=['POST'])
@login_required
def create_note(current_user):
    data = request.json

    if 'content' not in data or not data['content']:
        return jsonify({"error": "Content is required"}), 400

    reminder_time = data.get('reminder_time', None)
    if reminder_time:
        reminder_time = datetime.strptime(reminder_time, "%Y-%m-%d %H:%M:%S")

    note = Note(content=data['content'], reminder_time=reminder_time, user_id=current_user.id)
    db.session.add(note)
    db.session.commit()

    return jsonify(note.to_json()), 201

# Get all notes
@app.route('/notes', methods=['GET'])
@login_required
def get_notes(current_user):
    notes = Note.query.filter_by(user_id=current_user.id).all()
    return jsonify([note.to_json() for note in notes]), 200

# Get single note
@app.route('/notes/<int:note_id>', methods=['GET'])
@login_required
def get_note(current_user, note_id):
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
    if note is None:
        return jsonify({"error": "Note not found"}), 404
    return jsonify(note.to_json()), 200

# Update note
@app.route('/notes/<int:note_id>', methods=['PUT'])
@login_required
def update_note(current_user, note_id):
    data = request.json
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()

    if note is None:
        return jsonify({"error": "Note not found"}), 404

    if 'content' in data:
        note.content = data['content']

    if 'reminder_time' in data:
        note.reminder_time = datetime.strptime(data['reminder_time'], "%Y-%m-%d %H:%M:%S")

    db.session.commit()
    return jsonify(note.to_json()), 200

# Delete note
@app.route('/notes/<int:note_id>', methods=['DELETE'])
@login_required
def delete_note(current_user, note_id):
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()

    if note is None:
        return jsonify({"error": "Note not found"}), 404

    db.session.delete(note)
    db.session.commit()
    return jsonify({"message": "Note deleted successfully"}), 200

# TODO:
# 6. Search for notes based on content
# 8. Set reminder on notes
# 9. Send email to users with reminders


if __name__ == "__main__":
    with app.app_context():
        db.create_all() # Create database when app starts

    app.run(debug=True)
