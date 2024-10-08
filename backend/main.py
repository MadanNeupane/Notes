import os
from flask import request, jsonify, send_from_directory
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from config import app, db
from models import User, Note, Reminder
from auth_helpers import login_required

'''
# Commented out until the app is deployed
# Server static files from the "dist" folder under the "frontend" directory
frontend_folder = os.path.join(os.getcwd(),"..","frontend")
dist_folder = os.path.join(frontend_folder,"dist")

@app.route("/",defaults={"filename":""})
@app.route("/<path:filename>")
def index(filename):
  if not filename:
    filename = "index.html"
  return send_from_directory(dist_folder,filename)
'''

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

# Get user profile
@app.route("/me", methods=["GET"])
@login_required
def me(current_user):
    user = User.query.get(current_user.id)
    return jsonify(user.to_json()), 200

# Helper function to parse reminder time
def parse_reminder_time(reminder_time_str):
    try:
        return datetime.strptime(reminder_time_str, "%Y-%m-%d %H:%M:%S")
    except (ValueError, TypeError):
        return None


# Create new note
@app.route('/notes', methods=['POST'])
@login_required
def create_note(current_user):
    data = request.json

    content = data.get('content')
    if not content:
        return jsonify({"error": "Content is required"}), 400

    reminder_time_str = data.get('reminder_time')
    reminder_time = parse_reminder_time(reminder_time_str)

    note = Note(content=content, reminder_time=reminder_time, user_id=current_user.id)
    db.session.add(note)
    db.session.commit()

    return jsonify(note.to_json()), 201

# Get all notes or search by content
@app.route('/notes', methods=['GET'])
@login_required
def get_notes(current_user):
    search_query = request.args.get('search', '').strip()

    if search_query:
        notes = Note.query.filter(Note.user_id == current_user.id, Note.content.ilike(f"%{search_query}%")).all()
    else:
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

    content = data.get('content')
    if content:
        note.content = content

    reminder_time_str = data.get('reminder_time')
    print(reminder_time_str, "reminder_time_str")
    if reminder_time_str != None:
        reminder_time = parse_reminder_time(reminder_time_str)
        note.reminder_time = reminder_time
    else:
        note.reminder_time = None

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

# Set or update reminder
@app.route('/reminders', methods=['POST'])
def create_or_update_reminder():
    data = request.get_json()
    note_id = data.get('note_id')
    reminder_time = data.get('reminder_time')

    # Check if the reminder already exists
    reminder = Reminder.query.filter_by(note_id=note_id).first()

    if reminder:
        # Update the existing reminder
        # reminder.note.reminder_time = parse_reminder_time(reminder_time)
        reminder.last_delivered_at = None
        reminder.is_sent = False
        db.session.commit()
        return jsonify({'message': 'Reminder updated successfully'}), 200
    else:
        # Create a new reminder
        new_reminder = Reminder(note_id=note_id)
        db.session.add(new_reminder)
        db.session.commit()
        return jsonify({'message': 'Reminder created successfully'}), 201

# TODO:
# 9. Send email to users with reminders


if __name__ == "__main__":
    with app.app_context():
        db.create_all() # Create database when app starts

    app.run(debug=True)
