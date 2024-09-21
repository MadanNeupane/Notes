import { useState, useEffect, useRef } from "react";
import api from "../../api";
import { Modal, Button, Form, Toast, Card } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [reminderTime, setReminderTime] = useState(null); // Optional reminder time
  const [modalReminderTime, setModalReminderTime] = useState(null); // Optional modal reminder time
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [username, setUsername] = useState("");
  const [autosaveEnabled, setAutosaveEnabled] = useState(false); // Autosave toggle

  const autosaveTimeoutRef = useRef(null); // Timeout reference for autosave

  useEffect(() => {
    fetchNotes();
    fetchUser();
  }, []);

  useEffect(() => {
    // Update filtered notes when search query changes
    if (searchQuery) {
      setFilteredNotes(
        notes
          .filter(note =>
            note.content.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      );
    } else {
      setFilteredNotes(notes);
    }
  }, [searchQuery, notes]);

  // Watch for changes in the newNote and trigger autosave after 10 seconds of inactivity
  useEffect(() => {
    if (autosaveEnabled && newNote) {
      // Clear any previous timeout
      clearTimeout(autosaveTimeoutRef.current);

      // Set a new timeout for 10 seconds
      autosaveTimeoutRef.current = setTimeout(() => {
        createNote();
        setNewNote(""); // Clear editor after autosave
        showToastMessage("Note autosaved successfully");
      }, 10000);
    }

    // Cleanup function to clear the timeout
    return () => clearTimeout(autosaveTimeoutRef.current);
  }, [newNote, autosaveEnabled]);

  const filterPassedTime = time => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    return currentDate.getTime() < selectedDate.getTime();
  };

  const fetchNotes = async () => {
    try {
      const response = await api.get("/notes");
      setNotes(
        response.data.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        )
      );
    } catch (err) {
      showToastMessage("Error fetching notes");
      console.error("Error fetching notes", err);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await api.get("/me");
      setUsername(response.data.username);
    } catch (err) {
      console.error("Error fetching user data", err);
    }
  };

  const showToastMessage = message => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const formatReminderTime = date => {
    return date ? date.toISOString().slice(0, 19).replace("T", " ") : null;
  };

  const handleShowModal = note => {
    setCurrentNote(note);
    setModalReminderTime(
      note.reminder_time ? new Date(note.reminder_time) : null
    );
    setShowModal(true);
  };

  const handleSearchChange = e => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const createNote = async () => {
    if (!newNote) {
      showToastMessage("You can not save an empty note");
      return;
    }
    try {
      await api.post("/notes", {
        content: newNote,
        reminder_time: formatReminderTime(reminderTime), // Handle optional reminder time
      });
      setNewNote("");
      setReminderTime(null);
      fetchNotes();

      if (reminderTime) {
        // remaining time for the reminder
        const now = new Date();
        const timeDifference = reminderTime.getTime() - now.getTime(); // Difference in milliseconds

        // Convert milliseconds to seconds, minutes, hours, or days
        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        let timeMessage;
        if (days > 0) {
          timeMessage = `${days} day${days > 1 ? 's' : ''} from now`;
        } else if (hours > 0) {
          timeMessage = `${hours} hour${hours > 1 ? 's' : ''} from now`;
        } else if (minutes > 0) {
          timeMessage = `${minutes} minute${minutes > 1 ? 's' : ''} from now`;
        } else {
          timeMessage = `${seconds} second${seconds > 1 ? 's' : ''} from now`;
        }

        showToastMessage(`Note created successfully. You'll be reminded in ${timeMessage}`);
      } else {
        showToastMessage("Note created successfully");
      }
    } catch (err) {
      showToastMessage("Error creating note");
      console.error("Error creating note", err);
    }
  };

  const deleteNote = async id => {
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
      showToastMessage("Note deleted successfully");
    } catch (err) {
      showToastMessage("Error deleting note");
      console.error("Error deleting note", err);
    }
  };

  const updateNote = async () => {
    try {
      await api.put(`/notes/${currentNote.id}`, {
        content: currentNote.content,
        reminder_time: formatReminderTime(modalReminderTime), // Handle optional reminder time
      });
      fetchNotes();
      setShowModal(false);
      showToastMessage("Note updated successfully");
    } catch (err) {
      showToastMessage("Error updating note");
      console.error("Error updating note", err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-end mb-3 align-items-center gap-2">
        <span>Hello, {username}</span>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Toast for alerts */}
      <Toast show={showToast} onClose={() => setShowToast(false)} className="mb-3">
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>

      {/* Add New Note */}
      <Card className="mb-3 p-3">
        <div>
          <ReactQuill
            theme="snow"
            value={newNote}
            onChange={setNewNote}
            placeholder="New note content"
          />
          <div className="input-group mt-2">
            <DatePicker
              selected={reminderTime}
              onChange={date => setReminderTime(date)}
              minDate={new Date()}
              filterTime={filterPassedTime}
              showTimeSelect
              dateFormat="Pp"
              className="form-control"
              isClearable
              placeholderText="Set reminder (optional)"
            />
          </div>
          <div className="d-flex align-items-center justify-content-between mt-3">
            <button className="btn btn-success" onClick={createNote}>
              Add Note
            </button>
            <Form.Check
              type="switch"
              id="autosave-switch"
              label="Enable Autosave"
              title="This will save your note in 10 seconds of inactivity"
              checked={autosaveEnabled}
              onChange={() => setAutosaveEnabled(!autosaveEnabled)}
            />
          </div>
        </div>
      </Card>

      <div className="form-group mb-3">
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search notes"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <p>No notes found</p>
      ) : (
        <>
          <h4>My Notes</h4>
          <ul className="list-group mb-3">
            {filteredNotes.map(note => (
              <li
                key={note.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div className="d-flex flex-column">
                  <span dangerouslySetInnerHTML={{ __html: note.content }} />
                  <span className="text-muted">
                    {note.reminder_time ? "Reminder set" : "No reminder set"}
                  </span>
                  <small className="text-muted font-italic">
                    <em>
                      {note.reminder_time &&
                        new Date(note.reminder_time).toLocaleString()}
                    </em>
                  </small>
                </div>
                <div>
                  <button
                    className="btn btn-warning mx-2"
                    onClick={() => handleShowModal(note)}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteNote(note.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Update Note Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Content</Form.Label>
            <ReactQuill
              theme="snow"
              value={currentNote?.content || ""}
              onChange={content =>
                setCurrentNote(prevNote => ({ ...prevNote, content }))
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Reminder Time</Form.Label>
            <DatePicker
              selected={modalReminderTime}
              onChange={date => setModalReminderTime(date)}
              minDate={new Date()}
              filterTime={filterPassedTime}
              showTimeSelect
              dateFormat="Pp"
              className="form-control"
              isClearable
              placeholderText="Set reminder (optional)"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={updateNote}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Notes;
