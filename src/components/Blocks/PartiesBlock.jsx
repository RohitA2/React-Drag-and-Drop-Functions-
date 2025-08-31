import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import CreateClientModal from "../Forms/CreateClientModal";
import { useSelector } from "react-redux";
import {
  selectedUserId,
  selectUserFullName,
  selectUserEmail,
} from "../../store/authSlice";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const Parties = () => {
  const userId = useSelector(selectedUserId);
  const userFullName = useSelector(selectUserFullName);
  const userEmail = useSelector(selectUserEmail);

  const [toParty, setToParty] = useState(null);
  const [fromParty, setFromParty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentSection, setCurrentSection] = useState("to");

  const [recipients, setRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  const handleAddRecipient = (section) => {
    setCurrentSection(section);
    setShowModal(true);
  };

  const handleSave = (data) => {
    if (currentSection === "to") setToParty(data);
    else setFromParty(data);
    setShowModal(false);
  };

  // ✅ Fetch recipients for logged in user
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


  



  

  return (
    <div
      className="container bg-white rounded shadow p-4 my-4"
      style={{ maxWidth: "1800px" }}
    >
      {/* TO Section */}
      <div className="mb-5 w-100 p-4">
        <div
          className="d-flex justify-content-between align-items-center mb-2 text-secondary fw-semibold"
          style={{ maxWidth: "500px", margin: "0 auto" }}
        >
          <h4 className="fw-bold mb-4 ">Parties</h4>
          <div className="d-flex">
            <span className="text-dark fw-bold me-2">01</span>
            <span className="text-primary me-2">—</span>
            To
          </div>
        </div>

        {toParty ? (
          <div
            className="border rounded p-3 bg-light mx-auto"
            style={{ maxWidth: "500px" }}
          >
            <h6 className="mb-1">{toParty.name}</h6>
            <p className="mb-0 small text-muted">{toParty.email}</p>
          </div>
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
                className="btn btn-primary btn-sm flex-shrink-0"
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

              {/* Dropdown list */}
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
                          setToParty(r);
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
                        className="btn btn-[#F4F4F4] shadow-sm btn-sm py-1 p-2 rounded-3 text-primary fw-semibold hover:bg-[#ACCCFC]"
                        onClick={() => {
                          setFilteredRecipients([]); // hide dropdown
                          setSearchTerm(""); // reset search input
                          setSelectedRecipient(null); // clear selection
                          handleAddRecipient("to");
                          l;
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
            className="btn btn-[#F4F4F4] shadow-sm btn-sm py-1 p-2 rounded-3 text-secondary fw-semibold hover:bg-[#ACCCFC]"
            onClick={() => handleAddRecipient("from")}
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
              <span className="fw-small">
                {fromParty?.company || userFullName}
              </span>
            </div>
            <div className="col-6 p-2">
              <small className="text-muted d-block">Reference</small>
              <span className="fw-small">
                {fromParty?.name || userFullName}
              </span>
            </div>
          </div>
          <div className="row m-0">
            <div className="col-12 p-2">
              <small className="text-muted d-block">Email</small>
              <span className="fw-small">{fromParty?.email || userEmail}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreateClientModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onCreated={(newRecipient) => {
          setRecipients((prev) => [...prev, newRecipient]);
          handleSave(newRecipient);
        }}
      />
    </div>
  );
};

export default Parties;
