// import React, { useState, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import CreateClientModal from "../Forms/CreateClientModal";
// import EditFromModal from "../Blocks/HeaderBlocks/EditFromModal";
// import Dropdown from "react-bootstrap/Dropdown";
// import { useSelector, useDispatch } from "react-redux";
// import { setPartyId, setParties } from "../../store/partySlice";
// import axios from "axios";
// import {
//   selectedUserId,
//   selectUserFullName,
//   selectUserEmail,
// } from "../../store/authSlice";
// import { toast } from "react-toastify";

// const API_URL = import.meta.env.VITE_API_URL;

// const Parties = ({ blockId, parentId }) => {
//   const dispatch = useDispatch();
//   const rawUserId = useSelector(selectedUserId);
//   const userId = rawUserId && rawUserId !== "null" ? Number(rawUserId) : null;
//   const userFullName = useSelector(selectUserFullName);
//   const userEmail = useSelector(selectUserEmail);

//   const [toParties, setToParties] = useState([]);
//   const [fromParty, setFromParty] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [showFromModal, setShowFromModal] = useState(false);
//   const [currentSection, setCurrentSection] = useState("to");

//   const [recipients, setRecipients] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredRecipients, setFilteredRecipients] = useState([]);
//   const [selectedRecipient, setSelectedRecipient] = useState(null);

//   // console.log("i am from parties +++++++++", blockId, parentId);
//   const handleAddRecipient = (section) => {
//     setCurrentSection(section);
//     setShowModal(true);
//   };

//   const handleRemoveRecipient = (section, index) => {
//     if (section === "to") {
//       const updated = toParties.filter((_, i) => i !== index);
//       setToParties(updated);
//       dispatch(setParties({ toParties: updated, fromParty }));
//     } else {
//       setFromParty(null);
//       dispatch(setParties({ toParties, fromParty: null }));
//     }
//   };

//   const handleSave = (data) => {
//     if (currentSection === "to") {
//       setToParties((prev) => [...prev, data]); // ✅ append to list
//     } else {
//       setFromParty(data);
//     }
//     setShowModal(false);
//   };

//   // ✅ Fetch recipients for logged in user
//   useEffect(() => {
//     if (!userId) return;
//     const fetchRecipients = async () => {
//       try {
//         const res = await fetch(`${API_URL}/api/recipients?user_id=${userId}`);
//         const data = await res.json();
//         console.log("data from recipents", data);
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

//   // ✅ Filter recipients as you type
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

//   // 1️⃣ Fetch saved data when component mounts
//   useEffect(() => {
//     if (!userId) return;

//     const fetchParties = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/parties/${userId}`);
//         if (res.data.success && res.data.data) {
//           const to = res.data.data.toParty || [];
//           const from = res.data.data.fromParty || null;
//           setToParties(to);
//           setFromParty(from);

//           dispatch(setParties({ toParties: to, fromParty: from }));
//         }
//       } catch (err) {
//         console.error("❌ Error fetching parties:", err);
//       }
//     };

//     fetchParties();
//   }, [userId]);

//   // 2️⃣ Auto-save when state changes
//   useEffect(() => {
//     if (!userId) return;

//     const saveParties = async () => {
//       try {
//         const res = await axios.post(`${API_URL}/parties/save`, {
//           userId,
//           toParty: toParties,
//           fromParty: fromParty,
//           blockId,
//           parentId,
//         });
//         console.log("parties saved", res.data);
//         if (res.data.success) {
//           dispatch(setPartyId(res.data.data.id));
//           dispatch(setParties({ toParties, fromParty }));
//         }
//       } catch (err) {
//         console.error("❌ Error saving parties:", err.message);
//         toast.error(err.message);
//       }
//     };

//     saveParties();
//   }, [userId, toParties, fromParty]);

//   const handleEditRecipient = (recipient) => {
//     setSelectedRecipient(recipient);
//     setShowModal(true); // open modal for editing
//   };

//   return (
//     <div
//       className="container bg-white  shadow p-4"
//       style={{ maxWidth: "1800px" }}
//     >
//       {/* TO Section */}
//       <div className="mb-5 w-100 p-4">
//         <div style={{ maxWidth: "500px", margin: "0 auto" }}>
//           <h4 className="fw-bold text-secondary mb-1">Parties</h4>
//           <div className="d-flex align-items-center text-secondary fw-semibold mb-2">
//             <span className="text-dark fw-bold me-2">01</span>
//             <span className="text-primary me-2">—</span>
//             To
//           </div>
//         </div>

//         <div className="position-absolute top-2 end-0 mt-2 me-2">
//           <Dropdown align="end">
//             <Dropdown.Toggle
//               variant="light"
//               size="sm"
//               className="px-3 py-1 shadow-sm border-0 fw-semibold fs-6 more-button"
//               id="recipient-actions-global"
//             >
//               More
//             </Dropdown.Toggle>

//             <Dropdown.Menu className="shadow-sm border-0 mt-2">
//               <Dropdown.Item
//                 onClick={() => {
//                   setSelectedRecipient(null);
//                   setSearchTerm("");
//                   handleAddRecipient("to");
//                 }}
//               >
//                 <i className="bi bi-plus-circle me-2"></i>
//                 Add more recipients
//               </Dropdown.Item>

//               <Dropdown.Divider />

//               {toParties.map((party, idx) => (
//                 <Dropdown.Item
//                   key={idx}
//                   onClick={() => handleEditRecipient(party)}
//                   className="d-flex align-items-center"
//                 >
//                   <i className="bi bi-pencil-square me-2"></i>
//                   {party.company || party.name || party.email}
//                 </Dropdown.Item>
//               ))}
//             </Dropdown.Menu>
//           </Dropdown>
//         </div>

//         {toParties.length > 0 ? (
//           toParties.map((party, idx) => (
//             <div
//               key={idx}
//               className="hover-card border rounded mx-auto position-relative mb-3"
//               style={{ maxWidth: "500px" }}
//             >
//               {/* Hover Action Buttons */}
//               <div className="hover-card-container">
//                 {/* Left side: The card */}
//                 <div className="hover-card">{/* Card content here */}</div>

//                 {/* Right side: Buttons that appear on hover */}
//                 <div className="hover-actions">
//                   <button
//                     className="btn btn-sm"
//                     onClick={() => handleEditRecipient(party)}
//                   >
//                     <i className="bi bi-pencil-square"></i>
//                   </button>
//                   <button
//                     className="btn btn-sm"
//                     onClick={() => handleRemoveRecipient("to", idx)}
//                   >
//                     <i className="bi bi-recycle"></i>
//                   </button>
//                 </div>
//               </div>

//               {/* Card Content */}
//               <div className="row m-0 border-bottom">
//                 <div className="col-6 p-2 border-end">
//                   <small className="text-muted d-block">Company</small>
//                   <span className="fw-small">{party.companyName || "—"}</span>
//                 </div>
//                 <div className="col-6 p-2">
//                   <small className="text-muted d-block">Reference</small>
//                   <span className="fw-small">{party.name || "—"}</span>
//                 </div>
//               </div>
//               <div className="row m-0 border-bottom">
//                 <div className="col-12 p-2">
//                   <small className="text-muted d-block">Email</small>
//                   <span className="fw-small">{party.email}</span>
//                 </div>
//               </div>
//               <div className="row m-0">
//                 <div className="col-12 p-2">
//                   <small className="text-muted d-block">Phone</small>
//                   <span className="fw-small">{party.phone || "—"}</span>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div
//             className="border p-4 rounded bg-light mx-auto"
//             style={{ maxWidth: "500px" }}
//           >
//             <p className="mb-2 text-muted fw-semibold fs-8 text-center">
//               Who's your client? <br /> Add a recipient.
//             </p>
//             <div className="d-flex gap-2 position-relative">
//               <button
//                 className="btn btn-primary bg-[#0088F0] btn-sm flex-shrink-0"
//                 onClick={() => handleAddRecipient("to")}
//               >
//                 + Add new recipient
//               </button>

//               <input
//                 type="text"
//                 placeholder="Search an existing recipient"
//                 className="form-control"
//                 value={selectedRecipient ? selectedRecipient.name : searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setSelectedRecipient(null);
//                 }}
//               />

//               {searchTerm.trim().length > 0 && !selectedRecipient && (
//                 <ul
//                   className="list-group position-absolute mt-1 w-100 shadow-sm"
//                   style={{ zIndex: 1060, top: "100%", marginTop: "10px" }}
//                 >
//                   {filteredRecipients.length > 0 ? (
//                     filteredRecipients.map((r) => (
//                       <li
//                         key={r.id}
//                         className="list-group-item list-group-item-action small"
//                         onClick={() => {
//                           setSelectedRecipient(r);
//                           setToParties((prev) => [...prev, r]);
//                           setSearchTerm("");
//                           setFilteredRecipients([]);
//                         }}
//                       >
//                         {r.name} — {r.email}
//                       </li>
//                     ))
//                   ) : (
//                     <li className="list-group-item small d-flex justify-content-between align-items-center">
//                       <span>No results found for "{searchTerm}"</span>
//                       <button
//                         className="btn btn-light btn-sm px-3 py-1"
//                         onClick={() => {
//                           setFilteredRecipients([]);
//                           setSearchTerm("");
//                           setSelectedRecipient(null);
//                           handleAddRecipient("to");
//                         }}
//                       >
//                         Add
//                       </button>
//                     </li>
//                   )}
//                 </ul>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* FROM Section */}
//       <div className="w-100 pb-4">
//         <div
//           className="d-flex justify-content-between align-items-center mb-2 text-secondary fw-semibold"
//           style={{ maxWidth: "500px", margin: "0 auto" }}
//         >
//           <div className="d-flex align-items-center">
//             <span className="text-dark fw-bold me-2">02</span>
//             <span className="text-primary me-2">—</span>
//             From
//           </div>

//           <button
//             className="btn btn-light btn-sm px-3 py-1"
//             onClick={() => setShowFromModal(true)}
//           >
//             Edit
//           </button>
//         </div>

//         {/* Bordered Card */}
//         <div
//           className="border rounded bg-white mx-auto"
//           style={{ maxWidth: "500px" }}
//         >
//           <div className="row m-0 border-bottom">
//             <div className="col-6 p-2 border-end">
//               <small className="text-muted d-block">Company</small>
//               <span
//                 className="fw-small "
//                 onClick={() => setShowFromModal(true)}
//               >
//                 {fromParty?.companyName || userFullName}
//               </span>
//             </div>
//             <div className="col-6 p-2">
//               <small className="text-muted d-block">Reference</small>
//               <span className="fw-small" onClick={() => setShowFromModal(true)}>
//                 {fromParty?.name || userFullName}
//               </span>
//             </div>
//           </div>
//           <div className="row m-0">
//             <div className="col-12 p-2">
//               <small className="text-muted d-block">Email</small>
//               <span className="fw-small" onClick={() => setShowFromModal(true)}>
//                 {fromParty?.email || userEmail}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//       <EditFromModal
//         show={showFromModal}
//         onHide={() => setShowFromModal(false)}
//         fromParty={fromParty}
//         userFallback={{ fullName: userFullName, email: userEmail }}
//         onUpdated={(updated) => setFromParty(updated)}
//       />

//       {/* Modal */}
//       <CreateClientModal
//         show={showModal}
//         onHide={() => {
//           setShowModal(false);
//           setSelectedRecipient(null); // reset after close
//         }}
//         recipient={selectedRecipient} // ✅ pass selected recipient here
//         onCreated={(newRecipient) => {
//           if (selectedRecipient) {
//             const updated = toParties.map((p) =>
//               p.id === newRecipient.id ? newRecipient : p
//             );
//             setToParties(updated);
//             dispatch(setParties({ toParties: updated, fromParty }));
//           } else {
//             setRecipients((prev) => [...prev, newRecipient]);
//             handleSave(newRecipient); // already sets state
//             dispatch(
//               setParties({ toParties: [...toParties, newRecipient], fromParty })
//             );
//           }
//           setSelectedRecipient(null);
//         }}
//       />

//       <style>{`
//       .more-button{
//         position: absolute;
//         top: -48px;
//         right: 340px;
//         z-index: 1000;
//       }
//         /* Container must be relatively positioned for absolute buttons */
//       .hover-card-container {
//         position: relative;
//         display: flex;
//         justify-content: space-between;
//         align-items: flex-start;
//         max-width: 520px;
//         margin: 0 auto;
//       }

//       /* The card itself */
//       .hover-card {
//         width: 100%;
//         border: 1px solid #dee2e6;
//         border-radius: 0.375rem;
//         background-color: #fff;
//       }

//       /* Action buttons on the right */
//       .hover-actions {
//         position: absolute;
//         top: 8px;
//         right: -60px; /* Puts buttons outside the card to the right */
//         opacity: 0;
//         transition: opacity 0.2s ease-in-out;
//         display: flex;
//         flex-direction: column;
//         gap: 6px;
//         z-index: 10;
//       }

//       /* Show buttons when hovering over the card container */
//       .hover-card-container:hover .hover-actions {
//         opacity: 1;
//       }

//       /* Button styles */
//       .hover-actions .btn {
//         padding: 4px 6px;
//         width: 25px;
//         height: 20px;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         font-size: 0.85rem;
//         background-color: #f8f9fa;
//         border: 1px solid #dee2e6;
//         border-radius: 4px;
//       }

//       .hover-actions .btn:hover {
//         background-color: #e2e6ea;
//       }


//       `}</style>
//     </div>
//   );
// };

// export default Parties;

import React, { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, Search, MoreVertical, UserPlus, Mail, Phone, Building, User, Check } from "lucide-react";
import CreateClientModal from "../Forms/CreateClientModal";
import EditFromModal from "../Blocks/HeaderBlocks/EditFromModal";
import { useSelector, useDispatch } from "react-redux";
import { setPartyId, setParties } from "../../store/partySlice";
import axios from "axios";
import {
  selectedUserId,
  selectUserFullName,
  selectUserEmail,
} from "../../store/authSlice";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const Parties = ({ blockId, parentId, data, isExisting }) => {
  const dispatch = useDispatch();
  const rawUserId = useSelector(selectedUserId);
  const userId = rawUserId && rawUserId !== "null" ? Number(rawUserId) : null;
  const userFullName = useSelector(selectUserFullName);
  const userEmail = useSelector(selectUserEmail);

  // Initialize from existing data if in edit mode
  const getInitialToParties = () => {
    if (isExisting && data) {
      const toData = data.toParty || data.to || data.recipients || [];
      if (Array.isArray(toData)) {
        return toData.map(r => ({
          companyName: r.companyName || r.company || r.organization || "",
          name: r.recipientName || r.name || "",
          email: r.recipientEmail || r.email || "",
          phone: r.phone || r.phoneNumber || "",
        }));
      }
    }
    return [];
  };

  const getInitialFromParty = () => {
    if (isExisting && data) {
      return data.fromParty || data.from || data.sender || null;
    }
    return null;
  };

  const [toParties, setToParties] = useState(getInitialToParties);
  const [fromParty, setFromParty] = useState(getInitialFromParty);
  const [isInitialized, setIsInitialized] = useState(isExisting || false);
  const [showModal, setShowModal] = useState(false);
  const [showFromModal, setShowFromModal] = useState(false);
  const [currentSection, setCurrentSection] = useState("to");

  const [recipients, setRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedExisting, setSelectedExisting] = useState([]);

  const handleAddRecipient = (section) => {
    setSearchTerm("");
    setSelectedExisting([]);
    setCurrentSection(section);
    setShowModal(true);
  };

  const handleRemoveRecipient = (section, index) => {
    if (section === "to") {
      const updated = toParties.filter((_, i) => i !== index);
      setToParties(updated);
      dispatch(setParties({ toParties: updated, fromParty }));
    } else {
      setFromParty(null);
      dispatch(setParties({ toParties, fromParty: null }));
    }
  };

  const handleSave = (data) => {
    if (currentSection === "to") {
      setToParties((prev) => [...prev, data]);
    } else {
      setFromParty(data);
    }
    setShowModal(false);
  };

  // Fetch recipients for logged in user
  useEffect(() => {
    if (!userId) return;
    const fetchRecipients = async () => {
      try {
        const res = await fetch(`${API_URL}/api/recipients?user_id=${userId}`);
        const data = await res.json();
        console.log("data from recipients", data);
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

  // Filter recipients as you type
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRecipients([]);
      setSelectedExisting([]);
      return;
    }
    const filtered = recipients.filter((r) =>
      !toParties.some(p => p.id === r.id) && r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipients(filtered);
  }, [searchTerm, recipients, toParties]);

  // Fetch saved data when component mounts
  // Initialize from data prop if in edit mode
  useEffect(() => {
    if (isExisting && data && !isInitialized) {
      const toData = data.toParty || data.to || data.recipients || [];
      const fromData = data.fromParty || data.from || data.sender || null;
      
      if (Array.isArray(toData)) {
        const mappedTo = toData.map(r => ({
          companyName: r.companyName || r.company || r.organization || "",
          name: r.recipientName || r.name || "",
          email: r.recipientEmail || r.email || "",
          phone: r.phone || r.phoneNumber || "",
        }));
        setToParties(mappedTo);
        setFromParty(fromData);
        dispatch(setParties({ toParties: mappedTo, fromParty: fromData }));
        setIsInitialized(true);
        console.log("Parties loaded from existing data:", { toParties: mappedTo, fromParty: fromData });
        return;
      }
    }
  }, [data, isExisting, isInitialized, dispatch]);

  // Fetch parties from server only if not in edit mode or no data provided
  useEffect(() => {
    if (!userId || isInitialized) return;

    const fetchParties = async () => {
      try {
        const res = await axios.get(`${API_URL}/parties/${userId}`);
        if (res.data.success && res.data.data) {
          const to = res.data.data.toParty || [];
          const from = res.data.data.fromParty || null;
          setToParties(to);
          setFromParty(from);

          dispatch(setParties({ toParties: to, fromParty: from }));
        }
      } catch (err) {
        console.error("❌ Error fetching parties:", err);
      }
    };

    fetchParties();
  }, [userId, dispatch, isInitialized]);

  // Auto-save when state changes
  useEffect(() => {
    if (!userId) return;

    const saveParties = async () => {
      try {
        const res = await axios.post(`${API_URL}/parties/save`, {
          userId,
          toParty: toParties,
          fromParty: fromParty,
          blockId,
          parentId,
        });
        console.log("parties saved", res.data);
        if (res.data.success) {
          dispatch(setPartyId(res.data.data.id));
          dispatch(setParties({ toParties, fromParty }));
        }
      } catch (err) {
        console.error("❌ Error saving parties:", err.message);
        toast.error(err.message);
      }
    };

    saveParties();
  }, [userId, toParties, fromParty, blockId, parentId, dispatch]);

  const handleEditRecipient = (recipient) => {
    setSelectedRecipient(recipient);
    setShowModal(true);
  };

  const handleToggleExisting = (r) => {
    const isSelected = selectedExisting.includes(r.id);
    if (isSelected) {
      setSelectedExisting(prev => prev.filter(id => id !== r.id));
    } else {
      setSelectedExisting(prev => [...prev, r.id]);
    }
  };

  const handleAddSelectedExisting = () => {
    const toAdd = filteredRecipients.filter(r => selectedExisting.includes(r.id));
    setToParties(prev => [...prev, ...toAdd]);
    setSearchTerm("");
    setFilteredRecipients([]);
    setSelectedExisting([]);
    setSelectedRecipient(null);
  };

  const handleMoreToggle = () => {
    setMoreOpen(!moreOpen);
  };

  const handleMoreItemClick = (action) => {
    action();
    setMoreOpen(false);
  };

  return (
    <div className="max-w-10xl mx-auto bg-linear-to-br from-white to-gray-50 shadow-xl p-8 border border-gray-100">
      {/* TO Section */}
      <section className="mb-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">01</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recipients</h3>
                <p className="text-gray-500 text-sm">Who's receiving this document</p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={handleMoreToggle}
                className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-all duration-200"
              >
                <MoreVertical size={18} className="mr-2" />
                More Actions
              </button>

              {moreOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-xl z-50 py-2 backdrop-blur-sm">
                  <button
                    onClick={() => handleMoreItemClick(() => {
                      setSelectedRecipient(null);
                      setSearchTerm("");
                      setSelectedExisting([]);
                      handleAddRecipient("to");
                    })}
                    className="flex items-center w-full px-4 py-3 text-sm text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:outline-none transition-colors rounded-lg mx-1"
                  >
                    <UserPlus size={16} className="mr-3" />
                    Add New Recipient
                  </button>
                  {toParties.length > 0 && (
                    <>
                      <div className="border-t border-gray-100 my-2"></div>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Edit Existing</div>
                      {toParties.map((party, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleMoreItemClick(() => handleEditRecipient(party))}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-left text-gray-600 hover:bg-gray-50 focus:outline-none transition-colors"
                        >
                          <Pencil size={14} className="mr-3" />
                          <div className="truncate">
                            {party.companyName || party.name || party.email}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recipients List */}
          {toParties.length > 0 ? (
            <div className="space-y-4">
              {toParties.map((party, idx) => (
                <div
                  key={idx}
                  className="relative group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-linear-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mr-4">
                          <Building size={20} className="text-blue-600" />
                        </div>
                        <div>
                          {/* Only show company name if it exists */}
                          {party.companyName && (
                            <h4 className="font-bold text-gray-900 mb-1">
                              {party.companyName}
                            </h4>
                          )}
                          <p className="text-sm text-gray-500 flex items-center">
                            <User size={14} className="mr-1" />
                            {party.name || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pl-14">
                        <div className="flex items-center text-gray-600">
                          <Mail size={16} className="mr-2 text-gray-400" />
                          <span className="text-sm">{party.email}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone size={16} className="mr-2 text-gray-400" />
                          <span className="text-sm">{party.phone || "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Always visible action buttons with better styling */}
                    <div className="flex items-center space-x-2 opacity-100 transition-opacity">
                      <button
                        className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        onClick={() => handleEditRecipient(party)}
                        title="Edit recipient"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        onClick={() => handleRemoveRecipient("to", idx)}
                        title="Remove recipient"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-linear-to-r from-white to-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <UserPlus size={28} className="text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No recipients added yet</h4>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Who's your client? Add recipients to get started with your document.
              </p>

              <div className="max-w-xl mx-auto">
                <div className="flex gap-3 relative">
                  <button
                    className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => handleAddRecipient("to")}
                  >
                    <UserPlus size={18} className="mr-2" />
                    Add New Recipient
                  </button>

                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search existing recipients..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/80 backdrop-blur-sm"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedRecipient(null);
                      }}
                    />
                  </div>

                  {searchTerm.trim().length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl z-50 max-h-72 overflow-auto backdrop-blur-sm">
                      {filteredRecipients.length > 0 ? (
                        <>
                          {filteredRecipients.map((r) => {
                            const isSelected = selectedExisting.includes(r.id);
                            return (
                              <button
                                key={r.id}
                                onClick={() => handleToggleExisting(r)}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex items-center group transition-colors"
                              >
                                <div className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 group-hover:border-blue-300'}`}>
                                  {isSelected && <Check size={14} className="text-white" />}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{r.name}</div>
                                  <div className="text-gray-500 text-xs">{r.email}</div>
                                </div>
                              </button>
                            );
                          })}
                          {selectedExisting.length > 0 && (
                            <div className="border-t border-gray-100 px-4 py-3">
                              <button
                                onClick={handleAddSelectedExisting}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                Add {selectedExisting.length} selected
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="px-4 py-4 flex flex-col items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Search size={20} className="text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-sm mb-3">No results found for "{searchTerm}"</p>
                          <button
                            className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            onClick={() => {
                              setFilteredRecipients([]);
                              setSearchTerm("");
                              setSelectedExisting([]);
                              setSelectedRecipient(null);
                              handleAddRecipient("to");
                            }}
                          >
                            Create New Recipient
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FROM Section */}
      <section className="pb-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">02</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Sender Details</h3>
                <p className="text-gray-500 text-sm">Who's sending this document</p>
              </div>
            </div>

            <button
              className="inline-flex items-center px-4 py-2.5 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={() => setShowFromModal(true)}
            >
              <Pencil size={16} className="mr-2" />
              Edit Sender Info
            </button>
          </div>

          {/* Sender Card */}
          <div className="bg-linear-to-r from-white to-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-linear-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mr-4">
                <User size={24} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Company</p>
                    <p
                      className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-emerald-600 transition-colors"
                      onClick={() => setShowFromModal(true)}
                    >
                      {fromParty?.companyName || userFullName || "Your Company"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Reference</p>
                    <p
                      className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-emerald-600 transition-colors"
                      onClick={() => setShowFromModal(true)}
                    >
                      {fromParty?.name || userFullName || "You"}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Contact Information</p>
                  <div className="flex items-center text-gray-700">
                    <Mail size={18} className="mr-2 text-gray-400" />
                    <span
                      className="text-base cursor-pointer hover:text-emerald-600 transition-colors"
                      onClick={() => setShowFromModal(true)}
                    >
                      {fromParty?.email || userEmail || "your.email@example.com"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <EditFromModal
        show={showFromModal}
        onHide={() => setShowFromModal(false)}
        fromParty={fromParty}
        userFallback={{ fullName: userFullName, email: userEmail }}
        onUpdated={(updated) => setFromParty(updated)}
      />

      <CreateClientModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedRecipient(null);
        }}
        recipient={selectedRecipient}
        onCreated={(newRecipient) => {
          if (selectedRecipient) {
            const updated = toParties.map((p) =>
              p.id === newRecipient.id ? newRecipient : p
            );
            setToParties(updated);
            dispatch(setParties({ toParties: updated, fromParty }));
          } else {
            setRecipients((prev) => [...prev, newRecipient]);
            handleSave(newRecipient);
            dispatch(
              setParties({ toParties: [...toParties, newRecipient], fromParty })
            );
          }
          setSelectedRecipient(null);
        }}
      />
    </div>
  );
};

export default Parties;