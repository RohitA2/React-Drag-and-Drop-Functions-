import React from "react";
import { Form, Row, Col } from "react-bootstrap";

export default function CompanyClientForm() {
  return (
    <Form>
      <Row className="mb-3">
        <Col>
          <Form.Label>Company Name</Form.Label>
          <Form.Control placeholder="Enter company name" />
        </Col>
        <Col>
          <Form.Label>Company Email</Form.Label>
          <Form.Control placeholder="Enter email" />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Label>Registration Number</Form.Label>
          <Form.Control placeholder="Enter registration number" />
        </Col>
        <Col>
          <Form.Label>Website</Form.Label>
          <Form.Control placeholder="Enter website URL" />
        </Col>
      </Row>

      <Row className="mb-3">
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
    </Form>
  );
}
