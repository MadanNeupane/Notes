import { Toast } from 'react-bootstrap';

const ToastMessage = ({ showToast, toastMessage, setShowToast }) => {
  return (
    <Toast
      onClose={() => setShowToast(false)}
      show={showToast}
      delay={3000}
      autohide
      style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}
    >
      <Toast.Body>{toastMessage}</Toast.Body>
    </Toast>
  );
};

export default ToastMessage;
