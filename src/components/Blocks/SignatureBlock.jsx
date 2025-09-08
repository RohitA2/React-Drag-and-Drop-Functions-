import { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { createSignature } from "../../store/signatureSlice";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = import.meta.env.VITE_API_URL; // your backend

const SignatureBlock = ({ id, onRemove }) => {
  const sigCanvas = useRef();
  const [isSigned, setIsSigned] = useState(false);
  const dispatch = useDispatch();
  const signatureItems = useSelector((state) => state.signatures.items);

  useEffect(() => {
    // Dispatch only to create local ID
    dispatch(createSignature());
  }, [dispatch]);

  useEffect(() => {
    // Get the latest block ID (last one pushed)
    const latest = signatureItems[signatureItems.length - 1];
    if (latest?.id) {
      // ✅ Now call API manually here
      axios
        .post(`${API_URL}/signatures/create`, { blockId: latest.id })
        .then((res) => {
          console.log("Saved to backend:", res.data);
        })
        .catch((err) => {
          console.error("Error saving:", err);
        });
    }
  }, [signatureItems]);

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
      className="position-relative bg-white rounded-3 shadow-sm p-0 mb-4"
      style={{ maxWidth: "1800px", width: "100%" }}
    >
      <div className="d-flex justify-content-center gap-4 border-bottom p-5 bg-white">
        {/* Decline Button with tooltip */}
        <div className="tooltip-wrapper">
          <button className="btn btn-light text-muted disabled">Decline</button>
          <span className="tooltip-text">Only your clients can decline</span>
        </div>

        {/* Sign Button with tooltip */}
        <div className="tooltip-wrapper">
          <button
            className="btn px-4 text-white disabled"
            style={{
              backgroundColor: "#95df8d",
              borderColor: "#95df8d",
              borderRadius: "0.375rem",
            }}
          >
            <i className="bi bi-check-lg me-2"></i>Sign
          </button>
          <span className="tooltip-text">
            Only your clients can answer this
          </span>
        </div>
      </div>
      <style>{`
      .tooltip-wrapper {
        position: relative;
        display: inline-block;
      }

      .tooltip-wrapper .tooltip-text {
        visibility: hidden;
        width: max-content;
        background-color: #838383;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 5px 8px;
        position: absolute;
        z-index: 1000;
        bottom: 120%; /* above button */
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        transition: opacity 0.2s;
      }

      .tooltip-wrapper:hover .tooltip-text {
        visibility: visible;
        opacity: 1;
      }
  `}</style>
    </div>
  );
};

export default SignatureBlock;
