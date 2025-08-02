import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import MemberFormModal from "./MemberFormModal";

const Parties = () => {
  const [toParty, setToParty] = useState(null);
  const [fromParty, setFromParty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentSection, setCurrentSection] = useState("to");

  const handleAddRecipient = (section) => {
    setCurrentSection(section);
    setShowModal(true);
  };

  const handleSave = (data) => {
    if (currentSection === "to") setToParty(data);
    else setFromParty(data);
    setShowModal(false);
  };

  return (
    <div className="container bg-white rounded shadow p-4 my-4 d-flex flex-column align-items-center text-center">
      <h4 className="fw-bold mb-4">Parties</h4>

      {/* TO Section */}
      <div className="mb-5 w-100">
        <div className="d-flex justify-content-center align-items-center mb-2 text-secondary fw-semibold">
          <span className="text-dark fw-bold me-2">01</span>
          <span className="text-primary me-2">—</span>
          To
        </div>

        {toParty ? (
          <div
            className="border rounded p-3 bg-light mx-auto"
            style={{ maxWidth: "400px" }}
          >
            <h6 className="mb-1">
              {toParty.type === "company" ? toParty.company : toParty.fullName}
            </h6>
            <p className="mb-0 small text-muted">{toParty.email}</p>
            <p className="mb-0 small text-muted">+{toParty.phone}</p>
          </div>
        ) : (
          <div
            className="border p-4 rounded bg-light mx-auto"
            style={{ maxWidth: "400px" }}
          >
            <p className="mb-2 text-muted fw-semibold fs-6 text-center  top-0 start-0">
              Who's your client? <br /> Add a recipient.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleAddRecipient("to")}
            >
              <i className="bi bi-plus-lg me-1" />
              Add new recipient
            </button>
          </div>
        )}
      </div>

      {/* FROM Section */}
      <div className="w-100">
        <div className="d-flex justify-content-center align-items-center mb-2 text-secondary fw-semibold">
          <span className="text-dark fw-bold me-2">02</span>
          <span className="text-primary me-2">—</span>
          From
        </div>

        {fromParty ? (
          <div
            className="border rounded p-3 bg-light mx-auto position-relative"
            style={{ maxWidth: "500px" }}
          >
            <button
              className="btn btn-outline-secondary btn-sm position-absolute top-0 end-0 m-2"
              onClick={() => handleAddRecipient("from")}
            >
              Edit
            </button>
            <div className="row text-start">
              <div className="col-md-6">
                <small className="text-muted">Company</small>
                <p className="mb-1">
                  {fromParty.company || fromParty.fullName}
                </p>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Reference</small>
                <p className="mb-1">{fromParty.fullName}</p>
              </div>
            </div>
            <small className="text-muted">Email</small>
            <p className="mb-0">{fromParty.email}</p>
            <small className="text-muted">Phone</small>
            <p className="mb-0">+{fromParty.phone}</p>
          </div>
        ) : (
          <div
            className="border p-4 rounded bg-light mx-auto"
            style={{ maxWidth: "400px" }}
          >
            <p className="mb-2 text-muted">Who's sending it? Add sender.</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleAddRecipient("from")}
            >
              <i className="bi bi-plus-lg me-1" />
              Add sender
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <MemberFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default Parties;
