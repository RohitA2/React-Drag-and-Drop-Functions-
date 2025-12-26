// import React from "react";
// import { X, AlertTriangle } from "lucide-react";

// const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
//   if (!isOpen) return null;

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className="position-fixed top-0 start-0 w-100 h-100"
//         style={{
//           background: "rgba(0,0,0,0.5)",
//           zIndex: 1050,
//         }}
//         onClick={onClose}
//       />

//       {/* Modal */}
//       <div
//         className="position-fixed top-50 start-50 translate-middle"
//         style={{
//           zIndex: 1051,
//           minWidth: "400px",
//           maxWidth: "500px",
//         }}
//       >
//         <div className="bg-white rounded-3 shadow-lg border-0">
//           {/* Header */}
//           <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
//             <div className="d-flex align-items-center gap-3">
//               <div
//                 className="d-flex align-items-center justify-content-center rounded-circle"
//                 style={{
//                   width: "40px",
//                   height: "40px",
//                   backgroundColor: "#fef3c7",
//                 }}
//               >
//                 <AlertTriangle size={20} color="#f59e0b" />
//               </div>
//               <h5 className="m-0 fw-semibold text-dark">{title}</h5>
//             </div>
//             <button
//               onClick={onClose}
//               className="btn btn-sm btn-light rounded-circle"
//               style={{ width: "32px", height: "32px" }}
//             >
//               <X size={16} />
//             </button>
//           </div>

//           {/* Body */}
//           <div className="p-4">
//             <p className="m-0 text-muted">{message}</p>
//           </div>

//           {/* Footer */}
//           <div className="d-flex justify-content-end gap-2 p-4 border-top">
//             <button
//               onClick={onClose}
//               className="btn btn-light px-4 py-2 rounded-pill"
//               style={{ fontWeight: "500" }}
//             >
//               {cancelText}
//             </button>
//             <button
//               onClick={onConfirm}
//               className="btn btn-danger px-4 py-2 rounded-pill"
//               style={{ fontWeight: "500" }}
//             >
//               {confirmText}
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ConfirmationModal;


import React, { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with subtle blur for modern feel */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 1050,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="position-fixed top-50 start-50 translate-middle"
        style={{ zIndex: 1051 }}
      >
        <div
          className="bg-white rounded-4 shadow-lg border-0"
          style={{
            width: "90vw",
            maxWidth: "480px",
            minWidth: "320px",
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center p-4 border-bottom border-light">
            <div className="d-flex align-items-center gap-4">
              <div
                className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#fef3c7",
                }}
              >
                <AlertTriangle size={28} color="#d97706" />
              </div>
              <h5 className="mb-0 fw-bold text-dark">{title}</h5>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className=" d-flex align-items-center justify-content-center shadow-sm px-2 py-2"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 pt-4 pb-3">
            <p className="mb-0 text-secondary fs-5 lh-base">{message}</p>
          </div>

          {/* Footer */}
          <div className="d-flex justify-content-end gap-3 p-4 border-top border-light">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline-secondary px-5 py-2 rounded-pill fw-medium"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="btn btn-danger px-5 py-2 rounded-pill fw-medium shadow-sm"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;