import React, { useState, useEffect, use } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import { useSelector } from "react-redux";
import { selectedUserId } from "../../../store/authSlice";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const EditFromModal = ({
  show,
  onHide,
  fromParty,
  userFallback,
  onUpdated,
}) => {
  const userId = useSelector(selectedUserId);
  const [formData, setFormData] = useState({
    company: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const fullName = fromParty?.name || userFallback?.fullName || "";
    const [firstName = "", lastName = ""] = fullName.split(" ");
    setFormData({
      company: fromParty?.company || userFallback?.fullName || "",
      firstName,
      lastName,
      email: fromParty?.email || userFallback?.email || "",
      phone: fromParty?.phone || "",
    });
  }, [fromParty, userFallback]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        company: formData.company,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
      };

      const res = await axios.post(
        `${API_URL}/api/users/update/${userId}`,
        payload
      );
      const data = res.data;

      if (data.success === false) {
        toast.error("Failed to update From details");
        return;
      }

      toast.success("From party updated successfully");
      onUpdated(data.data || payload);
      onHide();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update From details");
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="custom-modal-sm"
    >
      <Modal.Header closeButton>
        <Modal.Title>Edit company</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3 topper">
            <Form.Control
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company name"
            />
          </Form.Group>

          <Row>
            <Col>
              <Form.Group className="mb-3 topper">
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3 topper">
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3 topper">
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <PhoneInput
              country={"us"}
              value={formData.phone}
              onChange={handlePhoneChange}
              inputProps={{
                name: "phone",
                required: true,
              }}
              inputStyle={{ width: "100%" }}
              placeholder="Cellphone"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          style={{
            width: "100%",
            fontWeight: "500",
            padding: "0.5rem",
            margin: "0",
          }}
          onClick={handleSave}
        >
          Save company
        </Button>
      </Modal.Footer>
      <style>{`
        .topper { margin-bottom: 10px !important;
        cursor: pointer;
        }
        .custom-modal-sm {
          max-width: 400px;
        }
        .custom-modal-sm .modal-content {
          border-radius: 12px;
          border: none;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        `}</style>
    </Modal>
  );
};

export default EditFromModal;
