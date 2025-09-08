import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Modal,
  Button,
  Form,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const SignatureView = ({ Signature, signatureId }) => {
  const sigCanvas = useRef();

  // State
  const [showSignModal, setShowSignModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [signMethod, setSignMethod] = useState("type");
  const [typedName, setTypedName] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("pending"); // "pending" | "approved" | "declined"
  const [loading, setLoading] = useState(false);

  // Handlers
  const clearSignature = () => {
    if (sigCanvas.current) sigCanvas.current.clear();
  };

  const handleAccept = async () => {
    if (signMethod === "draw" && sigCanvas.current.isEmpty()) {
      alert("Please draw your signature first.");
      return;
    }
    if (signMethod === "type" && !typedName.trim()) {
      alert("Please type your name.");
      return;
    }

    const signatureData =
      signMethod === "draw"
        ? sigCanvas.current.getCanvas().toDataURL("image/png")
        : typedName;

    try {
      setLoading(true);

      await axios.put(`${API_URL}/signatures/${signatureId}`, {
        method: signMethod,
        signature: signatureData,
      });

      setStatus("approved");
      setShowSignModal(false);
    } catch (err) {
      console.error("❌ Sign API error:", err);
      alert("Failed to sign document. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineConfirm = async () => {
    try {
      setLoading(true);

      await axios.put(`${API_URL}/signatures/${signatureId}`, {
        method: "decline",
        status: "false",
        comment,
      });

      setStatus("declined");
      setShowDeclineModal(false);
      setComment("");
    } catch (err) {
      console.error("❌ Decline API error:", err);
      alert("Failed to decline document. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="position-relative bg-white rounded-3 shadow-sm p-0 mb-4">
      {/* ✅ Messages */}
      {status === "approved" && (
        <Alert
          variant="success"
          className="text-center mx-auto mt-3 shadow-sm"
          style={{ maxWidth: "600px" }}
        >
          <strong>The document is approved!</strong>
          <div>
            We have informed Rohit Chakrawarti the document is approved.
          </div>
        </Alert>
      )}
      {status === "declined" && (
        <Alert
          variant="danger"
          className="text-center mx-auto mt-3 shadow-sm"
          style={{ maxWidth: "600px" }}
        >
          <strong>The document has been declined.</strong>
          <div>{comment ? `Reason: ${comment}` : "No comment provided."}</div>
        </Alert>
      )}

      {/* Top action buttons (only show if pending) */}
      {status === "pending" && (
        <div className="d-flex justify-content-center gap-3 border-bottom p-3 bg-white">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowDeclineModal(true)}
          >
            Decline
          </button>

          <button
            className="btn px-4 text-white"
            style={{
              backgroundColor: "#2CC01B",
              borderColor: "#2CC01B",
              borderRadius: "0.375rem",
            }}
            onClick={() => setShowSignModal(true)}
          >
            <i className="bi bi-check-lg me-2"></i>Sign
          </button>
        </div>
      )}

      {/* --- Sign Modal --- */}
      <Modal
        show={showSignModal}
        onHide={() => setShowSignModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">Sign Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4 text-center">
            <p className="mb-3 fw-semibold fs-5 text-dark">
              Choose a sign method
            </p>
            <ToggleButtonGroup
              type="radio"
              name="signMethod"
              value={signMethod}
              onChange={(val) => setSignMethod(val)}
              className="toggle-group-modern"
            >
              <ToggleButton
                id="type-sign"
                value="type"
                variant="outline-primary"
              >
                Type
              </ToggleButton>
              <ToggleButton
                id="draw-sign"
                value="draw"
                variant="outline-primary"
              >
                Draw
              </ToggleButton>
            </ToggleButtonGroup>
          </div>

          {signMethod === "type" ? (
            <div className="text-center">
              <Form.Group>
                <Form.Label className="fw-semibold">Signed by</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Type your name"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="text-center"
                />
              </Form.Group>
              <div className="border rounded mt-3 p-3 bg-light text-center fw-bold fs-5 text-primary shadow-sm">
                {typedName || "Signature Preview"}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div
                className="border rounded overflow-hidden shadow-sm mx-auto"
                style={{ height: 150, maxWidth: 400 }}
              >
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{ className: "w-100 h-100" }}
                />
              </div>
              <Button
                variant="light"
                size="sm"
                className="mt-1"
                onClick={clearSignature}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </div>
          )}

          <p className="text-muted small mt-4 text-center">
            By signing the document I agree that the electronic signature is a
            valid representation of my handwritten signature.
          </p>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button
            style={{ backgroundColor: "#2CC01B", borderColor: "#2CC01B" }}
            onClick={handleAccept}
          >
            Sign & Accept
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Decline Modal --- */}
      <Modal
        show={showDeclineModal}
        onHide={() => setShowDeclineModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">
            Decline Document
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center">
            To decline this document, please confirm by clicking the button
            below.
          </p>
          <Form.Group className="mt-3">
            <Form.Label className="fw-semibold">Comment (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button
            style={{ backgroundColor: "#333", borderColor: "#333" }}
            onClick={handleDeclineConfirm}
          >
            Decline
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
      .modal-title {
      font-weight: 600;
      font-size: 1.25rem;
    }

      button {
        transition: all 0.3s ease;
      }

    button:hover {
      opacity: 0.9;
    }
      .toggle-group-modern {
        display: inline-flex;
        gap: 0.75rem;
      }

`}</style>
    </div>
  );
};

export default SignatureView;
