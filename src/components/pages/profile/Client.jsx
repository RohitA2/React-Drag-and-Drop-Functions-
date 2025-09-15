import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  Button,
  Badge,
  Modal,
  Form,
  Spinner,
  Alert,
  Card,
  InputGroup,
} from "react-bootstrap";
import {
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  Plus,
  User,
  Building,
  Download,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectedUserId } from "../../../store/authSlice";
import CreateClientModal from "../../Forms/CreateClientModal";

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
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch clients data
  const fetchClients = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);

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
      cellStyle: { fontFamily: "monospace" },
    },
    {
      headerName: "TYPE",
      field: "type",
      width: 120,
      cellRenderer: (params) => (
        <Badge
          bg={params.value === "company" ? "primary" : "secondary"}
          className="text-uppercase d-flex align-items-center justify-content-center px-2 py-1"
          style={{
            width: "90px",
            fontSize: "0.75rem",
            backgroundColor: params.value === "company" ? "#6366f1" : "#8b5cf6",
          }}
        >
          {params.value === "company" ? (
            <Building size={10} className="me-1" />
          ) : (
            <User size={10} className="me-1" />
          )}
          {params.value}
        </Badge>
      ),
    },
    {
      headerName: "NAME",
      field: "name",
      width: 180,
      filter: "agTextColumnFilter",
      cellStyle: { fontWeight: "500" },
    },
    {
      headerName: "EMAIL",
      field: "email",
      width: 200,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "PHONE",
      field: "phone",
      width: 150,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "COMPANY",
      field: "companyName",
      width: 180,
      filter: "agTextColumnFilter",
      cellRenderer: (params) => params.value || "-",
    },
    {
      headerName: "STATUS",
      field: "status",
      width: 120,
      cellRenderer: (params) => (
        <Badge
          className="text-uppercase d-flex align-items-center justify-content-center px-2 py-1"
          style={{
            width: "80px",
            fontSize: "0.75rem",
            backgroundColor: params.value === "Active" ? "#10b981" : "#ef4444",
          }}
        >
          {params.value}
        </Badge>
      ),
    },
    {
      headerName: "CREATED",
      field: "createdAt",
      width: 150,
      filter: "agDateColumnFilter",
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      headerName: "ACTIONS",
      width: 140,
      cellRenderer: (params) => (
        <div className="d-flex justify-content-center align-items-center gap-2">
          <button
            className="icon-btn"
            onClick={() => handleViewClient(params.data)}
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            className="icon-btn"
            onClick={() => handleEditClient(params.data)}
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            className="icon-btn"
            onClick={() => handleDeleteClient(params.data)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
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
    let data = rowData;

    // Apply status filter
    if (activeFilter !== "all") {
      data = data.filter((client) => client.status === activeFilter);
    }

    // Apply search filter
    if (filterText) {
      data = data.filter(
        (client) =>
          client.name?.toLowerCase().includes(filterText.toLowerCase()) ||
          client.email?.toLowerCase().includes(filterText.toLowerCase()) ||
          client.phone?.includes(filterText) ||
          client.companyName?.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    return data;
  }, [rowData, filterText, activeFilter]);

  // Stats for the header
  const stats = useMemo(() => {
    const activeClients = rowData.filter(
      (client) => client.status === "Active"
    ).length;
    const companyClients = rowData.filter(
      (client) => client.type === "company"
    ).length;
    const individualClients = rowData.filter(
      (client) => client.type === "individual"
    ).length;

    return { activeClients, companyClients, individualClients };
  }, [rowData]);

  // Loading state
  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "400px" }}
        >
          <Spinner
            animation="border"
            role="status"
            variant="primary"
            className="me-3"
            style={{ color: "#6366f1" }}
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <span className="fs-5 text-muted">Loading clients...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container-fluid p-4">
        <Alert
          variant="danger"
          className="border-0 rounded-xl shadow-sm"
          style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
        >
          <Alert.Heading className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Error Loading Clients
          </Alert.Heading>
          <p>{error}</p>
          <Button
            variant="outline-danger"
            onClick={fetchClients}
            className="rounded-pill px-4"
          >
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className="container-fluid p-4"
      style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-6">
        <div>
          <h2 className="fw-bold mb-1 text-gray-800">Client Management</h2>
          <p className="text-muted mb-0">
            Manage your clients and their information
          </p>
        </div>

        <div className="d-flex gap-3">
          <Button
            variant="outline-primary"
            className="d-flex align-items-center rounded-pill px-4 border-2"
            style={{ fontWeight: 500 }}
          >
            <Download size={18} className="me-2" />
            Export
          </Button>
          <Button
            variant="primary"
            className="d-flex align-items-center rounded-pill px-4"
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: "#6366f1",
              border: "none",
              fontWeight: 500,
            }}
          >
            <Plus size={18} className="me-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-6">
        <div className="col-md-3">
          <Card
            className="border-0 rounded-xl shadow-sm"
            style={{ backgroundColor: "#eff6ff" }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">Total Clients</h6>
                  <h4 className="fw-bold mb-0 text-gray-800">
                    {rowData.length}
                  </h4>
                </div>
                <div
                  className="bg-primary p-3 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "#6366f1" }}
                >
                  <User size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card
            className="border-0 rounded-xl shadow-sm"
            style={{ backgroundColor: "#ecfdf5" }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">Active</h6>
                  <h4 className="fw-bold mb-0 text-gray-800">
                    {stats.activeClients}
                  </h4>
                </div>
                <div
                  className="bg-success p-3 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "#10b981" }}
                >
                  <Eye size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card
            className="border-0 rounded-xl shadow-sm"
            style={{ backgroundColor: "#eff6ff" }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">Companies</h6>
                  <h4 className="fw-bold mb-0 text-gray-800">
                    {stats.companyClients}
                  </h4>
                </div>
                <div
                  className="bg-info p-3 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "#0ea5e9" }}
                >
                  <Building size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card
            className="border-0 rounded-xl shadow-sm"
            style={{ backgroundColor: "#fef3c7" }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-muted mb-1">Individuals</h6>
                  <h4 className="fw-bold mb-0 text-gray-800">
                    {stats.individualClients}
                  </h4>
                </div>
                <div
                  className="bg-warning p-3 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "#f59e0b" }}
                >
                  <User size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 rounded-xl shadow-sm mb-6">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <span className="text-muted me-2 fw-medium">Filter by:</span>
              <Button
                variant={activeFilter === "all" ? "primary" : "outline-primary"}
                size="sm"
                onClick={() => setActiveFilter("all")}
                className="rounded-pill px-3"
                style={
                  activeFilter === "all"
                    ? { backgroundColor: "#6366f1", border: "none" }
                    : { border: "2px solid #6366f1", color: "#6366f1" }
                }
              >
                All
              </Button>
              <Button
                variant={
                  activeFilter === "Active" ? "success" : "outline-success"
                }
                size="sm"
                onClick={() => setActiveFilter("Active")}
                className="rounded-pill px-3"
                style={
                  activeFilter === "Active"
                    ? { backgroundColor: "#10b981", border: "none" }
                    : { border: "2px solid #10b981", color: "#10b981" }
                }
              >
                Active
              </Button>
              <Button
                variant={
                  activeFilter === "Inactive" ? "danger" : "outline-danger"
                }
                size="sm"
                onClick={() => setActiveFilter("Inactive")}
                className="rounded-pill px-3"
                style={
                  activeFilter === "Inactive"
                    ? { backgroundColor: "#ef4444", border: "none" }
                    : { border: "2px solid #ef4444", color: "#ef4444" }
                }
              >
                Inactive
              </Button>
            </div>

            <div className="d-flex gap-2 align-items-center flex-wrap">
              <InputGroup style={{ width: "300px" }} className="rounded-pill">
                <InputGroup.Text className="bg-light border-end-0 rounded-start-pill">
                  <Search size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search clients..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="border-start-0 rounded-end-pill"
                  style={{ boxShadow: "none" }}
                />
              </InputGroup>

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleRefresh}
                className="d-flex align-items-center rounded-pill px-3"
                style={{ border: "2px solid #9ca3af", color: "#4b5563" }}
              >
                <RefreshCw size={16} className="me-1" />
                Refresh
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Results count */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="text-muted mb-0 fw-medium">
          Showing{" "}
          <strong className="text-gray-800">{filteredData.length}</strong> of{" "}
          <strong className="text-gray-800">{rowData.length}</strong> clients
        </p>
      </div>

      {/* Empty state */}
      {rowData.length === 0 ? (
        <Card className="border-0 rounded-xl shadow-sm">
          <Card.Body className="text-center py-5">
            <div className="mb-3">
              <Search size={48} className="text-muted opacity-50" />
            </div>
            <h5 className="text-gray-800">No clients found</h5>
            <p className="text-muted">
              There are no clients in the system yet.
            </p>
            <Button
              variant="primary"
              onClick={fetchClients}
              className="d-flex align-items-center mx-auto rounded-pill px-4"
              style={{ backgroundColor: "#6366f1", border: "none" }}
            >
              <RefreshCw size={16} className="me-2" />
              Refresh
            </Button>
          </Card.Body>
        </Card>
      ) : filteredData.length === 0 ? (
        <Card className="border-0 rounded-xl shadow-sm">
          <Card.Body className="text-center py-5">
            <div className="mb-3">
              <Filter size={48} className="text-muted opacity-50" />
            </div>
            <h5 className="text-gray-800">No matching clients</h5>
            <p className="text-muted">
              Try adjusting your search or filter criteria.
            </p>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setFilterText("");
                setActiveFilter("all");
              }}
              className="rounded-pill px-4"
              style={{ border: "2px solid #9ca3af", color: "#4b5563" }}
            >
              Clear Filters
            </Button>
          </Card.Body>
        </Card>
      ) : (
        /* AG Grid */
        <div
          className="ag-theme-alpine shadow-sm rounded-xl"
          style={{
            height: "600px",
            width: "100%",
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
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        contentClassName="rounded-xl"
      >
        <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
          <Modal.Title className="fw-bold text-gray-800">
            Client Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0 px-4 pb-4">
          {selectedClient && (
            <div className="row">
              <div className="col-md-6">
                <div className="mb-4">
                  <h6 className="text-muted text-uppercase small mb-3">
                    Basic Information
                  </h6>
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3">
                      <div
                        className="bg-primary bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "60px", height: "60px" }}
                      >
                        {selectedClient.type === "company" ? (
                          <Building size={24} className="text-primary" />
                        ) : (
                          <User size={24} className="text-primary" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0 text-gray-800">
                        {selectedClient.name}
                      </h5>
                      <Badge
                        className="text-uppercase px-2 py-1 mt-1"
                        style={{
                          backgroundColor:
                            selectedClient.type === "company"
                              ? "#6366f1"
                              : "#8b5cf6",
                          fontSize: "0.7rem",
                        }}
                      >
                        {selectedClient.type}
                      </Badge>
                    </div>
                  </div>

                  <div className="ms-5 ps-2">
                    <div className="mb-3">
                      <span className="text-muted small">Email:</span>
                      <div className="fw-medium text-gray-800">
                        {selectedClient.email}
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="text-muted small">Phone:</span>
                      <div className="fw-medium text-gray-800">
                        {selectedClient.phone || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-4">
                  <h6 className="text-muted text-uppercase small mb-3">
                    Company Information
                  </h6>
                  <div className="mb-3">
                    <span className="text-muted small">Company Name:</span>
                    <div className="fw-medium text-gray-800">
                      {selectedClient.companyName || "-"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-muted small">GST Number:</span>
                    <div className="fw-medium text-gray-800">
                      {selectedClient.gstNumber || "-"}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="text-muted text-uppercase small mb-3">
                    Status
                  </h6>
                  <Badge
                    className="fs-6 px-3 py-2"
                    style={{
                      backgroundColor:
                        selectedClient.status === "Active"
                          ? "#10b981"
                          : "#ef4444",
                      fontSize: "0.8rem",
                    }}
                  >
                    {selectedClient.status}
                  </Badge>
                </div>
              </div>

              <div className="col-12">
                <hr className="my-3" />
                <h6 className="text-muted text-uppercase small mb-3">
                  Timestamps
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-2">
                      <span className="text-muted small">Created:</span>
                      <div className="fw-medium text-gray-800">
                        {new Date(selectedClient.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <span className="text-muted small">Updated:</span>
                      <div className="fw-medium text-gray-800">
                        {new Date(selectedClient.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
            className="rounded-pill px-4"
            style={{ border: "2px solid #9ca3af", color: "#4b5563" }}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => handleEditClient(selectedClient)}
            className="d-flex align-items-center rounded-pill px-4"
            style={{ backgroundColor: "#6366f1", border: "none" }}
          >
            <Edit size={16} className="me-2" />
            Edit Client
          </Button>
        </Modal.Footer>
      </Modal>
      <CreateClientModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={fetchClients}
      />

      <style>{`
        .ag-theme-alpine {
          --ag-header-background-color: #f8f9fa;
          --ag-header-foreground-color: #374151;
          --ag-border-color: #e5e7eb;
          --ag-row-hover-color: #f3f4f6;
          --ag-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          --ag-borders: none;
          --ag-border-radius: 12px;
          --ag-header-column-separator-display: none;
          --ag-row-border-style: solid;
          --ag-row-border-width: 1px;
          --ag-row-border-color: #f3f4f6;
        }

        .ag-header-cell {
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ag-cell {
          display: flex;
          align-items: center;
          font-size: 0.875rem;
          color: #374151;
          font-weight: 400;
        }
        
        .ag-row {
          border-bottom: 1px solid #f3f4f6;
        }
        
        .ag-row:hover {
          background-color: #f9fafb;
        }
        
        .ag-pinned-left-header {
          border-right: none;
        }
        
        .btn-sm {
          border-radius: 20px;
          font-weight: 500;
        }
        
        .card {
          border-radius: 16px;
          transition: all 0.2s ease;
        }
        
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .icon-btn {
          background: none;
          border: none;
          padding: 6px;
          margin: 0;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px;
        }

        .icon-btn:hover {
          color: #6366f1;
          background-color: #f3f4f6;
        }

        .icon-btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }
        
        .mb-6 {
          margin-bottom: 2rem !important;
        }
        
        .rounded-xl {
          border-radius: 16px !important;
        }
        
        .text-gray-800 {
          color: #1f2937;
        }
      `}</style>
    </div>
  );
};

export default ClientGrid;
