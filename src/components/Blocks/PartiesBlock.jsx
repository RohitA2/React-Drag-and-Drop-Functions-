import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import CreateClientModal from "../Forms/CreateClientModal";
import EditFromModal from "../Blocks/HeaderBlocks/EditFromModal";
import Dropdown from "react-bootstrap/Dropdown";
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

const Parties = ({ blockId, parentId }) => {
  const dispatch = useDispatch();
  const rawUserId = useSelector(selectedUserId);
  const userId = rawUserId && rawUserId !== "null" ? Number(rawUserId) : null;
  const userFullName = useSelector(selectUserFullName);
  const userEmail = useSelector(selectUserEmail);

  const [toParties, setToParties] = useState([]);
  const [fromParty, setFromParty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFromModal, setShowFromModal] = useState(false);
  const [currentSection, setCurrentSection] = useState("to");

  const [recipients, setRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  // console.log("i am from parties +++++++++", blockId, parentId);
  const handleAddRecipient = (section) => {
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
      setToParties((prev) => [...prev, data]); // ✅ append to list
    } else {
      setFromParty(data);
    }
    setShowModal(false);
  };

  // ✅ Fetch recipients for logged in user
  useEffect(() => {
    if (!userId) return;
    const fetchRecipients = async () => {
      try {
        const res = await fetch(`${API_URL}/api/recipients?user_id=${userId}`);
        const data = await res.json();
        console.log("data from recipents", data);
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

  // ✅ Filter recipients as you type
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

  // 1️⃣ Fetch saved data when component mounts
  useEffect(() => {
    if (!userId) return;

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
  }, [userId]);

  // 2️⃣ Auto-save when state changes
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
  }, [userId, toParties, fromParty]);

  const handleEditRecipient = (recipient) => {
    setSelectedRecipient(recipient);
    setShowModal(true); // open modal for editing
  };

  return (
    <div
      className="container bg-white  shadow p-4"
      style={{ maxWidth: "1800px" }}
    >
      {/* TO Section */}
      <div className="mb-5 w-100 p-4">
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <h4 className="fw-bold text-secondary mb-1">Parties</h4>
          <div className="d-flex align-items-center text-secondary fw-semibold mb-2">
            <span className="text-dark fw-bold me-2">01</span>
            <span className="text-primary me-2">—</span>
            To
          </div>
        </div>

        <div className="position-absolute top-2 end-0 mt-2 me-2">
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              size="sm"
              className="px-3 py-1 shadow-sm border-0 fw-semibold fs-6 more-button"
              id="recipient-actions-global"
            >
              More
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-sm border-0 mt-2">
              <Dropdown.Item
                onClick={() => {
                  setSelectedRecipient(null);
                  setSearchTerm("");
                  handleAddRecipient("to");
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add more recipients
              </Dropdown.Item>

              <Dropdown.Divider />

              {toParties.map((party, idx) => (
                <Dropdown.Item
                  key={idx}
                  onClick={() => handleEditRecipient(party)}
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  {party.company || party.name || party.email}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {toParties.length > 0 ? (
          toParties.map((party, idx) => (
            <div
              key={idx}
              className="hover-card border rounded mx-auto position-relative mb-3"
              style={{ maxWidth: "500px" }}
            >
              {/* Hover Action Buttons */}
              <div className="hover-card-container">
                {/* Left side: The card */}
                <div className="hover-card">{/* Card content here */}</div>

                {/* Right side: Buttons that appear on hover */}
                <div className="hover-actions">
                  <button
                    className="btn btn-sm"
                    onClick={() => handleEditRecipient(party)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleRemoveRecipient("to", idx)}
                  >
                    <i className="bi bi-recycle"></i>
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="row m-0 border-bottom">
                <div className="col-6 p-2 border-end">
                  <small className="text-muted d-block">Company</small>
                  <span className="fw-small">{party.companyName || "—"}</span>
                </div>
                <div className="col-6 p-2">
                  <small className="text-muted d-block">Reference</small>
                  <span className="fw-small">{party.name || "—"}</span>
                </div>
              </div>
              <div className="row m-0 border-bottom">
                <div className="col-12 p-2">
                  <small className="text-muted d-block">Email</small>
                  <span className="fw-small">{party.email}</span>
                </div>
              </div>
              <div className="row m-0">
                <div className="col-12 p-2">
                  <small className="text-muted d-block">Phone</small>
                  <span className="fw-small">{party.phone || "—"}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="border p-4 rounded bg-light mx-auto"
            style={{ maxWidth: "500px" }}
          >
            <p className="mb-2 text-muted fw-semibold fs-8 text-center">
              Who's your client? <br /> Add a recipient.
            </p>
            <div className="d-flex gap-2 position-relative">
              <button
                className="btn btn-primary bg-[#0088F0] btn-sm flex-shrink-0"
                onClick={() => handleAddRecipient("to")}
              >
                + Add new recipient
              </button>

              <input
                type="text"
                placeholder="Search an existing recipient"
                className="form-control"
                value={selectedRecipient ? selectedRecipient.name : searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedRecipient(null);
                }}
              />

              {searchTerm.trim().length > 0 && !selectedRecipient && (
                <ul
                  className="list-group position-absolute mt-1 w-100 shadow-sm"
                  style={{ zIndex: 1060, top: "100%", marginTop: "10px" }}
                >
                  {filteredRecipients.length > 0 ? (
                    filteredRecipients.map((r) => (
                      <li
                        key={r.id}
                        className="list-group-item list-group-item-action small"
                        onClick={() => {
                          setSelectedRecipient(r);
                          setToParties((prev) => [...prev, r]);
                          setSearchTerm("");
                          setFilteredRecipients([]);
                        }}
                      >
                        {r.name} — {r.email}
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item small d-flex justify-content-between align-items-center">
                      <span>No results found for "{searchTerm}"</span>
                      <button
                        className="btn btn-light btn-sm px-3 py-1"
                        onClick={() => {
                          setFilteredRecipients([]);
                          setSearchTerm("");
                          setSelectedRecipient(null);
                          handleAddRecipient("to");
                        }}
                      >
                        Add
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FROM Section */}
      <div className="w-100 pb-4">
        <div
          className="d-flex justify-content-between align-items-center mb-2 text-secondary fw-semibold"
          style={{ maxWidth: "500px", margin: "0 auto" }}
        >
          <div className="d-flex align-items-center">
            <span className="text-dark fw-bold me-2">02</span>
            <span className="text-primary me-2">—</span>
            From
          </div>

          <button
            className="btn btn-light btn-sm px-3 py-1"
            onClick={() => setShowFromModal(true)}
          >
            Edit
          </button>
        </div>

        {/* Bordered Card */}
        <div
          className="border rounded bg-white mx-auto"
          style={{ maxWidth: "500px" }}
        >
          <div className="row m-0 border-bottom">
            <div className="col-6 p-2 border-end">
              <small className="text-muted d-block">Company</small>
              <span
                className="fw-small "
                onClick={() => setShowFromModal(true)}
              >
                {fromParty?.companyName || userFullName}
              </span>
            </div>
            <div className="col-6 p-2">
              <small className="text-muted d-block">Reference</small>
              <span className="fw-small" onClick={() => setShowFromModal(true)}>
                {fromParty?.name || userFullName}
              </span>
            </div>
          </div>
          <div className="row m-0">
            <div className="col-12 p-2">
              <small className="text-muted d-block">Email</small>
              <span className="fw-small" onClick={() => setShowFromModal(true)}>
                {fromParty?.email || userEmail}
              </span>
            </div>
          </div>
        </div>
      </div>
      <EditFromModal
        show={showFromModal}
        onHide={() => setShowFromModal(false)}
        fromParty={fromParty}
        userFallback={{ fullName: userFullName, email: userEmail }}
        onUpdated={(updated) => setFromParty(updated)}
      />

      {/* Modal */}
      <CreateClientModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedRecipient(null); // reset after close
        }}
        recipient={selectedRecipient} // ✅ pass selected recipient here
        onCreated={(newRecipient) => {
          if (selectedRecipient) {
            const updated = toParties.map((p) =>
              p.id === newRecipient.id ? newRecipient : p
            );
            setToParties(updated);
            dispatch(setParties({ toParties: updated, fromParty }));
          } else {
            setRecipients((prev) => [...prev, newRecipient]);
            handleSave(newRecipient); // already sets state
            dispatch(
              setParties({ toParties: [...toParties, newRecipient], fromParty })
            );
          }
          setSelectedRecipient(null);
        }}
      />

      <style>{`
      .more-button{
        position: absolute;
        top: -48px;
        right: 340px;
        z-index: 1000;
      }
        /* Container must be relatively positioned for absolute buttons */
      .hover-card-container {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        max-width: 520px;
        margin: 0 auto;
      }

      /* The card itself */
      .hover-card {
        width: 100%;
        border: 1px solid #dee2e6;
        border-radius: 0.375rem;
        background-color: #fff;
      }

      /* Action buttons on the right */
      .hover-actions {
        position: absolute;
        top: 8px;
        right: -60px; /* Puts buttons outside the card to the right */
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
        display: flex;
        flex-direction: column;
        gap: 6px;
        z-index: 10;
      }

      /* Show buttons when hovering over the card container */
      .hover-card-container:hover .hover-actions {
        opacity: 1;
      }

      /* Button styles */
      .hover-actions .btn {
        padding: 4px 6px;
        width: 25px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
      }

      .hover-actions .btn:hover {
        background-color: #e2e6ea;
      }


      `}</style>
    </div>
  );
};

export default Parties;
