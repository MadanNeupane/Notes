from config import app, db
from models import User

@app.route("/", methods=["GET"])
def index():
    return "Start of the Levo assignment"


if __name__ == "__main__":
    with app.app_context():
        db.create_all() # Create database when app starts

    app.run(debug=True)
