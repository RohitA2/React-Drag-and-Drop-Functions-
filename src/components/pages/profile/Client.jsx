import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button, Badge, Modal, Form, Spinner, Alert } from "react-bootstrap";
import { Eye, Edit, Trash2, Filter, Search, RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";
import { selectedUserId } from "../../../store/authSlice";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const ClientGrid = () => {
  const userId = useSelector(selectedUserId);
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch clients data
  const fetchClients = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);

      // CORRECTED: Changed from recipients to clients
      const response = await fetch(
        `${API_URL}/api/recipients?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("data from api", data);

      if (data.success) {
        setRowData(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch clients");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, API_URL]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Column Definitions
  const columnDefs = [
    {
      headerName: "ID",
      field: "id",
      width: 80,
      filter: "agNumberColumnFilter",
      sort: "desc",
    },
    {
      headerName: "Type",
      field: "type",
      width: 120,
      cellRenderer: (params) => (
        <Badge
          bg={params.value === "company" ? "primary" : "secondary"}
          className="text-uppercase"
        >
          {params.value}
        </Badge>
      ),
    },
    {
      headerName: "Name",
      field: "name",
      width: 180,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Email",
      field: "email",
      width: 200,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Phone",
      field: "phone",
      width: 150,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Company",
      field: "companyName",
      width: 180,
      filter: "agTextColumnFilter",
      cellRenderer: (params) => params.value || "-",
    },
    {
      headerName: "Status",
      field: "status",
      width: 120,
      cellRenderer: (params) => (
        <Badge
          bg={params.value === "Active" ? "success" : "danger"}
          className="text-uppercase"
        >
          {params.value}
        </Badge>
      ),
    },
    {
      headerName: "Created",
      field: "createdAt",
      width: 150,
      filter: "agDateColumnFilter",
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      headerName: "Actions",
      width: 120,
      cellRenderer: (params) => (
        <div className="d-flex gap-1">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleViewClient(params.data)}
            title="View Details"
          >
            <Eye size={14} />
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => handleEditClient(params.data)}
            title="Edit"
          >
            <Edit size={14} />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDeleteClient(params.data)}
            title="Delete"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
      sortable: false,
      filter: false,
    },
  ];

  // Default Column Definitions
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
      suppressMenu: true,
    }),
    []
  );

  // Handle view client details
  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  // Handle edit client
  const handleEditClient = (client) => {
    console.log("Edit client:", client);
    // Implement edit functionality
    alert(`Edit functionality for ${client.name} would be implemented here`);
  };

  // Handle delete client
  const handleDeleteClient = async (client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      try {
        const response = await fetch(`${API_URL}/api/recipients/${client.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Remove from local state
          setRowData((prev) => prev.filter((c) => c.id !== client.id));
          alert("Client deleted successfully");
        } else {
          throw new Error("Failed to delete client");
        }
      } catch (err) {
        alert("Error deleting client: " + err.message);
      }
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchClients();
  };

  // Filter data
  const filteredData = useMemo(() => {
    if (!filterText) return rowData;

    return rowData.filter(
      (client) =>
        client.name?.toLowerCase().includes(filterText.toLowerCase()) ||
        client.email?.toLowerCase().includes(filterText.toLowerCase()) ||
        client.phone?.includes(filterText) ||
        client.companyName?.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [rowData, filterText]);

  // Loading state
  if (loading) {
    return (
      <div className="container-fluid p-3">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "400px" }}
        >
          <Spinner animation="border" role="status" className="me-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <span>Loading clients...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container-fluid p-3">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Clients</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchClients}>
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-success rounded">
        <div>
          <h4 className="mb-0">Clients Management</h4>
          <small className="text-muted">
            Total: {rowData.length} clients • Showing: {filteredData.length}
          </small>
        </div>

        {/* Search and Filter */}
        <div className="d-flex gap-2 align-items-center">
          <div className="position-relative">
            <Search
              size={18}
              className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
            />
            <Form.Control
              type="text"
              placeholder="Search clients..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="ps-5"
              style={{ width: "250px" }}
            />
          </div>
          <Button variant="outline-secondary" size="sm" onClick={handleRefresh}>
            <RefreshCw size={16} className="me-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {rowData.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3">
            <Search size={48} className="text-muted" />
          </div>
          <h5>No clients found</h5>
          <p className="text-muted">There are no clients in the system yet.</p>
          <Button variant="primary" onClick={fetchClients}>
            Refresh
          </Button>
        </div>
      ) : (
        /* AG Grid */
        <div
          className="ag-theme-alpine"
          style={{
            height: "600px",
            width: "100%",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <AgGridReact
            rowData={filteredData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
            suppressRowClickSelection={true}
            animateRows={true}
            rowSelection="multiple"
            domLayout="normal"
            enableCellTextSelection={true}
            ensureDomOrder={true}
            onGridReady={(params) => {
              params.api.sizeColumnsToFit();
            }}
            onFirstDataRendered={(params) => {
              params.api.sizeColumnsToFit();
            }}
          />
        </div>
      )}

      {/* Client Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Client Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient && (
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-muted">Basic Information</h6>
                <div className="mb-3">
                  <strong>Name:</strong> {selectedClient.name}
                </div>
                <div className="mb-3">
                  <strong>Email:</strong> {selectedClient.email}
                </div>
                <div className="mb-3">
                  <strong>Phone:</strong> {selectedClient.phone || "-"}
                </div>
                <div className="mb-3">
                  <strong>Type:</strong>
                  <Badge
                    bg={
                      selectedClient.type === "company"
                        ? "primary"
                        : "secondary"
                    }
                    className="ms-2"
                  >
                    {selectedClient.type}
                  </Badge>
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="text-muted">Company Information</h6>
                <div className="mb-3">
                  <strong>Company Name:</strong>{" "}
                  {selectedClient.companyName || "-"}
                </div>
                <div className="mb-3">
                  <strong>GST Number:</strong> {selectedClient.gstNumber || "-"}
                </div>

                <h6 className="text-muted mt-4">Status</h6>
                <div>
                  <Badge
                    bg={
                      selectedClient.status === "Active" ? "success" : "danger"
                    }
                  >
                    {selectedClient.status}
                  </Badge>
                </div>
              </div>

              <div className="col-12 mt-4">
                <h6 className="text-muted">Timestamps</h6>
                <div className="row">
                  <div className="col-md-6">
                    <small>
                      <strong>Created:</strong>{" "}
                      {new Date(selectedClient.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <div className="col-md-6">
                    <small>
                      <strong>Updated:</strong>{" "}
                      {new Date(selectedClient.updatedAt).toLocaleString()}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => handleEditClient(selectedClient)}
          >
            Edit Client
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .ag-theme-alpine {
          --ag-header-background-color: black;
          --ag-header-foreground-color: #495057;
          --ag-border-color: #dee2e6;
          --ag-row-hover-color: #f8f9fa;
        }

        .ag-header-cell {
          font-weight: 600;
        }

        .ag-cell {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default ClientGrid;
