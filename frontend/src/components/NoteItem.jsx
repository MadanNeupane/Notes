const NoteItem = ({ note, handleShowModal, deleteNote }) => {
  return (
    <li className="list-group-item d-flex justify-content-between align-items-center">
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
  );
};

export default NoteItem;
