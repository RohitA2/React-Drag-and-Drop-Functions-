import React from "react";
import { Form, Row, Col } from "react-bootstrap";

export default function IndividualClientForm() {
  return (
    <Form>
      <Row className="mb-3">
        <Col>
          <Form.Label>Name</Form.Label>
          <Form.Control placeholder="Enter name" />
        </Col>
        <Col>
          <Form.Label>Email</Form.Label>
          <Form.Control placeholder="Enter email" />
        </Col>
        <Col>
          <Form.Label>Phone Number</Form.Label>
          <Form.Control placeholder="Enter number" />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Label>Social Security Number</Form.Label>
          <Form.Control placeholder="Enter number" />
        </Col>
        <Col>
          <Form.Label>Address</Form.Label>
          <Form.Control placeholder="Enter address" />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Label>Zip Code</Form.Label>
          <Form.Control placeholder="Enter zip code" />
        </Col>
        <Col>
          <Form.Label>City</Form.Label>
          <Form.Control placeholder="Enter city" />
        </Col>
      </Row>

      <Form.Check
        inline
        name="workAddress"
        label="Work address same as above"
        type="radio"
        defaultChecked
        className="me-3"
      />
      <Form.Check inline name="workAddress" label="Other" type="radio" />
    </Form>
  );
}
