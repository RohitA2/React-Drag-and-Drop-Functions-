// import React, { useState, useEffect } from "react";
// import { Modal } from "react-bootstrap";
// import IndividualClientForm from "./IndividualClientForm";
// import CompanyClientForm from "./CompanyClientForm";
// import ConfirmationModal from "./ConfirmationModal";

// export default function CreateClientModal({
//   show,
//   onHide,
//   onCreated,
//   recipient,
// }) {
//   const [selectedType, setSelectedType] = useState("individual");
//   const [showConfirmModal, setShowConfirmModal] = useState(false);

//   // handle closing logic
//   const handleCloseRequest = () => {
//     setShowConfirmModal(true); // show confirmation instead of directly closing
//   };

//   const handleConfirmClose = (confirmed) => {
//     if (confirmed) {
//       onHide(); // actually close parent modal
//     }
//     setShowConfirmModal(false);
//   };

//   // Called after a recipient is successfully created
//   const handleRecipientCreated = (newRecipient) => {
//     if (onCreated) onCreated(newRecipient); // notify parent
//     onHide(); // close modal
//   };

//   useEffect(() => {
//     if (recipient?.company) setSelectedType("company");
//     else if (recipient) setSelectedType("individual");
//   }, [recipient]);

//   return (
//     <>
//       <Modal show={show} onHide={handleCloseRequest} centered>
//         <Modal.Body className="p-4">
//           {/* Header */}
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h5 className="fw-bold mb-0">Recipient</h5>
//             <div className="btn-group p-0">
//               <button
//                 className={`btn btn-sm ${
//                   selectedType === "individual" ? "btn-primary" : "btn-light"
//                 }`}
//                 onClick={() => setSelectedType("individual")}
//               >
//                 Individual
//               </button>
//               <button
//                 className={`btn btn-sm ${
//                   selectedType === "company" ? "btn-primary" : "btn-light"
//                 }`}
//                 onClick={() => setSelectedType("company")}
//               >
//                 Company
//               </button>
//             </div>
//           </div>

//           {/* Render form */}
//           {selectedType === "individual" && (
//             <IndividualClientForm
//               onCreated={handleRecipientCreated}
//               recipient={recipient}
//             />
//           )}
//           {selectedType === "company" && (
//             <CompanyClientForm
//               onCreated={handleRecipientCreated}
//               recipient={recipient}
//             />
//           )}
//         </Modal.Body>
//       </Modal>

//       {/* Confirmation Modal */}
//       <ConfirmationModal
//         show={showConfirmModal}
//         title="Unsaved changes"
//         message="Are you sure you want to cancel?"
//         confirmText="Yes"
//         cancelText="No"
//         onConfirm={() => handleConfirmClose(true)}
//         onCancel={() => handleConfirmClose(false)}
//       />
//     </>
//   );
// }



import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import IndividualClientForm from "./IndividualClientForm";
import CompanyClientForm from "./CompanyClientForm";
import ConfirmationModal from "./ConfirmationModal";

export default function CreateClientModal({
  // New props (current usage)
  show,
  onHide,
  onSuccess,
  mode = "create",
  client,
  onUpdate,
  
  // Legacy props (for backward compatibility)
  onCreated,
  recipient,
}) {
  const [selectedType, setSelectedType] = useState("individual");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Determine which props to use (new ones take priority)
  const successCallback = onSuccess || onCreated;
  const clientData = client || recipient;
  const isEditMode = mode === "edit";

  // handle closing logic
  const handleCloseRequest = () => {
    setShowConfirmModal(true); // show confirmation instead of directly closing
  };

  const handleConfirmClose = (confirmed) => {
    if (confirmed) {
      onHide(); // actually close parent modal
    }
    setShowConfirmModal(false);
  };

  // Called after a client is successfully created/updated
  const handleClientCreated = (newClient) => {
    if (successCallback) successCallback(newClient); // notify parent
    onHide(); // close modal
  };

  // Handle client update specifically for edit mode
  const handleClientUpdate = (updatedClient) => {
    if (onUpdate) {
      onUpdate(updatedClient); // Call onUpdate if provided
    }
    if (successCallback) successCallback(updatedClient); // Also call success callback
    onHide(); // close modal
  };

  // Determine if we have an existing client and set type accordingly
  useEffect(() => {
    if (clientData?.company) {
      setSelectedType("company");
    } else if (clientData) {
      setSelectedType("individual");
    } else {
      // Default to individual for new clients
      setSelectedType("individual");
    }
  }, [clientData]);

  // Choose the appropriate callback based on mode
  const getFormCallback = () => {
    if (isEditMode) {
      return handleClientUpdate;
    }
    return handleClientCreated;
  };

  return (
    <>
      <Modal show={show} onHide={handleCloseRequest} centered>
        <Modal.Body className="p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              {isEditMode ? "Edit Recipient" : "Recipient"}
            </h5>
            <div className="btn-group p-0">
              <button
                className={`btn btn-sm ${
                  selectedType === "individual" ? "btn-primary" : "btn-light"
                }`}
                onClick={() => setSelectedType("individual")}
              >
                Individual
              </button>
              <button
                className={`btn btn-sm ${
                  selectedType === "company" ? "btn-primary" : "btn-light"
                }`}
                onClick={() => setSelectedType("company")}
              >
                Company
              </button>
            </div>
          </div>

          {/* Render form */}
          {selectedType === "individual" && (
            <IndividualClientForm
              onCreated={getFormCallback()}
              recipient={clientData}
              mode={mode}
            />
          )}
          {selectedType === "company" && (
            <CompanyClientForm
              onCreated={getFormCallback()}
              recipient={clientData}
              mode={mode}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showConfirmModal}
        title="Unsaved changes"
        message="Are you sure you want to cancel?"
        confirmText="Yes"
        cancelText="No"
        onConfirm={() => handleConfirmClose(true)}
        onCancel={() => handleConfirmClose(false)}
      />
    </>
  );
}