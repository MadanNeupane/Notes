import NoteItem from "./NoteItem";

const NoteList = ({ filteredNotes, handleShowModal, deleteNote }) => {
  return filteredNotes.length === 0 ? (
    <p>No notes found</p>
  ) : (
    <>
      <h4>My Notes</h4>
      <ul className="list-group mb-3">
        {filteredNotes.map(note => (
          <NoteItem key={note.id} note={note} handleShowModal={handleShowModal} deleteNote={deleteNote} />
        ))}
      </ul>
    </>
  );
};

export default NoteList;
