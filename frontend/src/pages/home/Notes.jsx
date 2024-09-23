import { useState, useEffect, useRef } from "react";
import api from "../../api";
import { Modal, Button, Form, ToastContainer, Toast, Card } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const Notes = () => {
  // State management
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [reminderTime, setReminderTime] = useState(null);
  const [modalReminderTime, setModalReminderTime] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [autosaveEnabled, setAutosaveEnabled] = useState(false);
  const autosaveTimeoutRef = useRef(null);

  const userName = localStorage.getItem("username");

  useEffect(() => {
    fetchNotes();
  }, []);

  // Filter notes based on search query
  useEffect(() => {
    const filtered = searchQuery
      ? notes.filter(note =>
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : notes;

    setFilteredNotes(filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
  }, [searchQuery, notes]);

  // Autosave functionality
  useEffect(() => {
    if (autosaveEnabled && newNote.length > 5) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = setTimeout(() => {
        createNote();
        setNewNote("");
        showToastMessage("Note autosaved successfully");
      }, 10000);
    }
    return () => clearTimeout(autosaveTimeoutRef.current);
  }, [newNote, autosaveEnabled]);

  // Fetch notes
  const fetchNotes = async () => {
    try {
      const response = await api.get("/notes");
      setNotes(response.data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
    } catch (err) {
      showToastMessage("Error fetching notes");
      console.error("Error fetching notes", err);
    }
  };

  const showToastMessage = message => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const formatReminderTime = date => date ? date.toISOString().slice(0, 19).replace("T", " ") : null;

  const handleShowModal = note => {
    setCurrentNote(note);
    setModalReminderTime(note.reminder_time ? new Date(note.reminder_time) : null);
    setShowModal(true);
  };

  const handleSearchChange = e => setSearchQuery(e.target.value);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const validateNoteContent = noteContent => {
    if (noteContent.length < 5) {
      showToastMessage("Note content should at least contain 5 characters");
      return false;
    }
    return true;
  };

  const calculateRemainingTime = reminderTime => {
    const now = new Date();
    const timeDifference = reminderTime.getTime() - now.getTime();
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} from now`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} from now`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} from now`;
    return `${seconds} second${seconds > 1 ? 's' : ''} from now`;
  };

  const handleReminder = async (noteId, reminderTime) => {
    if (reminderTime) {
      await api.post(`/reminders`, {
        note_id: noteId,
        reminder_time: formatReminderTime(reminderTime),
      });
    }
  };

  const createNote = async () => {
    if (!validateNoteContent(newNote)) return;

    try {
      const response = await api.post("/notes", {
        content: newNote,
        reminder_time: formatReminderTime(reminderTime),
      });

      const noteId = response.data.id;
      setNewNote("");
      setReminderTime(null);
      fetchNotes();
      await handleReminder(noteId, reminderTime);

      showToastMessage(reminderTime ? `Note created successfully. You'll be reminded in ${calculateRemainingTime(reminderTime)}` : "Note created successfully");
    } catch (err) {
      showToastMessage("Error creating note");
      console.error("Error creating note", err);
      return;
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
    if (!validateNoteContent(currentNote.content)) return;

    try {
      await api.put(`/notes/${currentNote.id}`, {
        content: currentNote.content,
        reminder_time: formatReminderTime(modalReminderTime),
      });

      await handleReminder(currentNote.id, modalReminderTime);
      fetchNotes();
      setShowModal(false);
      showToastMessage(modalReminderTime ? `Note updated successfully. You'll be reminded in ${calculateRemainingTime(modalReminderTime)}` : "Note updated successfully");
    } catch (err) {
      showToastMessage("Error updating note");
      console.error("Error updating note", err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-end mb-3 align-items-center gap-2">
        <span>Hello, {userName}</span>
        <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
      </div>

      <Card className="mb-3 p-3">
        <ReactQuill
          theme="snow"
          value={newNote}
          onChange={setNewNote}
          placeholder="New note content"
        />
        <div className="input-group mt-2">
          <DatePicker
            selected={reminderTime}
            onChange={setReminderTime}
            filterDate={date => date >= new Date()}
            filterTime={time => new Date() < new Date(time)}
            showTimeSelect
            dateFormat="Pp"
            className="form-control"
            isClearable
            placeholderText="Set reminder (optional)"
          />
        </div>
        <div className="d-flex align-items-center justify-content-between mt-3">
          <button className="btn btn-success" onClick={createNote}>Add Note</button>
          <Form.Check
            type="switch"
            id="autosave-switch"
            label="Enable Autosave"
            title="This will save your note in 10 seconds of inactivity"
            checked={autosaveEnabled}
            onChange={() => setAutosaveEnabled(!autosaveEnabled)}
          />
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

      {filteredNotes.length === 0 ? (
        <p>No notes found</p>
      ) : (
        <>
          <h4>My Notes</h4>
          <ul className="list-group mb-3">
            {filteredNotes.map(note => (
              <li key={note.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div className="d-flex flex-column">
                  <span dangerouslySetInnerHTML={{ __html: note.content }} />
                  <span className="text-muted">{note.reminder_time ? "Reminder set" : "No reminder set"}</span>
                  {note.reminder_time && (
                    <small className="text-muted font-italic">
                      <em>{new Date(note.reminder_time).toLocaleString()}</em>
                    </small>
                  )}
                </div>
                <div>
                  <button className="btn btn-warning mx-2" onClick={() => handleShowModal(note)}>Update</button>
                  <button className="btn btn-danger" onClick={() => deleteNote(note.id)}>Delete</button>
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
              className="mb-2"
              theme="snow"
              value={currentNote?.content || ""}
              onChange={content => setCurrentNote(prevNote => ({ ...prevNote, content }))}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Reminder Time</Form.Label>
            <DatePicker
              selected={modalReminderTime}
              onChange={setModalReminderTime}
              filterDate={date => date >= new Date()}
              filterTime={time => new Date() < new Date(time)}
              showTimeSelect
              dateFormat="Pp"
              className="form-control"
              isClearable
              placeholderText="Set reminder (optional)"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="dark" onClick={updateNote}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Message */}
      <ToastContainer position="bottom-center" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} className="mb-3">
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Notes;
