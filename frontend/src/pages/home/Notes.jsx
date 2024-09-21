import { useState, useEffect } from "react";
import api from "../../api";
import { Modal, Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [reminderTime, setReminderTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get("/notes", {
        params: { search: searchQuery },
      });
      setNotes(response.data.reverse());
    } catch (err) {
      console.error("Error fetching notes", err);
    }
  };

  const createNote = async () => {
    try {
      await api.post("/notes", { content: newNote, reminder_time: reminderTime });
      setNewNote("");
      setReminderTime(new Date());
      fetchNotes(); // Reload notes after creation
    } catch (err) {
      console.error("Error creating note", err);
    }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch (err) {
      console.error("Error deleting note", err);
    }
  };

  const handleShowModal = (note) => {
    setCurrentNote(note);
    setReminderTime(new Date(note.reminder_time || Date.now()));
    setShowModal(true);
  };

  const updateNote = async () => {
    try {
      await api.put(`/notes/${currentNote.id}`, {
        content: currentNote.content,
        reminder_time: reminderTime,
      });
      fetchNotes();
      setShowModal(false);
    } catch (err) {
      console.error("Error updating note", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Notes</h2>

      {/* Search Input */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search notes"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={fetchNotes}>Search</button>
      </div>

      {/* Add New Note */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="New note content"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <DatePicker
          selected={reminderTime}
          onChange={(date) => setReminderTime(date)}
          minDate={new Date()}
          showTimeSelect
          dateFormat="Pp"
          className="form-control mt-2"
        />
        <button className="btn btn-success mt-2" onClick={createNote}>Add Note</button>
      </div>

      {/* Notes List */}
      <ul className="list-group">
        {notes.map((note) => (
          <li key={note.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{note.content}</span>
            <div>
              <button className="btn btn-warning mx-2" onClick={() => handleShowModal(note)}>Update</button>
              <button className="btn btn-danger" onClick={() => deleteNote(note.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Update Note Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Content</Form.Label>
            <Form.Control
              type="text"
              value={currentNote?.content || ""}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Reminder Time</Form.Label>
            <DatePicker
              selected={reminderTime}
              onChange={(date) => setReminderTime(date)}
              showTimeSelect
              dateFormat="Pp"
              className="form-control"
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
