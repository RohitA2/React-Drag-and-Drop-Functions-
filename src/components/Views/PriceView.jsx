import React from "react";
import { Card, Table } from "react-bootstrap";

const PriceView = ({ price }) => {
  if (!price) return <p>No data found</p>;

  return (
    <div
      className="container p-4 bg-white shadow"
      style={{ maxWidth: "1600px" }}
    >
      {/* Title */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <h2 className="fs-2 fw-bold text-black mb-0">{price.title}</h2>
      </div>

      {/* Main Card */}
      <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center py-3 px-4 border-0">
          <span className="fw-semibold text-secondary">Single option</span>
          <span className="badge bg-primary">{price.pricingType}</span>
        </Card.Header>

        <Card.Body className="px-4">
          {/* Package Name */}
          <h5 className="fs-5 fw-semibold mb-2">{price.packageName}</h5>

          {/* Package Description */}
          <div
            className="text-muted mb-4"
            dangerouslySetInnerHTML={{ __html: price.packageDescription }}
          />

          {/* Items Table */}
          <Table bordered hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Product / Service</th>
                <th className="text-end">Price ({price.currency})</th>
              </tr>
            </thead>
            <tbody>
              {price.items?.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td className="text-end">
                    {item.currency} {Number(item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>

        {/* Footer Totals */}
        <Card.Footer className="bg-white border-0 py-3 px-4">
          <div
            className="p-3 rounded-3 shadow-sm bg-light"
            style={{ minWidth: "260px" }}
          >
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Net total</span>
              <span>
                {price.currency} {price.netTotal.toFixed(2)}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">VAT</span>
              <span>
                {price.currency} {price.vat.toFixed(2)}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Rounding</span>
              <span>
                {price.currency} {price.rounding.toFixed(2)}
              </span>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between fw-bold fs-6">
              <span>Total incl. VAT</span>
              <span className="text-success">
                {price.currency} {price.total.toFixed(2)}
              </span>
            </div>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default PriceView;
