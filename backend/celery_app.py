import os
from celery import Celery
from flask import Flask, current_app
from flask_mail import Mail, Message
from config import db, CELERY_BROKER_URL, CELERY_RESULT_BACKEND
from models import Note, User, Reminder
from datetime import datetime, timedelta, timezone

app = Flask(__name__)

# Configure Celery
celery = Celery(__name__, broker=CELERY_BROKER_URL, backend=CELERY_RESULT_BACKEND)

# Initialize Mail
# mail = Mail(app)
MAIL_USERNAME = os.getenv('MAIL_USERNAME')
mail = Mail(current_app)

# Define the periodic task
@celery.task
def send_reminder_email_task():
    current_time = datetime.now(timezone.utc)
    upcoming_minute = current_time + timedelta(minutes=1)

    # Query notes with reminder_time within the next minute
    notes = Note.query.filter(
        Note.reminder_time >= current_time,
        Note.reminder_time < upcoming_minute
    ).all()

    for note in notes:
        user = User.query.get(note.user_id)
        send_reminder_email(user.email, note.content, note.id)

def send_reminder_email(email, content, note_id):
    note_url = f"{os.getenv('FRONTEND_DOMAIN')}/notes"
    msg = Message('Reminder: Your Note', sender=MAIL_USERNAME, recipients=[email])
    msg.body = f"Here is your reminder:\n\n{content}\n\nView your note here: {note_url}"

    try:
        mail.send(msg)

        # Update the reminder record
        reminder = Reminder.query.filter_by(note_id=note_id).first()
        if reminder:
            reminder.is_sent = True
            reminder.last_delivered_at = datetime.now(timezone.utc)
            db.session.commit()

        print(f"Reminder email sent to {email}")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")

# Celery Beat schedule
celery.conf.beat_schedule = {
    'check-reminders-every-minute': {
        'task': 'send_reminder_email_task',
        'schedule': 60.0,  # Run every minute
    },
}
celery.conf.timezone = 'UTC'
