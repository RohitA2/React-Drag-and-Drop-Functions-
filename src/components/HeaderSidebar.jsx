// import React, { useState, useEffect } from "react";
// import { X, Save } from "lucide-react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import CreateClientModal from "./Forms/CreateClientModal";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";


// import {
//   selectUserFullName,
//   selectUserEmail,
//   selectedUserId,
// } from "../store/authSlice";
// import { selectHeaderIds } from "../store/headerSlice";
// import {
//   selectLastBlockId,
//   selectLastAttachmentIds,
// } from "../store/attachmentSlice";
// import { selectParentId } from "../store/canvasSlice";

// const API_URL = import.meta.env.VITE_API_URL;

// const HeaderSidebar = ({
//   isOpen,
//   onClose,
//   onAddBlock,
//   hasSignatureBlock,
//   canvasRef,
//   blocks = [],
//    isEditing = false,
//   editProject = null,
//   parentId = null,
//   projectId = null,
// }) => {
//   const navigate = useNavigate();
//   const { toParties, fromParty, partyId } = useSelector((state) => state.party);
//   const signatures = useSelector((state) => state.signatures.items);

//   const fullName = useSelector(selectUserFullName);
//   const email = useSelector(selectUserEmail);
//   const userId = useSelector(selectedUserId);
//   const headerIds = useSelector(selectHeaderIds);
//   const signatureId = signatures[0]?.id;
//   const lastIds = useSelector(selectLastAttachmentIds);
//   const blockId = useSelector(selectLastBlockId);
//   const canvasParentId = useSelector(selectParentId);

//   const [name, setName] = useState("Proposal");
//   const [showModal, setShowModal] = useState(false);
//   const [expirationDate, setExpirationDate] = useState("");
//   const [recipients, setRecipients] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredRecipients, setFilteredRecipients] = useState([]);
//   const [selectedRecipients, setSelectedRecipients] = useState([]);
//   const [isSending, setIsSending] = useState(false);

//   // Auto-select parties
//   useEffect(() => {
//     if (fromParty?.name) {
//       setName(fromParty.documentName || "Sales Proposal");
//     }

//     if (toParties && toParties.length > 0) {
//       setSelectedRecipients(toParties);
//     }
//   }, [fromParty, toParties, partyId]);

//   // Fetch recipients for search/add
//   useEffect(() => {
//     if (!userId) return;

//     const fetchRecipients = async () => {
//       try {
//         const res = await fetch(`${API_URL}/api/recipients?user_id=${userId}`);
//         const data = await res.json();
//         if (data.success === false) {
//           setRecipients([]);
//         } else {
//           setRecipients(Array.isArray(data.data) ? data.data : data);
//         }
//       } catch (err) {
//         console.error("Error fetching recipients:", err);
//         setRecipients([]);
//       }
//     };

//     fetchRecipients();
//   }, [userId]);

//   // Search filter
//   useEffect(() => {
//     if (!searchTerm) {
//       setFilteredRecipients([]);
//       return;
//     }
//     const filtered = recipients.filter((r) =>
//       r.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredRecipients(filtered);
//   }, [searchTerm, recipients]);

//   // Toggle recipient selection
//   const toggleRecipientSelection = (recipient) => {
//     setSelectedRecipients((prev) => {
//       const isSelected = prev.some((r) => r.id === recipient.id);
//       if (isSelected) {
//         return prev.filter((r) => r.id !== recipient.id);
//       } else {
//         return [...prev, recipient];
//       }
//     });
//     setSearchTerm("");
//     setFilteredRecipients([]);
//   };

//   // Remove recipient
//   const removeRecipient = (recipientId) => {
//     setSelectedRecipients((prev) => prev.filter((r) => r.id !== recipientId));
//   };

//   // Send document
//   const handleSendDocument = async () => {
//     if (selectedRecipients.length === 0) {
//       toast.error("Please select at least one recipient.");
//       return;
//     }

//     // Use Redux state first, then localStorage as fallback
//     const parentId = canvasParentId || localStorage.getItem("parentId");
//     if (!parentId) {
//       toast.error("Missing document parent. Add a block to create it first.");
//       return;
//     }

//     setIsSending(true);

//     // Get the first header ID (assuming we want to use the first one)
//     const headerId = headerIds.length > 0 ? headerIds[0] : null;



//     const origin = window.location?.origin || "https://singlink.se";
//     const documentLink = `${origin}/proposal?parentId=${parentId}`;

//     const payload = {
//       parentId: parentId,
//       headerId,
//       userId,
//       name,
//       from: {
//         fullName: fromParty?.name || fullName,
//         email: fromParty?.email || email,
//       },
//       to: selectedRecipients.map((r) => ({
//         id: r.id,
//         name: r.name,
//         email: r.email,
//       })),
//       expirationDate,
//       link: documentLink,
//     };

//     try {
//       const res = await fetch(`${API_URL}/api/send-email`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         console.error("Failed to send document:", data);
//         toast.error(data.error || "Failed to send document");
//       } else {
//         toast.success(`Document sent to ${selectedRecipients.length} recipient(s)!`);
//         onClose();

//         // ✅ Redirect using useNavigate after a short delay
//         setTimeout(() => {
//           navigate("/");
//         }, 1000);
//       }
//     } catch (err) {
//       console.error("Error sending document:", err);
//       toast.error("Failed to send document");
//     } finally {
//       setIsSending(false);
//     }

//   };

//   const handleAddSignatureBlock = () => {
//     if (onAddBlock) {
//       const newBlock = {
//         id: Date.now(),
//         type: "signature",
//         settings: {
//           width: 400,
//           height: 150,
//           backgroundColor: "#fff",
//           textColor: "#000",
//           textAlign: "left",
//         },
//       };
//       onAddBlock(newBlock);
//     }
//   };

//   const handleSave = () => {
//     onClose();
//   };

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className="position-fixed top-0 start-0 w-100 h-100"
//         style={{
//           background: "rgba(0,0,0,0.35)",
//           opacity: isOpen ? 1 : 0,
//           transition: "opacity 300ms ease",
//           pointerEvents: isOpen ? "auto" : "none",
//           zIndex: 1049,
//         }}
//         onClick={onClose}
//       />

//       {/* Panel */}
//       <div
//         className="position-fixed top-0 end-0 bg-white shadow-lg"
//         style={{
//           width: "500px",
//           height: "100vh",
//           transform: isOpen ? "translateX(0)" : "translateX(100%)",
//           transition: "transform 300ms ease-in-out",
//           zIndex: 1050,
//           padding: "25px",
//         }}
//       >
//         {/* Header */}
//         <div className="d-flex justify-content-between align-items-center p-1 border-bottom bg-light">
//           <h5 className="m-1 text-black fs-8 fw-semibold small-text1">
//             Send Document
//           </h5>
//           <button
//             onClick={onClose}
//             className="btn btn-sm hower-shadow bg-white border-0"
//             aria-label="Close"
//           >
//             <X size={20} className="text-black" />
//           </button>
//         </div>

//         {/* Content */}
//         <div
//           className="p-1 overflow-auto"
//           style={{ height: "calc(100vh - 120px)" }}
//         >
//           <div className="mb-4">
//             {/* Document Name */}
//             <div className="mb-4">
//               <label className="form-label text-muted fw-semibold mb-1 d-block rounded p-2 small-text2">
//                 Document name
//               </label>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Name"
//                 className="form-control bg-light rounded"
//                 maxLength={50}
//                 required
//               />
//             </div>

//             {/* From */}
//             <div className="mb-4">
//               <label className="mb-1 form-label text-muted small-text fw-semibold small-text1">
//                 From
//               </label>
//               <div className="border rounded p-1">
//                 <p className="m-1 text-black small-text1">
//                   {fromParty?.name || fullName}
//                 </p>
//                 <p className="m-1 text-black small-text1">
//                   {fromParty?.email || email}
//                 </p>
//               </div>
//             </div>

//             {/* To */}
//             <div className="mb-4">
//               <p className="form-label text-muted small-text fw-semibold small-text1">
//                 To:
//               </p>

//               {/* Show selected recipients */}
//               {selectedRecipients.length > 0 && (
//                 <div className="mb-2">
//                   {selectedRecipients.map((recipient) => (
//                     <div
//                       key={recipient.id}
//                       className="border rounded p-2 mb-2 d-flex align-items-center justify-content-between bg-light"
//                     >
//                       <div className="d-flex align-items-center">
//                         <input
//                           type="checkbox"
//                           className="form-check-input me-2"
//                           checked={true}
//                           readOnly
//                         />
//                         <div>
//                           <p className="m-0 fw-semibold small-text1">
//                             {recipient.name}
//                           </p>
//                           <p className="m-0 text-muted small-text3">
//                             {recipient.email}
//                           </p>
//                         </div>
//                       </div>
//                       <button
//                         type="button"
//                         className="btn btn-sm btn-link text-danger"
//                         onClick={() => removeRecipient(recipient.id)}
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <div className="border rounded p-2 d-flex justify-content-between align-items-center position-relative">
//                 <div className="d-flex gap-2 w-100">
//                   <button
//                     className="btn btn-primary btn-sm flex-grow-0 form-control"
//                     onClick={(e) => {
//                       setShowModal(true);
//                       e.currentTarget.blur();
//                     }}
//                   >
//                     <span className="mb-1 text-white fs-[10px]">
//                       + Add new recipient
//                     </span>
//                   </button>

//                   <p className="flex-grow-0 text-center text-muted align-self-center m-0">
//                     or
//                   </p>

//                   <input
//                     type="text"
//                     placeholder="Search an existing recipient"
//                     className="form-control flex-grow-1"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>

//                 {filteredRecipients.length > 0 && (
//                   <ul
//                     className="list-group position-absolute mt-1 w-100 shadow-sm"
//                     style={{ zIndex: 1060, top: "100%", left: 0 }}
//                   >
//                     {filteredRecipients.map((r) => (
//                       <li
//                         key={r.id}
//                         className="list-group-item list-group-item-action small"
//                         onClick={() => toggleRecipientSelection(r)}
//                         style={{ cursor: "pointer" }}
//                       >
//                         {r.name} - {r.email}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               <CreateClientModal
//                 show={showModal}
//                 onHide={() => setShowModal(false)}
//                 onCreated={(newRecipient) => {
//                   setRecipients((prev) => [...prev, newRecipient]);
//                   toggleRecipientSelection(newRecipient);
//                 }}
//               />
//             </div>

//             {/* Signature Block */}
//             {!hasSignatureBlock && (
//               <div className="border rounded p-3 mb-4 bg-danger bg-opacity-10 text-danger">
//                 <p className="small mb-2">Signature-block missing</p>
//                 <button
//                   className="btn btn-primary btn-sm"
//                   onClick={handleAddSignatureBlock}
//                 >
//                   Add Signature-block
//                 </button>
//               </div>
//             )}

//             {/* Expiration */}
//             <div className="mb-4">
//               <label className="small font-weight-bold text-muted mb-1">
//                 Expiration:
//               </label>
//               <div className="d-flex gap-2 align-items-center">
//                 <input
//                   type="date"
//                   value={expirationDate}
//                   onChange={(e) => setExpirationDate(e.target.value)}
//                   className="form-control flex-grow-1"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="position-absolute bottom-0 start-0 end-0 p-3 border-top bg-white">
//           <div className="d-flex align-items-center gap-2">
//             <button
//               className="btn btn-sm btn-light d-flex align-items-center justify-content-center"
//               style={{ width: "32px", height: "32px" }}
//               onClick={handleSave}
//             >
//               <Save size={16} />
//             </button>
//             <button
//               className="btn btn-primary flex-grow-1 small-text1"
//               onClick={handleSendDocument}
//               disabled={isSending || selectedRecipients.length === 0}
//             >
//               {isSending
//                 ? "Sending..."
//                 : `Send document to ${selectedRecipients.length} recipient(s)`}
//             </button>
//           </div>
//           <div className="form-check m-0 d-flex align-items-center mt-2">
//             <input
//               className="form-check-input me-2"
//               type="checkbox"
//               id="saveTemplate"
//             />
//             <label
//               className="form-check-label small text-muted"
//               htmlFor="saveTemplate"
//             >
//               Save document as a template
//             </label>
//           </div>
//         </div>

//         <style>{`
//           .small-text1 {font-size: 0.9rem};
//           .small-text3 {font-size: 0.75rem};
//         `}</style>
//       </div>
//     </>
//   );
// };

// export default HeaderSidebar;


// ++++++++++++++++++++++++++++++++correct++++++++++++++++++++++++++++++++

// import React, { useState, useEffect } from "react";
// import { X, Save } from "lucide-react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import CreateClientModal from "./Forms/CreateClientModal";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";

// import {
//   selectUserFullName,
//   selectUserEmail,
//   selectedUserId,
// } from "../store/authSlice";
// import { selectHeaderIds } from "../store/headerSlice";
// import {
//   selectLastBlockId,
//   selectLastAttachmentIds,
// } from "../store/attachmentSlice";
// import { selectParentId } from "../store/canvasSlice";

// const API_URL = import.meta.env.VITE_API_URL;

// const HeaderSidebar = ({
//   isOpen,
//   onClose,
//   onAddBlock,
//   hasSignatureBlock,
//   canvasRef,
//   blocks = [],
//   isEditing = false,
//   editProject = null,
//   parentId = null,
//   projectId = null,
// }) => {
//   const navigate = useNavigate();
//   const { toParties, fromParty, partyId } = useSelector((state) => state.party);
//   const signatures = useSelector((state) => state.signatures.items);

//   const fullName = useSelector(selectUserFullName);
//   const email = useSelector(selectUserEmail);
//   const userId = useSelector(selectedUserId);
//   const headerIds = useSelector(selectHeaderIds);
//   const signatureId = signatures[0]?.id;
//   const lastIds = useSelector(selectLastAttachmentIds);
//   const blockId = useSelector(selectLastBlockId);
//   const canvasParentId = useSelector(selectParentId);

//   const [name, setName] = useState("Proposal");
//   const [showModal, setShowModal] = useState(false);
//   const [expirationDate, setExpirationDate] = useState("");
//   const [recipients, setRecipients] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredRecipients, setFilteredRecipients] = useState([]);
//   const [selectedRecipients, setSelectedRecipients] = useState([]);
//   const [isSending, setIsSending] = useState(false);

//   // Initialize form with edit project data
//   useEffect(() => {
//     if (isEditing && editProject) {
//       console.log("Initializing edit mode with project:", editProject);

//       // Set document name from edit project
//       if (editProject.proposalName) {
//         setName(editProject.proposalName);
//       }

//       // Set expiration date if available
//       if (editProject.expirationDate) {
//         setExpirationDate(editProject.expirationDate.split('T')[0]); // Format to YYYY-MM-DD
//       }

//       // Pre-select recipients from editProject
//       if (editProject.recipients && Array.isArray(editProject.recipients)) {
//         console.log("Found existing recipients:", editProject.recipients);

//         const existingRecipients = editProject.recipients.map(recipient => ({
//           id: recipient.recipientDetails?.id || recipient.recipientId,
//           name: recipient.recipientName || recipient.recipientDetails?.name,
//           email: recipient.recipientEmail,
//           phone: recipient.recipientDetails?.phone || '',
//           // Include other details if needed
//           ...recipient
//         }));

//         console.log("Mapped recipients:", existingRecipients);
//         setSelectedRecipients(existingRecipients);

//         // Also add these recipients to the main recipients list if not already there
//         setRecipients(prev => {
//           const existingIds = prev.map(r => r.id);
//           const newRecipients = existingRecipients.filter(r => !existingIds.includes(r.id));
//           return [...prev, ...newRecipients];
//         });
//       }
//     } else if (fromParty?.name) {
//       setName(fromParty.documentName || "Sales Proposal");
//     }
//   }, [isEditing, editProject, fromParty]);

//   // Auto-select parties from Redux
//   useEffect(() => {
//     if (toParties && toParties.length > 0) {
//       setSelectedRecipients(toParties);
//     }
//   }, [toParties, partyId]);

//   // Fetch recipients for search/add
//   useEffect(() => {
//     if (!userId) return;

//     const fetchRecipients = async () => {
//       try {
//         const res = await fetch(`${API_URL}/api/recipients?user_id=${userId}`);
//         const data = await res.json();
//         if (data.success === false) {
//           setRecipients([]);
//         } else {
//           setRecipients(Array.isArray(data.data) ? data.data : data);
//         }
//       } catch (err) {
//         console.error("Error fetching recipients:", err);
//         setRecipients([]);
//       }
//     };

//     fetchRecipients();
//   }, [userId]);

//   // Search filter
//   useEffect(() => {
//     if (!searchTerm) {
//       setFilteredRecipients([]);
//       return;
//     }
//     const filtered = recipients.filter((r) =>
//       r.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredRecipients(filtered);
//   }, [searchTerm, recipients]);

//   // Toggle recipient selection
//   const toggleRecipientSelection = (recipient) => {
//     setSelectedRecipients((prev) => {
//       const isSelected = prev.some((r) => r.id === recipient.id);
//       if (isSelected) {
//         return prev.filter((r) => r.id !== recipient.id);
//       } else {
//         return [...prev, recipient];
//       }
//     });
//     setSearchTerm("");
//     setFilteredRecipients([]);
//   };

//   // Remove recipient
//   const removeRecipient = (recipientId) => {
//     setSelectedRecipients((prev) => prev.filter((r) => r.id !== recipientId));
//   };

//   // Send or Update document
//   const handleSendDocument = async () => {
//     if (selectedRecipients.length === 0) {
//       toast.error("Please select at least one recipient.");
//       return;
//     }

//     // Determine which parentId to use
//     let finalParentId = null;

//     if (isEditing) {
//       // In edit mode, use the parentId prop if available
//       finalParentId = parentId || canvasParentId || localStorage.getItem("parentId");
//     } else {
//       // In new mode, use Redux state first, then localStorage
//       finalParentId = canvasParentId || localStorage.getItem("parentId");
//     }

//     if (!finalParentId) {
//       toast.error("Missing document parent. Add a block to create it first.");
//       return;
//     }

//     setIsSending(true);

//     // Get the first header ID
//     const headerId = headerIds.length > 0 ? headerIds[0] : null;

//     const origin = window.location?.origin || "https://singlink.se";
//     const documentLink = `${origin}/proposal?parentId=${finalParentId}`;

//     // Prepare payload
//     const payload = {
//       parentId: finalParentId,
//       headerId,
//       userId,
//       name,
//       from: {
//         fullName: fromParty?.name || fullName,
//         email: fromParty?.email || email,
//       },
//       to: selectedRecipients.map((r) => ({
//         id: r.id,
//         name: r.name,
//         email: r.email,
//       })),
//       expirationDate,
//       link: documentLink,
//     };

//     // Add edit-specific data if in edit mode
//     if (isEditing) {
//       payload.isEdit = true;
//       if (projectId) {
//         payload.projectId = projectId;
//       }
//       if (editProject?.id) {
//         payload.existingProposalId = editProject.id;
//       }
//     }

//     try {
//       const endpoint = isEditing 
//         ? `${API_URL}/api/send-email`  // Your update endpoint
//         : `${API_URL}/api/send-email`;   // Your send endpoint

//       const method = isEditing ? "POST" : "POST";

//       console.log(`${isEditing ? 'Updating' : 'Sending'} document:`, payload);

//       const res = await fetch(endpoint, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();
//        console.log("API Response:", data);

//       if (!res.ok) {
//         console.error(`Failed to ${isEditing ? 'update' : 'send'} document:`, data);
//         toast.error(data.error || `Failed to ${isEditing ? 'update' : 'send'} document`);
//       } else {
//         const successMessage = isEditing 
//           ? `Document updated and sent to ${selectedRecipients.length} recipient(s)!`
//           : `Document sent to ${selectedRecipients.length} recipient(s)!`;

//         toast.success(successMessage);
//         onClose();

//         // Redirect to dashboard
//         setTimeout(() => {
//           navigate("/");
//         }, 1000);
//       }
//     } catch (err) {
//       console.error(`Error ${isEditing ? 'updating' : 'sending'} document:`, err);
//       toast.error(`Failed to ${isEditing ? 'update' : 'send'} document`);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleAddSignatureBlock = () => {
//     if (onAddBlock) {
//       const newBlock = {
//         id: Date.now(),
//         type: "signature",
//         settings: {
//           width: 400,
//           height: 150,
//           backgroundColor: "#fff",
//           textColor: "#000",
//           textAlign: "left",
//         },
//       };
//       onAddBlock(newBlock);
//     }
//   };

//   const handleSave = () => {
//     onClose();
//   };

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className="position-fixed top-0 start-0 w-100 h-100"
//         style={{
//           background: "rgba(0,0,0,0.35)",
//           opacity: isOpen ? 1 : 0,
//           transition: "opacity 300ms ease",
//           pointerEvents: isOpen ? "auto" : "none",
//           zIndex: 1049,
//         }}
//         onClick={onClose}
//       />

//       {/* Panel */}
//       <div
//         className="position-fixed top-0 end-0 bg-white shadow-lg"
//         style={{
//           width: "500px",
//           height: "100vh",
//           transform: isOpen ? "translateX(0)" : "translateX(100%)",
//           transition: "transform 300ms ease-in-out",
//           zIndex: 1050,
//           padding: "25px",
//         }}
//       >
//         {/* Header with Edit Mode Indicator */}
//         <div className="d-flex justify-content-between align-items-center p-1 border-bottom bg-light">
//           <div>
//             <h5 className="m-1 text-black fs-8 fw-semibold small-text1">
//               {isEditing ? "Update & Send Document" : "Send Document"}
//             </h5>
//             {isEditing && editProject && (
//               <p className="m-0 text-muted small-text3">
//                 Editing: <strong>{editProject.proposalName}</strong>
//               </p>
//             )}
//           </div>
//           <button
//             onClick={onClose}
//             className="btn btn-sm hower-shadow bg-white border-0"
//             aria-label="Close"
//           >
//             <X size={20} className="text-black" />
//           </button>
//         </div>

//         {/* Content */}
//         <div
//           className="p-1 overflow-auto"
//           style={{ height: "calc(100vh - 120px)" }}
//         >
//           <div className="mb-4">
//             {/* Edit Mode Notice */}
//             {isEditing && (
//               <div className="alert alert-warning p-2 mb-3 small">
//                 <strong>Note:</strong> You are editing an existing document. 
//                 Changes will update the current version.
//               </div>
//             )}

//             {/* Document Name */}
//             <div className="mb-4">
//               <label className="form-label text-muted fw-semibold mb-1 d-block rounded p-2 small-text2">
//                 Document name
//               </label>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Name"
//                 className="form-control bg-light rounded"
//                 maxLength={50}
//                 required
//               />
//             </div>

//             {/* From */}
//             <div className="mb-4">
//               <label className="mb-1 form-label text-muted small-text fw-semibold small-text1">
//                 From
//               </label>
//               <div className="border rounded p-1">
//                 <p className="m-1 text-black small-text1">
//                   {fromParty?.name || fullName}
//                 </p>
//                 <p className="m-1 text-black small-text1">
//                   {fromParty?.email || email}
//                 </p>
//               </div>
//             </div>

//             {/* To */}
//             <div className="mb-4">
//               <p className="form-label text-muted small-text fw-semibold small-text1">
//                 To:
//               </p>

//               {/* Show selected recipients */}
//               {selectedRecipients.length > 0 && (
//                 <div className="mb-2">
//                   {selectedRecipients.map((recipient) => (
//                     <div
//                       key={recipient.id}
//                       className="border rounded p-2 mb-2 d-flex align-items-center justify-content-between bg-light"
//                     >
//                       <div className="d-flex align-items-center">
//                         <input
//                           type="checkbox"
//                           className="form-check-input me-2"
//                           checked={true}
//                           readOnly
//                         />
//                         <div>
//                           <p className="m-0 fw-semibold small-text1">
//                             {recipient.name}
//                           </p>
//                           <p className="m-0 text-muted small-text3">
//                             {recipient.email}
//                           </p>
//                         </div>
//                       </div>
//                       <button
//                         type="button"
//                         className="btn btn-sm btn-link text-danger"
//                         onClick={() => removeRecipient(recipient.id)}
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <div className="border rounded p-2 d-flex justify-content-between align-items-center position-relative">
//                 <div className="d-flex gap-2 w-100">
//                   <button
//                     className="btn btn-primary btn-sm flex-grow-0 form-control"
//                     onClick={(e) => {
//                       setShowModal(true);
//                       e.currentTarget.blur();
//                     }}
//                   >
//                     <span className="mb-1 text-white fs-[10px]">
//                       + Add new recipient
//                     </span>
//                   </button>

//                   <p className="flex-grow-0 text-center text-muted align-self-center m-0">
//                     or
//                   </p>

//                   <input
//                     type="text"
//                     placeholder="Search an existing recipient"
//                     className="form-control flex-grow-1"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>

//                 {filteredRecipients.length > 0 && (
//                   <ul
//                     className="list-group position-absolute mt-1 w-100 shadow-sm"
//                     style={{ zIndex: 1060, top: "100%", left: 0 }}
//                   >
//                     {filteredRecipients.map((r) => (
//                       <li
//                         key={r.id}
//                         className="list-group-item list-group-item-action small"
//                         onClick={() => toggleRecipientSelection(r)}
//                         style={{ cursor: "pointer" }}
//                       >
//                         {r.name} - {r.email}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               <CreateClientModal
//                 show={showModal}
//                 onHide={() => setShowModal(false)}
//                 onCreated={(newRecipient) => {
//                   setRecipients((prev) => [...prev, newRecipient]);
//                   toggleRecipientSelection(newRecipient);
//                 }}
//               />
//             </div>

//             {/* Signature Block */}
//             {!hasSignatureBlock && (
//               <div className="border rounded p-3 mb-4 bg-danger bg-opacity-10 text-danger">
//                 <p className="small mb-2">Signature-block missing</p>
//                 <button
//                   className="btn btn-primary btn-sm"
//                   onClick={handleAddSignatureBlock}
//                 >
//                   Add Signature-block
//                 </button>
//               </div>
//             )}

//             {/* Expiration */}
//             <div className="mb-4">
//               <label className="small font-weight-bold text-muted mb-1">
//                 Expiration:
//               </label>
//               <div className="d-flex gap-2 align-items-center">
//                 <input
//                   type="date"
//                   value={expirationDate}
//                   onChange={(e) => setExpirationDate(e.target.value)}
//                   className="form-control flex-grow-1"
//                   min={new Date().toISOString().split('T')[0]} // Set min to today
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="position-absolute bottom-0 start-0 end-0 p-3 border-top bg-white">
//           <div className="d-flex align-items-center gap-2">
//             {/* <button
//               className="btn btn-sm btn-light d-flex align-items-center justify-content-center"
//               style={{ width: "32px", height: "32px" }}
//               onClick={handleSave}
//               title="Save and close"
//             >
//               <Save size={16} />
//             </button> */}
//             <button
//               className="btn btn-primary flex-grow-1 small-text1"
//               onClick={handleSendDocument}
//               disabled={isSending || selectedRecipients.length === 0}
//             >
//               {isSending
//                 ? (isEditing ? "Updating..." : "Sending...")
//                 : (isEditing 
//                     ? `Update & Send to ${selectedRecipients.length} recipient(s)`
//                     : `Send document to ${selectedRecipients.length} recipient(s)`
//                   )
//               }
//             </button>
//           </div>
//           <div className="form-check m-0 d-flex align-items-center mt-2">
//             <input
//               className="form-check-input me-2"
//               type="checkbox"
//               id="saveTemplate"
//             />
//             <label
//               className="form-check-label small text-muted"
//               htmlFor="saveTemplate"
//             >
//               Save document as a template
//             </label>
//           </div>
//         </div>

//         <style>{`
//           .small-text1 {font-size: 0.9rem};
//           .small-text2 {font-size: 0.85rem};
//           .small-text3 {font-size: 0.75rem};
//         `}</style>
//       </div>
//     </>
//   );
// };

// export default HeaderSidebar;

// +++++++++++++++++++++++++++++++++new ++++++++++++++++++++++++++++++++++

import React, { useState, useEffect } from "react";
import { X, Send, Save, Clock, Users, FileText, UserPlus, Check, Sparkles } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreateClientModal from "./Forms/CreateClientModal";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
  selectUserFullName,
  selectUserEmail,
  selectedUserId,
} from "../store/authSlice";
import { selectHeaderIds } from "../store/headerSlice";
import {
  selectLastBlockId,
  selectLastAttachmentIds,
} from "../store/attachmentSlice";
import { selectParentId } from "../store/canvasSlice";

const API_URL = import.meta.env.VITE_API_URL;

const HeaderSidebar = ({
  isOpen,
  onClose,
  onAddBlock,
  hasSignatureBlock,
  canvasRef,
  blocks = [],
  isEditing = false,
  editProject = null,
  parentId = null,
  projectId = null,
}) => {
  const navigate = useNavigate();
  const { toParties, fromParty, partyId } = useSelector((state) => state.party);
  const signatures = useSelector((state) => state.signatures.items);

  const fullName = useSelector(selectUserFullName);
  const email = useSelector(selectUserEmail);
  const userId = useSelector(selectedUserId);
  const headerIds = useSelector(selectHeaderIds);
  const signatureId = signatures[0]?.id;
  const lastIds = useSelector(selectLastAttachmentIds);
  const blockId = useSelector(selectLastBlockId);
  const canvasParentId = useSelector(selectParentId);

  const [name, setName] = useState("Proposal");
  const [showModal, setShowModal] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // Initialize form with edit project data
  useEffect(() => {
    if (isEditing && editProject) {
      console.log("Initializing edit mode with project:", editProject);

      if (editProject.proposalName) {
        setName(editProject.proposalName);
      }

      if (editProject.expirationDate) {
        setExpirationDate(editProject.expirationDate.split('T')[0]);
      }

      if (editProject.recipients && Array.isArray(editProject.recipients)) {
        const existingRecipients = editProject.recipients.map(recipient => ({
          id: recipient.recipientDetails?.id || recipient.recipientId,
          name: recipient.recipientName || recipient.recipientDetails?.name,
          email: recipient.recipientEmail,
          phone: recipient.recipientDetails?.phone || '',
          ...recipient
        }));

        setSelectedRecipients(existingRecipients);

        setRecipients(prev => {
          const existingIds = prev.map(r => r.id);
          const newRecipients = existingRecipients.filter(r => !existingIds.includes(r.id));
          return [...prev, ...newRecipients];
        });
      }
    } else if (fromParty?.name) {
      setName(fromParty.documentName || "Sales Proposal");
    }
  }, [isEditing, editProject, fromParty]);

  // Auto-select parties from Redux
  useEffect(() => {
    if (toParties && toParties.length > 0) {
      setSelectedRecipients(toParties);
    }
  }, [toParties, partyId]);

  // Fetch recipients for search/add
  useEffect(() => {
    if (!userId) return;

    const fetchRecipients = async () => {
      try {
        const res = await fetch(`${API_URL}/api/recipients?user_id=${userId}`);
        const data = await res.json();
        if (data.success === false) {
          setRecipients([]);
        } else {
          setRecipients(Array.isArray(data.data) ? data.data : data);
        }
      } catch (err) {
        console.error("Error fetching recipients:", err);
        setRecipients([]);
      }
    };

    fetchRecipients();
  }, [userId]);

  // Search filter
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRecipients([]);
      return;
    }
    const filtered = recipients.filter((r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipients(filtered);
  }, [searchTerm, recipients]);

  // Toggle recipient selection
  const toggleRecipientSelection = (recipient) => {
    setSelectedRecipients((prev) => {
      const isSelected = prev.some((r) => r.id === recipient.id);
      if (isSelected) {
        return prev.filter((r) => r.id !== recipient.id);
      } else {
        return [...prev, recipient];
      }
    });
    setSearchTerm("");
    setFilteredRecipients([]);
  };

  // Remove recipient
  const removeRecipient = (recipientId) => {
    setSelectedRecipients((prev) => prev.filter((r) => r.id !== recipientId));
  };

  // Send or Update document
  const handleSendDocument = async () => {
    if (selectedRecipients.length === 0) {
      toast.error("Please select at least one recipient.");
      return;
    }

    if (saveAsTemplate && !templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    let finalParentId = null;

    if (isEditing) {
      finalParentId = parentId || canvasParentId || localStorage.getItem("parentId");
    } else {
      finalParentId = canvasParentId || localStorage.getItem("parentId");
    }

    if (!finalParentId) {
      toast.error("Missing document parent. Add a block to create it first.");
      return;
    }

    setIsSending(true);

    const headerId = headerIds.length > 0 ? headerIds[0] : null;
    const origin = window.location?.origin || "https://singlink.se";
    const documentLink = `${origin}/proposal?parentId=${finalParentId}`;

    // Prepare payload with template data
    const payload = {
      parentId: finalParentId,
      headerId,
      userId,
      name,
      from: {
        fullName: fromParty?.name || fullName,
        email: fromParty?.email || email,
      },
      to: selectedRecipients.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
      })),
      expirationDate,
      link: documentLink,
      // Template data in main payload
      is_template: saveAsTemplate,
      template_name: templateName,
      template_data: saveAsTemplate ? {
        name: templateName,
        documentName: name,
        blocks: blocks,
        settings: {
          name,
          expirationDate,
          from: {
            fullName: fromParty?.name || fullName,
            email: fromParty?.email || email,
          }
        }
      } : null
    };

    // Add edit-specific data if in edit mode
    if (isEditing) {
      payload.isEdit = true;
      if (projectId) {
        payload.projectId = projectId;
      }
      if (editProject?.id) {
        payload.existingProposalId = editProject.id;
      }
    }

    try {
      const endpoint = `${API_URL}/api/send-email`;
      const method = "POST";

      console.log(`${isEditing ? 'Updating' : 'Sending'} document:`, payload);

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(`Failed to ${isEditing ? 'update' : 'send'} document:`, data);
        toast.error(data.error || `Failed to ${isEditing ? 'update' : 'send'} document`);
      } else {
        let successMessage = isEditing
          ? `Document updated and sent to ${selectedRecipients.length} recipient(s)!`
          : `Document sent to ${selectedRecipients.length} recipient(s)!`;

        if (saveAsTemplate) {
          successMessage += ` Template "${templateName}" saved successfully!`;
        }

        toast.success(successMessage);
        onClose();

        // Reset template state
        setSaveAsTemplate(false);
        setTemplateName("");

        // Redirect to dashboard
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'sending'} document:`, err);
      toast.error(`Failed to ${isEditing ? 'update' : 'send'} document`);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddSignatureBlock = () => {
    if (onAddBlock) {
      const newBlock = {
        id: Date.now(),
        type: "signature",
        settings: {
          width: 400,
          height: 150,
          backgroundColor: "#fff",
          textColor: "#000",
          textAlign: "left",
        },
      };
      onAddBlock(newBlock);
      toast.success("Signature block added!");
    }
  };

  return (
    <>
      {/* Modern Backdrop with blur */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          transition: "opacity 300ms ease",
          pointerEvents: isOpen ? "auto" : "none",
          zIndex: 1049,
        }}
        onClick={onClose}
      />

      {/* Modern Panel */}
      <div
        className="position-fixed top-0 end-0 bg-white"
        style={{
          width: "500px",
          height: "100vh",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 1050,
          boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modern Header */}
        <div className="p-4 border-bottom" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="d-flex align-items-center gap-2">
                <div className="bg-white rounded-circle p-2 shadow-sm">
                  <Send size={20} className="text-primary" />
                </div>
                <div>
                  <h5 className="m-0 text-white fw-bold fs-5">
                    {isEditing ? "Update & Send" : "Send Document"}
                  </h5>
                  {isEditing && editProject && (
                    <p className="m-0 text-white-75 small">
                      Editing: <strong>{editProject.proposalName}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn btn-light btn-sm rounded-circle shadow-sm"
              style={{ width: "36px", height: "36px" }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="p-4 overflow-auto"
          style={{
            height: "calc(100vh - 200px)",
            flex: 1,
            background: "#f8fafc"
          }}
        >
          {/* Edit Mode Notice */}
          {isEditing && (
            <div className="alert alert-info border-0 mb-4" style={{
              background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
              borderLeft: "4px solid #3b82f6"
            }}>
              <div className="d-flex align-items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span className="small fw-medium">You are editing an existing document. Changes will update the current version.</span>
              </div>
            </div>
          )}

          {/* Document Name */}
          <div className="mb-4">
            <label className="form-label fw-semibold text-gray-700 mb-2 d-flex align-items-center gap-2">
              <FileText size={16} />
              Document Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter document name"
              className="form-control form-control-lg border-1 shadow-sm"
              maxLength={50}
              required
              style={{
                borderColor: "#e2e8f0",
                borderRadius: "10px",
                padding: "12px 16px"
              }}
            />
          </div>

          {/* From Section */}
          <div className="mb-4">
            <label className="form-label fw-semibold text-gray-700 mb-2 d-flex align-items-center gap-2">
              <UserPlus size={16} />
              From
            </label>
            <div className="border rounded-2 p-3 bg-white shadow-sm">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                  <UserPlus size={18} className="text-primary" />
                </div>
                <div>
                  <p className="m-0 fw-semibold text-gray-800">
                    {fromParty?.name || fullName}
                  </p>
                  <p className="m-0 text-gray-600 small">
                    {fromParty?.email || email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* To Section */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <label className="form-label fw-semibold text-gray-700 d-flex align-items-center gap-2">
                <Users size={16} />
                Recipients
              </label>
              <span className="badge bg-primary bg-opacity-10 text-primary">
                {selectedRecipients.length} selected
              </span>
            </div>

            {/* Selected Recipients */}
            {selectedRecipients.length > 0 && (
              <div className="mb-3">
                {selectedRecipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="border rounded-2 p-3 mb-2 bg-white shadow-sm d-flex align-items-center justify-content-between"
                    style={{
                      borderLeft: "4px solid #3b82f6",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="position-relative">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                          <Users size={16} className="text-primary" />
                        </div>
                        <div className="position-absolute top-0 start-100 translate-middle">
                          <Check size={12} className="text-white bg-success rounded-circle p-1" />
                        </div>
                      </div>
                      <div>
                        <p className="m-0 fw-semibold text-gray-800">
                          {recipient.name}
                        </p>
                        <p className="m-0 text-gray-600 small">
                          {recipient.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-light rounded-circle"
                      onClick={() => removeRecipient(recipient.id)}
                      style={{ width: "32px", height: "32px" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Select Recipients */}
            <div className="position-relative">
              <div className="d-flex gap-2 mb-2">
                <button
                  className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
                  onClick={(e) => {
                    setShowModal(true);
                    e.currentTarget.blur();
                  }}
                  style={{ borderRadius: "8px" }}
                >
                  <UserPlus size={16} />
                  <span>Add New</span>
                </button>

                <div className="flex-grow-1 position-relative">
                  <input
                    type="text"
                    placeholder="Search existing recipients..."
                    className="form-control border-1 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      borderRadius: "8px",
                      padding: "10px 16px",
                      paddingLeft: "40px",
                      borderColor: "#e2e8f0"
                    }}
                  />
                  <div className="position-absolute top-50 start-3 translate-middle-y">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              {filteredRecipients.length > 0 && (
                <div className="position-absolute top-100 start-0 end-0 mt-1 shadow-lg rounded-2 overflow-hidden border"
                  style={{ zIndex: 1060 }}>
                  {filteredRecipients.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 bg-white hover-bg-light cursor-pointer d-flex align-items-center gap-3 border-bottom"
                      onClick={() => toggleRecipientSelection(r)}
                      style={{ transition: "background-color 0.2s" }}
                    >
                      <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                        <Users size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="m-0 fw-medium">{r.name}</p>
                        <p className="m-0 text-muted small">{r.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <CreateClientModal
            show={showModal}
            onHide={() => setShowModal(false)}
            onCreated={(newRecipient) => {
              setRecipients((prev) => [...prev, newRecipient]);
              toggleRecipientSelection(newRecipient);
              toast.success("Recipient added successfully!");
            }}
          />

          {/* Signature Block Warning */}
          {!hasSignatureBlock && (
            <div className="border-start border-4 border-danger rounded-end p-3 mb-4 bg-red-50">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-danger bg-opacity-10 rounded-circle p-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="m-0 fw-semibold text-danger">Signature Required</p>
                    <p className="m-0 text-danger small">Add a signature block to finalize your document</p>
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-sm rounded-pill px-3"
                  onClick={handleAddSignatureBlock}
                >
                  Add Signature
                </button>
              </div>
            </div>
          )}

          {/* Expiration Date */}
          <div className="mb-4">
            <label className="form-label fw-semibold text-gray-700 mb-2 d-flex align-items-center gap-2">
              <Clock size={16} />
              Expiration Date
            </label>
            <div className="position-relative">
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="form-control border-1 shadow-sm"
                style={{
                  borderRadius: "8px",
                  padding: "12px 16px",
                  paddingLeft: "45px",
                  borderColor: "#e2e8f0"
                }}
                min={new Date().toISOString().split('T')[0]}
              />
              <div className="position-absolute top-50 start-3 translate-middle-y">
                <Clock size={18} className="text-muted" />
              </div>
            </div>
          </div>

          {/* Save as Template Toggle - Integrated */}
          <div className="mb-4">
            <div className="border rounded-2 p-3 bg-white shadow-sm">
              <div className="form-check d-flex align-items-center justify-content-between mb-0">
                <div className="d-flex align-items-center gap-3">
                  <input
                    className="form-check-input m-0"
                    type="checkbox"
                    id="saveTemplate"
                    checked={saveAsTemplate}
                    onChange={(e) => setSaveAsTemplate(e.target.checked)}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer"
                    }}
                  />
                  <div>
                    <label
                      className="form-check-label fw-semibold text-gray-700 d-flex align-items-center gap-2"
                      htmlFor="saveTemplate"
                      style={{ cursor: "pointer" }}
                    >
                      <Save size={16} />
                      Save as Template
                    </label>
                    <p className="text-muted small mb-0 mt-1">
                      Save this document layout for future use
                    </p>
                  </div>
                </div>
                {saveAsTemplate && (
                  <div className="text-success">
                    <Check size={20} />
                  </div>
                )}
              </div>

              {/* Template Name Input - Only shows when checked */}
              {saveAsTemplate && (
                <div className="mt-3 animate-fade-in">
                  <label className="form-label fw-medium mb-2">Template Name</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter a name for your template"
                    className="form-control border-1"
                    style={{
                      borderRadius: "8px",
                      padding: "10px 16px",
                      borderColor: templateName.trim() ? "#3b82f6" : "#e2e8f0"
                    }}
                  />
                  {templateName.trim() && (
                    <p className="text-success small mt-2 mb-0">
                      Template will be saved as: <strong>"{templateName}"</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="p-4 border-top bg-white">
          <div className="d-grid gap-2">
            <button
              className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2 shadow-lg"
              onClick={handleSendDocument}
              disabled={isSending || selectedRecipients.length === 0 || (saveAsTemplate && !templateName.trim())}
              style={{
                background: saveAsTemplate
                  ? "linear-gradient(135deg, #10b981 0%, #047857 100%)"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "10px",
                padding: "14px",
                fontWeight: "600",
                fontSize: "16px",
                opacity: (saveAsTemplate && !templateName.trim()) ? 0.7 : 1
              }}
            >
              {isSending ? (
                <>
                  <span className="spinner-border spinner-border-sm" />
                  {saveAsTemplate ? "Saving & Sending..." : (isEditing ? "Updating..." : "Sending...")}
                </>
              ) : (
                <>
                  {saveAsTemplate ? (
                    <>
                      <Save size={20} />
                      Save Template & {isEditing ? 'Update & Send' : 'Send'}
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      {isEditing ? 'Update & Send' : 'Send'} to {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''}
                    </>
                  )}
                </>
              )}
            </button>

            <div className="text-center mt-2">
              <button
                className="btn btn-link text-muted text-decoration-none"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .hover-bg-light:hover {
          background-color: #f8fafc !important;
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        .shadow-lg {
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        
        .form-check-input:checked {
          background-color: #10b981;
          border-color: #10b981;
        }
        
        .form-check-input:focus {
          box-shadow: 0 0 0 0.25rem rgba(16, 185, 129, 0.25);
        }
        
        .btn-primary {
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 7px 14px rgba(0,0,0,0.2);
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }
        
        .bg-red-50 {
          background-color: rgba(239, 68, 68, 0.05);
        }
      `}</style>
    </>
  );
};

export default HeaderSidebar;