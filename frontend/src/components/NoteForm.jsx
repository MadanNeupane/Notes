import ReactQuill from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css';
import DatePicker from "react-datepicker";
import { Form } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";


const NoteForm = ({ newNote, setNewNote, reminderTime, setReminderTime, createNote, autosaveEnabled, setAutosaveEnabled }) => {
  return (
    <div className="card mb-3 p-3">
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
          label="Autosave"
          checked={autosaveEnabled}
          onChange={() => {
            setAutosaveEnabled(!autosaveEnabled);
          }}
        />
      </div>
    </div>
  );
};

export default NoteForm;
