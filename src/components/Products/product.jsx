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
    <div
      className="px-4 mt-4"
      style={{ width: "100%", background: "linear-gradient(135deg, #f0f4f8 0%, #d9e4f5 100%)" }}
    >
      <Card className="shadow-lg border-0 rounded-3" style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(8px)" }}>
        <Card.Body className="p-4">
          {/* Header */}
          <Row className="align-items-center mb-4">
            <Col>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary rounded-circle p-2" style={{ width: "40px", height: "40px" }}>
                  <i className="bi bi-cart text-white fs-5"></i>
                </div>
                <div>
                  <h5 className="mb-0 text-dark fw-bold">Products</h5>
                  <p className="text-muted mb-0 small">Manage your goods & services here.</p>
                </div>
              </div>
            </Col>
            <Col xs="auto" className="d-flex gap-3">
              <InputGroup className="shadow-sm rounded-pill overflow-hidden flex-grow-1" style={{ maxWidth: "300px" }}>
                <InputGroup.Text className="bg-light border-0">
                  <i className="bi bi-search text-secondary"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  className="border-0 bg-light"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ boxShadow: "none" }}
                />
              </InputGroup>
              <Button
                variant="primary"
                className="px-4 py-2 rounded-pill shadow-sm"
                style={{ background: "linear-gradient(90deg, #4f46e5, #6b46c1)", border: "none" }}
                onClick={handleShowModal}
              >
                + Create Product
              </Button>
            </Col>
          </Row>

          {/* Table */}
          <div className="table-responsive">
            <Table hover responsive className="align-middle text-nowrap">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 text-dark fw-semibold">ID</th>
                  <th className="py-3 text-dark fw-semibold">Name</th>
                  <th className="py-3 text-dark fw-semibold">Unit</th>
                  <th className="py-3 text-dark fw-semibold">Tax ($)</th>
                  <th className="py-3 text-dark fw-semibold">Price ($)</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <tr key={index} className="border-bottom hover-effect">
                      <td className="py-3 fw-bold text-primary">{product.id}</td>
                      <td className="py-3">{product.name}</td>
                      <td className="py-3">{product.unit}</td>
                      <td className="py-3">${product.tax.toLocaleString()}</td>
                      <td className="py-3">${product.price.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <i className="bi bi-box-seam fs-2 mb-3"></i>
                      <h6>No products found</h6>
                      <p className="mb-0">Add a product to get started!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal */}
      <ProductModal show={showModal} handleClose={handleCloseModal} />

      {/* Inline Styles */}
      <style>{`
        .card {
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .table-responsive {
          border-radius: 8px;
          overflow: hidden;
        }

        .table {
          background-color: #fff;
          border-radius: 8px;
        }

        .table thead {
          border-bottom: 2px solid #e9ecef;
        }

        .table th {
          font-size: 0.95rem;
        }

        .table td {
          vertical-align: middle;
        }

        .hover-effect:hover {
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
        }

        .btn-primary {
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: linear-gradient(90deg, #4338ca, #5a32a3);
          transform: translateY(-1px);
        }

        .bg-light {
          background-color: #f8f9fa !important;
        }

        .input-group .form-control:focus {
          border-color: #4f46e5;
          box-shadow: none;
          background-color: #fff;
        }

        @media (max-width: 768px) {
          .d-flex.gap-3 {
            flex-direction: column;
            align-items: stretch;
          }

          .input-group {
            width: 100%;
          }

          .btn-primary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductsTable;