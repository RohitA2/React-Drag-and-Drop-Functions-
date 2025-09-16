import { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Modal,
  Button,
  Form,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Spinner,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
import { toast } from "react-toastify";

const SignatureView = ({ user, signatureId, parentId, recipient }) => {
  const sigCanvas = useRef();
  const [showSignModal, setShowSignModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [signMethod, setSignMethod] = useState("type");
  const [typedName, setTypedName] = useState("");
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [signatureData, setSignatureData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  // console.log("recipient", recipient);

  // ✅ Fetch signature status from backend
  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const res = await axios.get(`${API_URL}/signatures/${signatureId}`);
        const sig = res.data?.data;

        if (sig) {
          setSignatureData(sig);
        }
      } catch (err) {
        console.error("❌ Fetch signature error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (signatureId) {
      fetchSignature();
    } else {
      setIsLoading(false);
    }
  }, [signatureId]);

  // Clear canvas
  const clearSignature = () => {
    if (sigCanvas.current) sigCanvas.current.clear();
  };

  // ✅ Accept handler
  const handleAccept = async () => {
    if (signatureData?.status === true) {
      toast.error("You have already responded to this document.");
      return;
    }

    if (signMethod === "draw" && sigCanvas.current.isEmpty()) {
      toast.error("Please provide a signature first.");
      return;
    }
    if (signMethod === "type" && !typedName.trim()) {
      toast.error("Please type your name first.");
      return;
    }

    const signatureValue =
      signMethod === "draw"
        ? sigCanvas.current.getCanvas().toDataURL("image/png")
        : typedName;

    try {
      setIsSubmitting(true);
      const response = await axios.put(`${API_URL}/signatures/${signatureId}`, {
        method: signMethod,
        signature: signatureValue,
        status: true,
        user_id: user.id,
        parent_id: parentId,
        recipient_id: recipient.recipientId,
        recipient_name: recipient.recipientName,
        recipient_email: recipient.recipientEmail,
      });

      // Update local state with the response data
      setSignatureData(
        response.data?.data || {
          method: signMethod,
          signature: signatureValue,
          status: true,
        }
      );

      setShowSignModal(false);
      toast.success("Document signed successfully!");
    } catch (err) {
      console.error("❌ Sign API error:", err);
      toast.error(err.response?.data?.error || "Failed to sign document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Decline handler
  const handleDeclineConfirm = async () => {
    if (signatureData?.status === true) {
      toast.error("You have already responded to this document.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.put(`${API_URL}/signatures/${signatureId}`, {
        method: "decline",
        comment,
        status: true, // Set status to true for declined as well
        user_id: user.id,
        parent_id: parentId,
        recipient_id: recipient.recipientId,
        recipient_name: recipient.recipientName,
        recipient_email: recipient.recipientEmail,
      });

      // Update local state with the response data
      setSignatureData(
        response.data?.data || {
          method: "decline",
          comment,
          status: true,
        }
      );

      setShowDeclineModal(false);
      setComment("");
      toast.info("You declined the document.");
    } catch (err) {
      console.error("❌ Decline API error:", err);
      toast.error(err.response?.data?.error || "Failed to decline document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show buttons if signature hasn't been processed yet (status is not true)
  const showActionButtons = !signatureData || signatureData.status !== true;

  return (
    <div className="position-relative bg-white shadow-sm p-0">
      {/* --- Loading State --- */}
      {isLoading && (
        <div className="text-center my-3">
          <Spinner animation="border" size="sm" /> Loading signature status...
        </div>
      )}

      {/* --- Approved State (status is true and method is not decline) --- */}
      {signatureData?.status === true &&
        signatureData?.method !== "decline" && (
          <Alert
            variant="success"
            className="text-center mx-auto mt-3 shadow-sm"
            style={{ maxWidth: "600px" }}
          >
            <strong>The document is approved!</strong>
            <div>{fullName} has signed this document.</div>
            {signatureData.method === "draw" ? (
              <div className="mt-2">
                <img
                  src={signatureData.signature}
                  alt="Signature"
                  style={{ maxWidth: "200px", maxHeight: "80px" }}
                />
              </div>
            ) : (
              <div className="mt-2 fw-bold fs-5 text-dark">
                {signatureData.signature}
              </div>
            )}
          </Alert>
        )}

      {/* --- Declined State (status is true and method is decline) --- */}
      {signatureData?.status === true &&
        signatureData?.method === "decline" && (
          <Alert
            variant="danger"
            className="text-center mx-auto mt-3 shadow-sm"
            style={{ maxWidth: "600px" }}
          >
            <strong>The document has been declined.</strong>
            <div>{fullName} has declined this document.</div>
            {signatureData.comment && (
              <div className="mt-2">
                <strong>Comment:</strong> {signatureData.comment}
              </div>
            )}
          </Alert>
        )}

      {/* --- Show buttons when signature hasn't been processed (status is not true) --- */}
      {showActionButtons && (
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing..." : "Sign & Accept"}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Declining..." : "Decline"}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .modal-title { font-weight: 600; font-size: 1.25rem; }
        button { transition: all 0.3s ease; }
        button:hover { opacity: 0.9; }
        .toggle-group-modern { display: inline-flex; gap: 0.75rem; }
      `}</style>
    </div>
  );
};

export default SignatureView;
