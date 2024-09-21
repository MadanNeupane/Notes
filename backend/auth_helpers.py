import os
import jwt
from functools import wraps
from flask import request, jsonify
from models import User


SECRET_KEY = os.getenv("JWT_SECRET_KEY")

def get_current_user():
    token = request.headers.get('Authorization')
    if not token:
        return None

    try:
        token = token.split()[1]
        print(token, "token")

        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        print(payload, "payload")

        # Fetch the user by ID from the payload
        user_id = payload.get('sub')
        if not user_id:
            return None

        user = User.query.get(user_id)
        print(user, "user")
        return user

    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        print(f"Token error: {e}")
        return None


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        print(user, "user")
        if user is None:
            return jsonify({"error": "Unauthorized"}), 401
        return f(user, *args, **kwargs)
    return decorated_function
