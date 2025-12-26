import { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { createSignature } from "../../store/signatureSlice";
import { useSelector, useDispatch } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";

const SignatureBlock = ({ blockId, parentId, data, isExisting }) => {
  const dispatch = useDispatch();
  const [isCreated, setIsCreated] = useState(isExisting || false);

  console.log("SignatureBlock - blockId:", blockId, "isExisting:", isExisting, "hasData:", !!data);

  // Only create signature if this is a NEW block (not existing/edit mode)
  useEffect(() => {
    if (!isCreated && !isExisting && !data && blockId && parentId) {
      console.log("Creating new signature for block:", blockId);
      dispatch(createSignature({ blockId, parentId }));
      setIsCreated(true);
    }
  }, [blockId, parentId, isExisting, data, isCreated, dispatch]);

  return (
    <div
      className="position-relative bg-white shadow-sm p-0"
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
