from flask import request, jsonify
from config import app, db
from models import User


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
        return user.to_json()

    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/", methods=["GET"])
def index():
    return "Start of the Levo assignment"


if __name__ == "__main__":
    with app.app_context():
        db.create_all() # Create database when app starts

    app.run(debug=True)


# TODO:
# 1. Create new note
# 2. Update existing note
# 3. Delete existing note
# 4. Get all notes
# 5. Get single note
# 6. Search for notes based on content
# 7. Get all users
# 8. Set reminder on notes
# 9. Send email to users with reminders