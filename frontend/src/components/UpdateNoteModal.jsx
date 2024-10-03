import { Modal, Button, Form } from "react-bootstrap";
import ReactQuill from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UpdateNoteModal = ({ showModal, setShowModal, currentNote, setCurrentNote, modalReminderTime, setModalReminderTime, updateNote }) => {
  return (
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
          <Form.Label style={{ marginRight: ".5rem" }}>Reminder Time</Form.Label>
          <DatePicker
            selected={modalReminderTime}
            onChange={setModalReminderTime}
            filterDate={date => date >= new Date()}
            filterTime={time => new Date() < new Date(time)}
            showTimeSelect
            dateFormat="Pp"
            isClearable
            className="form-control"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Close
        </Button>
        <Button variant="dark" onClick={updateNote}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateNoteModal;
