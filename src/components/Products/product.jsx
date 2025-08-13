// src/components/ProductsTable.jsx
import React, { useState } from "react";
import {
  Table,
  Form,
  Button,
  InputGroup,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import ProductModal from "./ProductModal";

const ProductsTable = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const products = [
    { id: "123456", name: "Product 2", unit: 2, tax: 50, price: 5000 },
    { id: "789012", name: "Product 3", unit: 1, tax: 25, price: 2000 },
  ];

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.includes(search)
  );

  return (
    <div className="px-4 mt-4" style={{ width: "100%" }}>
      <Card className="shadow-sm p-3 w-100">
        {/* Header */}
        <Row className="align-items-center mb-3">
          <Col>
            <h5 className="mb-1">Products</h5>
            <p className="text-muted mb-0">Add your goods & Services here.</p>
          </Col>
          <Col xs="auto" className="d-flex gap-2">
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Button
              variant="primary"
              className="px-3"
              onClick={handleShowModal}
            >
              + Create Products
            </Button>
          </Col>
        </Row>

        {/* Table */}
        <Table hover responsive className="align-middle mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Unit</th>
              <th>Tax</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <tr key={index}>
                  <td className="fw-bold">{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.unit}</td>
                  <td>${product.tax}</td>
                  <td>${product.price.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* Modal */}
      <ProductModal show={showModal} handleClose={handleCloseModal} />
    </div>
  );
};

export default ProductsTable;
