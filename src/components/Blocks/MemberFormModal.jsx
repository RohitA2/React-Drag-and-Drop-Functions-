import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import "./MemberFormModal.css"; 

const MemberFormModal = ({ show, onClose, onSave }) => {
  const [type, setType] = useState("individual");

  // shared
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // individual
  const [fullName, setFullName] = useState("");

  // company
  const [companyName, setCompanyName] = useState("");
  const [personName, setPersonName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const data =
      type === "individual"
        ? { type, fullName, email, phone }
        : {
            type,
            companyName,
            personName,
            city,
            email,
            phone,
            address,
            zip,
            pin,
          };

    onSave(data);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      {/* <Modal.Header closeButton>
        <Modal.Title>
          Add {type === "individual" ? "Individual" : "Company"} Member
        </Modal.Title>
      </Modal.Header> */}
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3 d-flex gap-3 justify-content-center">
            <Form.Check
              inline
              type="radio"
              label="Individual"
              name="type"
              value="individual"
              checked={type === "individual"}
              onChange={() => setType("individual")}
            />
            <Form.Check
              inline
              type="radio"
              label="Company"
              name="type"
              value="company"
              checked={type === "company"}
              onChange={() => setType("company")}
            />
          </div>

          <div className={`form-flip ${type}`}>
            {type === "individual" && (
              <div className="flip-panel">
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Form.Group>
              </div>
            )}

            {type === "company" && (
              <div className="flip-panel">
                <Form.Group className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contact Person Name</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3 d-flex gap-2">
                  <div className="flex-grow-1">
                    <Form.Label>ZIP</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <Form.Label>PIN</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                    />
                  </div>
                </Form.Group>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone (with country code)</Form.Label>
              <PhoneInput
                country={"in"}
                value={phone}
                onChange={setPhone}
                inputProps={{
                  required: true,
                }}
                inputStyle={{
                  width: "100%",
                }}
              />
            </Form.Group>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Member
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MemberFormModal;
