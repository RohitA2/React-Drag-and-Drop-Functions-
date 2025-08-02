import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import "bootstrap/dist/css/bootstrap.min.css";

const SignatureBlock = ({ id, onRemove }) => {
  const sigCanvas = useRef();
  const [isSigned, setIsSigned] = useState(false);

  const clearSignature = () => {
    sigCanvas.current.clear();
    setIsSigned(false);
  };

  const handleSign = () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Please provide a signature first.");
      return;
    }
    setIsSigned(true);
  };

  return (
    <div
      className="position-relative bg-white rounded-3 shadow-sm p-0 overflow-hidden"
      style={{ maxWidth: "1400px", width: "100%" }}
    >
      {/* Action buttons */}
      <div className="d-flex justify-content-center gap-3 border-bottom p-3 bg-white">
        <button className="btn btn-link text-muted">Decline</button>
        <button className="btn btn-success px-4" onClick={handleSign}>
          <i className="bi bi-check-lg me-2"></i>Sign
        </button>
      </div>

      {/* Signature canvas */}
      <div className="p-4">
        <div className="border rounded overflow-hidden" style={{ height: 200 }}>
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{ className: "w-100 h-100" }}
          />
        </div>

        <div className="mt-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={clearSignature}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureBlock;
