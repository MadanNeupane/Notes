from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
from config import db

def lazy_utc_now():
    return datetime.now(tz=timezone.utc)

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }


class Note(db.Model):
    __tablename__ = 'notes'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lazy_utc_now)
    updated_at = db.Column(db.DateTime, default=lazy_utc_now, onupdate=lazy_utc_now)
    reminder_time = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', backref='notes')

    def to_json(self):
        return {
            'id': self.id,
            'content': self.content,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'reminder_time': self.reminder_time,
            'user_id': self.user_id
        }


class Reminder(db.Model):
    __tablename__ = 'reminders'

    id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False)
    note = db.relationship('Note', backref='reminders')
    is_sent = db.Column(db.Boolean, default=False)
    last_delivered_at = db.Column(db.DateTime, nullable=True)

    def to_json(self):
        return {
            'id': self.id,
            'reminder_time': self.note.reminder_time,
            'note_id': self.note_id,
            'is_sent': self.is_sent,
            'last_delivered_at': self.last_delivered_at
        }
