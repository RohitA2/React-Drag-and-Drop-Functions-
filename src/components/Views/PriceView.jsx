import React from "react";
import { Card, Table } from "react-bootstrap";
import { TrendingDown } from "lucide-react";

const PriceView = ({ price }) => {
  // Handle case where price data is missing or invalid
  if (!price || !price.items || price.items.length === 0) {
    return <p className="text-center text-gray-500 p-4">No data found</p>;
  }

  // Determine the currency to use (prefer block-level currency if available, fall back to first item's currency)
  const displayCurrency = price.currency || (price.items[0]?.currency || "USD");

  return (
    <div
      className="container mx-auto p-6 bg-white shadow-lg rounded-xl"
      style={{ maxWidth: "1600px" }}
    >
      {/* Title */}
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-0">
          {price.title || "Pricing Details"}
        </h2>
      </div>

      {/* Main Card */}
      <Card className="shadow-md border-0 rounded-2xl overflow-hidden">
        <Card.Header className="bg-linear-to-r from-blue-50 to-indigo-100 border-0 py-4 px-6 flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">Single Option</span>
          <span className="badge bg-indigo-600 text-white px-3 py-1 rounded-full">
            {price.pricingType || "N/A"}
          </span>
        </Card.Header>

        <Card.Body className="p-6">
          {/* Package Name */}
          <h5 className="text-xl font-semibold text-gray-800 mb-3">
            {price.packageName || "Unnamed Package"}
          </h5>

          {/* Package Description */}
          <div
            className="text-gray-600 mb-6 text-base"
            dangerouslySetInnerHTML={{
              __html: price.packageDescription || "<p>No description available</p>",
            }}
          />

          {/* Items Table */}
          <Table bordered hover responsive className="mb-0 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-gray-700 font-medium">
                  Product / Service
                </th>
                <th className="py-3 px-4 text-right text-gray-700 font-medium">
                  Price ({displayCurrency})
                </th>
              </tr>
            </thead>
            <tbody>
              {price.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 px-4">{item.name || "Unnamed Item"}</td>
                  <td className="py-3 px-4 text-right">
                    {displayCurrency}{" "}
                    {Number(item.price || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>

        {/* Footer Totals */}
        <Card.Footer className="bg-gray-50 border-0 py-4 px-6">
          <div
            className="p-4 rounded-xl shadow-md bg-white"
            style={{ minWidth: "280px" }}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Net total</span>
                <span className="font-medium">
                  {displayCurrency} {Number(price.netTotal || 0).toFixed(2)}
                </span>
              </div>
              {price.rutDiscount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="flex items-center gap-1">
                    <TrendingDown size={14} /> RUT Discount
                  </span>
                  <span className="font-medium">
                    -{displayCurrency} {Number(price.rutDiscount || 0).toFixed(2)}
                  </span>
                </div>
              )}
              {price.rotDiscount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="flex items-center gap-1">
                    <TrendingDown size={14} /> ROT Discount
                  </span>
                  <span className="font-medium">
                    -{displayCurrency} {Number(price.rotDiscount || 0).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">VAT</span>
                <span className="font-medium">
                  {displayCurrency} {Number(price.vat || 0).toFixed(2)}
                </span>
              </div>
              {price.envTax > 0 && (
                <div className="flex justify-between items-center text-yellow-600">
                  <span>Environment Tax</span>
                  <span className="font-medium">
                    {displayCurrency} {Number(price.envTax || 0).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rounding</span>
                <span className="font-medium">
                  {displayCurrency} {Number(price.rounding || 0).toFixed(2)}
                </span>
              </div>
              <hr className="my-2 border-gray-200" />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total incl. VAT</span>
                <span className="text-green-600">
                  {displayCurrency} {Number(price.total || 0).toFixed(2)}
                </span>
              </div>
              {price.vatType === "reverse" && (
                <div className="text-sm text-blue-600 mt-2">
                  * Reverse Charge Applied: VAT to be paid directly to tax
                  authority
                </div>
              )}
            </div>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default PriceView;