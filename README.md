## Features
- User authentication with JWT.
- Create, update, delete, and search notes.
- Rich text editor for notes using **React Quill**.
- Reminder setting functionality with **React Datepicker**.
- Responsive UI styled with **React Bootstrap**.
- Autosave functionality for quick note creation.

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (for frontend)
- [Python 3.x](https://www.python.org/downloads/) (for backend)


### Backend (Flask)
1. Clone the repository and navigate to the backend directory:
`git clone https://github.com/MadanNeupane/Notes.git`
`cd backend`
2. Create a virtual environment:
`python -m venv venv`
3. Activate the virtual environment:
- For macOS/Linux:
`source venv/bin/activate`
- For Windows:
`.\venv\Scripts\activate`
4. Install backend dependencies:
`pip install -r requirements.txt`
5. Set up environment variables:
- Copy `.env.example` to `.env`:
`cp .env.example .env`
- Edit `.env` to configure your environment variables (e.g., Flask app secret, database URI, JWT settings).
6. Start the Flask development server:
`flask run`

### Frontend (React)
1. Navigate to the frontend directory:
`cd frontend`
2. Install frontend dependencies:
`npm install`
3. Set up environment variables:
- Copy `.env.example` to `.env`:
`cp .env.example .env`
- Edit `.env` to configure environment variables (e.g., API endpoint for Flask backend).
4. Start the React development server:
`npm run dev`

## Libraries Used
### Frontend
1.  **React Bootstrap** - For styling and UI components.\
Documentation: [React Bootstrap Docs](https://react-bootstrap.netlify.app/docs/getting-started/introduction)
2.  **React Quill** - A rich text editor for note content.\
NPM: [React Quill](https://www.npmjs.com/package/react-quill)
3.  **React Datepicker** - For selecting reminder times.\
NPM: [React Datepicker](https://www.npmjs.com/package/react-datepicker)

### Backend
1.  **PyJWT** - For JWT-based authentication in Flask.\
GitHub: [PyJWT](https://github.com/jpadilla/pyjwt)
2.  **Celery** - For background tasks (sending reminder emails).\
GitHub: [Celery](https://github.com/celery/celery)

## Usage
-  **Creating a Note**: Enter the note in the rich text editor and optionally set a reminder time.
-  **Autosave**: Enable autosave to automatically save notes after 10 seconds of inactivity.
-  **Search**: Filter notes by content using the search bar.
-  **Reminders**: If a reminder is set, the app will notify you via email at the specified time.

----
madan, 2024