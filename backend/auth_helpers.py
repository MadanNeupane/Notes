from functools import wraps
from flask import request, jsonify
from models import User

# Dummy auth function, replace with actual authentication mechanism
def get_current_user():
    token = request.headers.get('Authorization')
    if not token:
        return None
    # Logic to decode token and fetch user
    user = User.query.get(1)  # Replace with actual token decoding and user fetching
    return user

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if user is None:
            return jsonify({"error": "Unauthorized"}), 401
        return f(user, *args, **kwargs)
    return decorated_function
