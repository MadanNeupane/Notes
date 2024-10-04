import { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import api from "../api";
import NoteForm from "../components/NoteForm";
import SearchInput from "../components/SearchInput";
import NoteList from "../components/NoteList";
import UpdateNoteModal from "../components/UpdateNoteModal";
import ToastMessage from "../components/ToastMessage";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import getRemainingTime from "../utils/getRemainingTime";


const Notes = () => {
  // State management
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [reminderTime, setReminderTime] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);  // Modified to handle current note properly
  const [modalReminderTime, setModalReminderTime] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [autosaveEnabled, setAutosaveEnabled] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const autosaveTimeoutRef = useRef(null);
  const userName = localStorage.getItem("username");

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const filtered = searchQuery
      ? notes.filter(note =>
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : notes;

    setFilteredNotes(filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
  }, [searchQuery, notes]);

  useEffect(() => {
    if (autosaveEnabled && newNote.length > 5) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = setTimeout(() => {
        createNote();
        setNewNote("");
      }, 10000);
    }
    return () => clearTimeout(autosaveTimeoutRef.current);
  }, [newNote, autosaveEnabled]);

  // Helper functions
  const formatReminderTime = date => date ? date.toISOString().slice(0, 19).replace("T", " ") : null;

  const handleReminder = async (noteId, reminderTime) => {
    if (reminderTime) {
      await api.post(`/reminders`, {
        note_id: noteId,
        reminder_time: formatReminderTime(reminderTime),
      });
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await api.get("/notes");
      setNotes(response.data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
    } catch (err) {
      showToastMessage("Error fetching notes");
    }
  };

  const createNote = async () => {
    if (newNote.length < 5) {
      showToastMessage("Note content must be at least 5 characters long");
      return;
    }

    const noteData = {
      content: newNote,
      reminder_time: formatReminderTime(reminderTime),
    };

    try {
      const response = await api.post("/notes", noteData);
      setNotes(prevNotes => [response.data, ...prevNotes]);
      setNewNote("");
      setReminderTime(null);
      if (reminderTime) {
        await handleReminder(response.data.id, reminderTime);
        showToastMessage(`Note created successfully. You'll be reminded in ${getRemainingTime(reminderTime)}.`);
      } else {
        showToastMessage("Note created successfully.");
      }
    } catch (err) {
      showToastMessage("Error creating note");
    }
  };

  const deleteNote = async id => {
    setNoteToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      await api.delete(`/notes/${noteToDelete}`);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteToDelete));
      showToastMessage("Note deleted successfully");
    } catch (err) {
      showToastMessage("Error deleting note");
    } finally {
      setShowDeleteConfirmation(false);
      setNoteToDelete(null);
    }
  };

  const updateNote = async () => {
    if (currentNote.content.length < 5) {
      showToastMessage("Note content must be at least 5 characters long");
      return;
    }

    const updatedNoteData = {
      content: currentNote.content,
      reminder_time: formatReminderTime(modalReminderTime),
    };

    try {
      const response = await api.put(`/notes/${currentNote.id}`, updatedNoteData);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === currentNote.id ? { ...note, ...response.data } : note
        )
      );
      setShowModal(false);

      if (modalReminderTime) {
        await handleReminder(currentNote.id, modalReminderTime);
        showToastMessage(`Note updated successfully. You'll be reminded in ${getRemainingTime(modalReminderTime)}.`);
      } else {
        showToastMessage("Note updated successfully");
      }
    } catch (err) {
      showToastMessage("Error updating note");
    }
  };

  const showToastMessage = message => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-end mb-3 align-items-center">
        <span className="mx-2">Hello, {userName}</span>
        <Link to="/logout"><button className="btn btn-secondary">Logout</button></Link>
      </div>
      <NoteForm
        newNote={newNote}
        setNewNote={setNewNote}
        reminderTime={reminderTime}
        setReminderTime={setReminderTime}
        createNote={createNote}
        autosaveEnabled={autosaveEnabled}
        setAutosaveEnabled={setAutosaveEnabled}
      />
      <SearchInput searchQuery={searchQuery} handleSearchChange={e => setSearchQuery(e.target.value)} />
      <NoteList filteredNotes={filteredNotes} handleShowModal={note => {
        setCurrentNote(note);
        setModalReminderTime(note.reminder_time ? new Date(note.reminder_time) : null);
        setShowModal(true);
      }} deleteNote={deleteNote} />
      <UpdateNoteModal
        showModal={showModal}
        setShowModal={setShowModal}
        currentNote={currentNote}
        setCurrentNote={setCurrentNote}
        modalReminderTime={modalReminderTime}
        setModalReminderTime={setModalReminderTime}
        updateNote={updateNote}
      />
      <DeleteConfirmationModal
        show={showDeleteConfirmation}
        handleClose={() => setShowDeleteConfirmation(false)}
        handleDelete={confirmDeleteNote}
      />
      <ToastMessage showToast={showToast} setShowToast={setShowToast} toastMessage={toastMessage} />
    </div>
  );
};

export default Notes;
