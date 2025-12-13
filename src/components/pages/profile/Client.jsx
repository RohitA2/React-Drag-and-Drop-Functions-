// import React, { useState, useMemo, useEffect, useCallback } from "react";
// import {
//   Button,
//   Badge,
//   Modal,
//   Form,
//   Alert,
//   Card,
//   InputGroup,
//   Table,
//   Pagination,
//   Dropdown,
// } from "react-bootstrap";
// import {
//   Eye,
//   Edit,
//   Trash2,
//   Search,
//   RefreshCw,
//   Plus,
//   User,
//   Building,
//   MoreVertical,
//   ChevronDown,
//   ChevronUp,
//   Filter,
// } from "lucide-react";
// import { useSelector } from "react-redux";
// import { selectedUserId } from "../../../store/authSlice";
// import CreateClientModal from "../../Forms/CreateClientModal";
// import Loader from "../../Forms/Loader";
// import { toast } from "react-toastify";

// const ClientGrid = () => {
//   const userId = useSelector(selectedUserId);
//   const [rowData, setRowData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filterText, setFilterText] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedClientToDelete, setSelectedClientToDelete] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [sortField, setSortField] = useState("id");
//   const [sortDirection, setSortDirection] = useState("desc");
//   const API_URL = import.meta.env.VITE_API_URL;

//   // Fetch clients data
//   const fetchClients = useCallback(async () => {
//     if (!userId) return;
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await fetch(
//         `${API_URL}/api/recipients?user_id=${userId}`
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("data from api", data);

//       if (data.success) {
//         setRowData(data.data || []);
//       } else {
//         throw new Error(data.message || "Failed to fetch clients");
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error("Error fetching clients:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [userId, API_URL]);

//   useEffect(() => {
//     fetchClients();
//   }, [fetchClients]);

//   // Handle sorting
//   const handleSort = (field) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//     } else {
//       setSortField(field);
//       setSortDirection("asc");
//     }
//   };

//   // Filter and sort data
//   const filteredData = useMemo(() => {
//     let data = [...rowData];

//     // Apply status filter
//     if (activeFilter !== "all") {
//       data = data.filter((client) => client.status === activeFilter);
//     }

//     // Apply search filter
//     if (filterText) {
//       data = data.filter(
//         (client) =>
//           client.name?.toLowerCase().includes(filterText.toLowerCase()) ||
//           client.email?.toLowerCase().includes(filterText.toLowerCase()) ||
//           client.phone?.includes(filterText) ||
//           client.companyName?.toLowerCase().includes(filterText.toLowerCase())
//       );
//     }

//     // Apply sorting
//     data.sort((a, b) => {
//       let aValue = a[sortField];
//       let bValue = b[sortField];

//       if (sortField === "createdAt") {
//         aValue = new Date(aValue).getTime();
//         bValue = new Date(bValue).getTime();
//       }

//       if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
//       if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
//       return 0;
//     });

//     return data;
//   }, [rowData, filterText, activeFilter, sortField, sortDirection]);

//   // Pagination
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const paginatedData = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return filteredData.slice(startIndex, startIndex + itemsPerPage);
//   }, [filteredData, currentPage, itemsPerPage]);

//   // Stats for the header
//   const stats = useMemo(() => {
//     const activeClients = rowData.filter(
//       (client) => client.status === "Active"
//     ).length;
//     const companyClients = rowData.filter(
//       (client) => client.type === "company"
//     ).length;
//     const individualClients = rowData.filter(
//       (client) => client.type === "individual"
//     ).length;

//     return { activeClients, companyClients, individualClients };
//   }, [rowData]);

//   // Handle view client details
//   const handleViewClient = (client) => {
//     setSelectedClient(client);
//     setShowModal(true);
//   };

//   // Handle edit client
//   const handleEditClient = (client) => {
//     setSelectedClient(client);
//     setShowEditModal(true);
//   };

//   // Handle delete client
//   const handleDeleteClient = async (client) => {
//     setSelectedClientToDelete(client);
//     setShowDeleteModal(true);
//   };

//   const confirmDelete = async () => {
//     if (selectedClientToDelete) {
//       try {
//         const response = await fetch(`${API_URL}/api/recipients/${selectedClientToDelete.id}`, {
//           method: "DELETE",
//         });

//         if (response.ok) {
//           setRowData((prev) => prev.filter((c) => c.id !== selectedClientToDelete.id));
//           toast.success("Client deleted successfully");
//         } else {
//           throw new Error("Failed to delete client");
//         }
//       } catch (err) {
//         setError(err.message);
//         console.error("Error deleting client:", err);
//       } finally {
//         setShowDeleteModal(false);
//         setSelectedClientToDelete(null);
//       }
//     }
//   };

//   // Handle update client
//   const handleUpdateClient = async (updatedClient) => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${API_URL}/api/recipients/${selectedClient.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedClient),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       if (data.success) {
//         setRowData((prev) =>
//           prev.map((client) =>
//             client.id === selectedClient.id ? data.data : client
//           )
//         );
//         setShowEditModal(false);
//        toast.success("Client updated successfully");
//       } else {
//         throw new Error(data.message || "Failed to update client");
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error("Error updating client:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle refresh
//   const handleRefresh = () => {
//     fetchClients();
//     setCurrentPage(1);
//   };

//   // Sort indicator component
//   const SortIndicator = ({ field }) => {
//     if (sortField !== field)
//       return <ChevronDown size={14} className="opacity-30" />;
//     return sortDirection === "asc" ? (
//       <ChevronUp size={14} />
//     ) : (
//       <ChevronDown size={14} />
//     );
//   };

//   // Loading state
//   if (loading) {
//     return <Loader />;
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="container-fluid p-4">
//         <Alert
//           variant="danger"
//           className="border-0 rounded-xl shadow-sm"
//           style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
//         >
//           <Alert.Heading className="d-flex align-items-center">
//             <i className="bi bi-exclamation-triangle-fill me-2"></i>
//             Error Loading Clients
//           </Alert.Heading>
//           <p>{error}</p>
//           <Button
//             variant="outline-danger"
//             onClick={fetchClients}
//             className="rounded-pill px-4"
//           >
//             Try Again
//           </Button>
//         </Alert>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="container-fluid p-4"
//       style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}
//     >
//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <div>
//           <h2 className="fw-bold mb-1 text-gray-800">Client Management</h2>
//           <p className="text-muted mb-0">
//             Manage your clients and their information
//           </p>
//         </div>

//         <div className="d-flex gap-3">
//           <Button
//             variant="primary"
//             className="d-flex align-items-center rounded-pill px-4"
//             onClick={() => setShowCreateModal(true)}
//             style={{
//               backgroundColor: "#6366f1",
//               border: "none",
//               fontWeight: 500,
//             }}
//           >
//             <Plus size={18} className="me-2" />
//             Add Client
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="row mb-4">
//         <div className="col-md-3">
//           <Card
//             className="border-0 rounded-xl shadow-sm hover-lift"
//             style={{ backgroundColor: "#eff6ff" }}
//           >
//             <Card.Body className="p-4">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <h6 className="card-title text-muted mb-1">Total Clients</h6>
//                   <h4 className="fw-bold mb-0 text-gray-800">
//                     {rowData.length}
//                   </h4>
//                 </div>
//                 <div
//                   className="bg-primary p-3 rounded-circle d-flex align-items-center justify-content-center"
//                   style={{ backgroundColor: "#6366f1" }}
//                 >
//                   <User size={24} className="text-white" />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </div>
//         <div className="col-md-3">
//           <Card
//             className="border-0 rounded-xl shadow-sm hover-lift"
//             style={{ backgroundColor: "#ecfdf5" }}
//           >
//             <Card.Body className="p-4">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <h6 className="card-title text-muted mb-1">Active</h6>
//                   <h4 className="fw-bold mb-0 text-gray-800">
//                     {stats.activeClients}
//                   </h4>
//                 </div>
//                 <div
//                   className="bg-success p-3 rounded-circle d-flex align-items-center justify-content-center"
//                   style={{ backgroundColor: "#10b981" }}
//                 >
//                   <Eye size={24} className="text-white" />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </div>
//         <div className="col-md-3">
//           <Card
//             className="border-0 rounded-xl shadow-sm hover-lift"
//             style={{ backgroundColor: "#eff6ff" }}
//           >
//             <Card.Body className="p-4">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <h6 className="card-title text-muted mb-1">Companies</h6>
//                   <h4 className="fw-bold mb-0 text-gray-800">
//                     {stats.companyClients}
//                   </h4>
//                 </div>
//                 <div
//                   className="bg-info p-3 rounded-circle d-flex align-items-center justify-content-center"
//                   style={{ backgroundColor: "#0ea5e9" }}
//                 >
//                   <Building size={24} className="text-white" />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </div>
//         <div className="col-md-3">
//           <Card
//             className="border-0 rounded-xl shadow-sm hover-lift"
//             style={{ backgroundColor: "#fef3c7" }}
//           >
//             <Card.Body className="p-4">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <h6 className="card-title text-muted mb-1">Individuals</h6>
//                   <h4 className="fw-bold mb-0 text-gray-800">
//                     {stats.individualClients}
//                   </h4>
//                 </div>
//                 <div
//                   className="bg-warning p-3 rounded-circle d-flex align-items-center justify-content-center"
//                   style={{ backgroundColor: "#f59e0b" }}
//                 >
//                   <User size={24} className="text-white" />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </div>
//       </div>

//       {/* Filters and Search */}
//       <Card className="border-0 rounded-xl shadow-sm mb-4">
//         <Card.Body className="p-4">
//           <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
//             <div className="d-flex gap-2 align-items-center flex-wrap">
//               <span className="text-muted me-2 fw-medium">Filter by:</span>
//               <Button
//                 variant={activeFilter === "all" ? "primary" : "outline-primary"}
//                 size="sm"
//                 onClick={() => setActiveFilter("all")}
//                 className="rounded-pill px-3"
//                 style={
//                   activeFilter === "all"
//                     ? { backgroundColor: "#6366f1", border: "none" }
//                     : { border: "2px solid #6366f1", color: "#6366f1" }
//                 }
//               >
//                 All
//               </Button>
//               <Button
//                 variant={
//                   activeFilter === "Active" ? "success" : "outline-success"
//                 }
//                 size="sm"
//                 onClick={() => setActiveFilter("Active")}
//                 className="rounded-pill px-3"
//                 style={
//                   activeFilter === "Active"
//                     ? { backgroundColor: "#10b981", border: "none" }
//                     : { border: "2px solid #10b981", color: "#10b981" }
//                 }
//               >
//                 Active
//               </Button>
//               <Button
//                 variant={
//                   activeFilter === "Inactive" ? "danger" : "outline-danger"
//                 }
//                 size="sm"
//                 onClick={() => setActiveFilter("Inactive")}
//                 className="rounded-pill px-3"
//                 style={
//                   activeFilter === "Inactive"
//                     ? { backgroundColor: "#ef4444", border: "none" }
//                     : { border: "2px solid #ef4444", color: "#ef4444" }
//                 }
//               >
//                 Inactive
//               </Button>
//             </div>

//             <div className="d-flex gap-2 align-items-center flex-wrap">
//               <InputGroup style={{ width: "300px" }} className="rounded-pill">
//                 <InputGroup.Text className="bg-light border-end-0 rounded-start-pill">
//                   <Search size={18} className="text-muted" />
//                 </InputGroup.Text>
//                 <Form.Control
//                   type="text"
//                   placeholder="Search clients..."
//                   value={filterText}
//                   onChange={(e) => setFilterText(e.target.value)}
//                   className="border-start-0 rounded-end-pill"
//                   style={{ boxShadow: "none" }}
//                 />
//               </InputGroup>

//               <Button
//                 variant="outline-secondary"
//                 size="sm"
//                 onClick={handleRefresh}
//                 className="d-flex align-items-center rounded-pill px-3"
//                 style={{ border: "2px solid #9ca3af", color: "#4b5563" }}
//               >
//                 <RefreshCw size={16} className="me-1" />
//                 Refresh
//               </Button>
//             </div>
//           </div>
//         </Card.Body>
//       </Card>

//       {/* Results count and pagination controls */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <p className="text-muted mb-0 fw-medium">
//           Showing{" "}
//           <strong className="text-gray-800">
//             {paginatedData.length > 0
//               ? (currentPage - 1) * itemsPerPage + 1
//               : 0}
//           </strong>{" "}
//           to{" "}
//           <strong className="text-gray-800">
//             {(currentPage - 1) * itemsPerPage + paginatedData.length}
//           </strong>{" "}
//           of <strong className="text-gray-800">{filteredData.length}</strong>{" "}
//           clients
//         </p>

//         <div className="d-flex align-items-center gap-3">
//           <span className="text-muted small">Show:</span>
//           <Dropdown>
//             <Dropdown.Toggle
//               variant="outline-secondary"
//               size="sm"
//               className="d-flex align-items-center rounded-pill px-3"
//               style={{ border: "2px solid #e5e7eb" }}
//             >
//               {itemsPerPage} per page
//             </Dropdown.Toggle>
//             <Dropdown.Menu className="rounded-xl shadow-sm border-0">
//               {[5, 10, 20, 50].map((size) => (
//                 <Dropdown.Item
//                   key={size}
//                   onClick={() => {
//                     setItemsPerPage(size);
//                     setCurrentPage(1);
//                   }}
//                   className="py-2"
//                 >
//                   {size} per page
//                 </Dropdown.Item>
//               ))}
//             </Dropdown.Menu>
//           </Dropdown>
//         </div>
//       </div>

//       {/* Empty state */}
//       {rowData.length === 0 ? (
//         <Card className="border-0 rounded-xl shadow-sm">
//           <Card.Body className="text-center py-5">
//             <div className="mb-3">
//               <Search size={48} className="text-muted opacity-50" />
//             </div>
//             <h5 className="text-gray-800">No clients found</h5>
//             <p className="text-muted">
//               There are no clients in the system yet.
//             </p>
//             <Button
//               variant="primary"
//               onClick={() => setShowCreateModal(true)}
//               className="d-flex align-items-center mx-auto rounded-pill px-4"
//               style={{ backgroundColor: "#6366f1", border: "none" }}
//             >
//               <Plus size={16} className="me-2" />
//               Add First Client
//             </Button>
//           </Card.Body>
//         </Card>
//       ) : filteredData.length === 0 ? (
//         <Card className="border-0 rounded-xl shadow-sm">
//           <Card.Body className="text-center py-5">
//             <div className="mb-3">
//               <Filter size={48} className="text-muted opacity-50" />
//             </div>
//             <h5 className="text-gray-800">No matching clients</h5>
//             <p className="text-muted">
//               Try adjusting your search or filter criteria.
//             </p>
//             <Button
//               variant="outline-secondary"
//               onClick={() => {
//                 setFilterText("");
//                 setActiveFilter("all");
//               }}
//               className="rounded-pill px-4"
//               style={{ border: "2px solid #9ca3af", color: "#4b5563" }}
//             >
//               Clear Filters
//             </Button>
//           </Card.Body>
//         </Card>
//       ) : (
//         /* Modern DataTable */
//         <Card className="border-0 rounded-xl shadow-sm overflow-hidden">
//           <div className="table-responsive">
//             <Table hover className="mb-0">
//               <thead style={{ backgroundColor: "#f8f9fa" }}>
//                 <tr>
//                   <th
//                     className="cursor-pointer py-3 px-4 border-0 fw-semibold text-uppercase small text-muted"
//                     onClick={() => handleSort("id")}
//                     style={{ width: "80px" }}
//                   >
//                     <div className="d-flex align-items-center gap-1">
//                       ID
//                       <SortIndicator field="id" />
//                     </div>
//                   </th>
//                   <th
//                     className="cursor-pointer py-3 px-4 border-0 fw-semibold text-uppercase small text-muted"
//                     onClick={() => handleSort("type")}
//                     style={{ width: "120px" }}
//                   >
//                     <div className="d-flex align-items-center gap-1">
//                       Type
//                       <SortIndicator field="type" />
//                     </div>
//                   </th>
//                   <th
//                     className="cursor-pointer py-3 px-4 border-0 fw-semibold text-uppercase small text-muted"
//                     onClick={() => handleSort("name")}
//                   >
//                     <div className="d-flex align-items-center gap-1">
//                       Name
//                       <SortIndicator field="name" />
//                     </div>
//                   </th>
//                   <th
//                     className="cursor-pointer py-3 px-4 border-0 fw-semibold text-uppercase small text-muted"
//                     onClick={() => handleSort("email")}
//                   >
//                     <div className="d-flex align-items-center gap-1">
//                       Email
//                       <SortIndicator field="email" />
//                     </div>
//                   </th>
//                   <th
//                     className="py-3 px-4 border-0 fw-semibold text-uppercase small text-muted"
//                     style={{ width: "150px" }}
//                   >
//                     Phone
//                   </th>
//                   <th
//                     className="cursor-pointer py-3 px-4 border-0 fw-semibold text-uppercase small text-muted"
//                     onClick={() => handleSort("companyName")}
//                   >
//                     <div className="d-flex align-items-center gap-1">
//                       Company
//                       <SortIndicator field="companyName" />
//                     </div>
//                   </th>
//                   <th
//                     className="cursor-pointer py-3 px-4 border-0 fw-semibold text-uppercase small text-muted"
//                     onClick={() => handleSort("status")}
//                     style={{ width: "120px" }}
//                   >
//                     <div className="d-flex align-items-center gap-1">
//                       Status
//                       <SortIndicator field="status" />
//                     </div>
//                   </th>
//                   <th
//                     className="cursor-pointer py-3 px-4 border-0 fw-semibold text-uppercase small text-muted"
//                     onClick={() => handleSort("createdAt")}
//                     style={{ width: "150px" }}
//                   >
//                     <div className="d-flex align-items-center gap-1">
//                       Created
//                       <SortIndicator field="createdAt" />
//                     </div>
//                   </th>
//                   <th
//                     className="py-3 px-4 border-0 fw-semibold text-uppercase small text-muted text-center"
//                     style={{ width: "100px" }}
//                   >
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedData.map((client) => (
//                   <tr key={client.id} className="align-middle">
//                     <td className="py-3 px-4 border-0 font-monospace">
//                       {client.id}
//                     </td>
//                     <td className="py-3 px-4 border-0">
//                       <Badge
//                         bg={client.type === "company" ? "primary" : "secondary"}
//                         className="text-uppercase d-flex align-items-center justify-content-center px-2 py-1"
//                         style={{
//                           width: "90px",
//                           fontSize: "0.75rem",
//                           backgroundColor:
//                             client.type === "company" ? "#6366f1" : "#8b5cf6",
//                         }}
//                       >
//                         {client.type === "company" ? (
//                           <Building size={10} className="me-1" />
//                         ) : (
//                           <User size={10} className="me-1" />
//                         )}
//                         {client.type}
//                       </Badge>
//                     </td>
//                     <td className="py-3 px-4 border-0 fw-medium text-gray-800">
//                       {client.name}
//                     </td>
//                     <td className="py-3 px-4 border-0">{client.email}</td>
//                     <td className="py-3 px-4 border-0">{client.phone}</td>
//                     <td className="py-3 px-4 border-0">
//                       {client.companyName || "-"}
//                     </td>
//                     <td className="py-3 px-4 border-0">
//                       <Badge
//                         className="text-uppercase d-flex align-items-center justify-content-center px-2 py-1"
//                         style={{
//                           width: "80px",
//                           fontSize: "0.75rem",
//                           backgroundColor:
//                             client.status === "Active" ? "#10b981" : "#ef4444",
//                         }}
//                       >
//                         {client.status}
//                       </Badge>
//                     </td>
//                     <td className="py-3 px-4 border-0 text-muted small">
//                       {new Date(client.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="py-3 px-4 border-0 text-center">
//                       <Dropdown>
//                         <Dropdown.Toggle
//                           variant="outline-light"
//                           size="sm"
//                           className="border-0 bg-transparent p-1"
//                           id={`dropdown-${client.id}`}
//                         >
//                           <MoreVertical size={16} className="text-muted" />
//                         </Dropdown.Toggle>
//                         <Dropdown.Menu className="rounded-xl shadow-sm border-0">
//                           <Dropdown.Item
//                             onClick={() => handleViewClient(client)}
//                             className="d-flex align-items-center gap-2 py-2"
//                           >
//                             <Eye size={16} />
//                             View Details
//                           </Dropdown.Item>
//                           <Dropdown.Item
//                             onClick={() => handleEditClient(client)}
//                             className="d-flex align-items-center gap-2 py-2"
//                           >
//                             <Edit size={16} />
//                             Edit
//                           </Dropdown.Item>
//                           <Dropdown.Divider />
//                           <Dropdown.Item
//                             onClick={() => handleDeleteClient(client)}
//                             className="d-flex align-items-center gap-2 py-2 text-danger"
//                           >
//                             <Trash2 size={16} />
//                             Delete
//                           </Dropdown.Item>
//                         </Dropdown.Menu>
//                       </Dropdown>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <Card.Footer className="border-0 bg-transparent">
//               <div className="d-flex justify-content-between align-items-center">
//                 <span className="text-muted small">
//                   Page {currentPage} of {totalPages}
//                 </span>
//                 <Pagination className="mb-0">
//                   <Pagination.Prev
//                     disabled={currentPage === 1}
//                     onClick={() => setCurrentPage(currentPage - 1)}
//                     className="rounded-pill mx-1"
//                   >
//                     Previous
//                   </Pagination.Prev>

//                   {[...Array(totalPages)].map((_, index) => {
//                     const page = index + 1;
//                     if (
//                       page === 1 ||
//                       page === totalPages ||
//                       (page >= currentPage - 1 && page <= currentPage + 1)
//                     ) {
//                       return (
//                         <Pagination.Item
//                           key={page}
//                           active={page === currentPage}
//                           onClick={() => setCurrentPage(page)}
//                           className="rounded-circle mx-1"
//                           style={{
//                             width: "40px",
//                             height: "40px",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           {page}
//                         </Pagination.Item>
//                       );
//                     } else if (
//                       page === currentPage - 2 ||
//                       page === currentPage + 2
//                     ) {
//                       return (
//                         <Pagination.Ellipsis key={page} className="mx-1" />
//                       );
//                     }
//                     return null;
//                   })}

//                   <Pagination.Next
//                     disabled={currentPage === totalPages}
//                     onClick={() => setCurrentPage(currentPage + 1)}
//                     className="rounded-pill mx-1"
//                   >
//                     Next
//                   </Pagination.Next>
//                 </Pagination>
//               </div>
//             </Card.Footer>
//           )}
//         </Card>
//       )}

//       {/* Client Details Modal */}
//       <Modal
//         show={showModal}
//         onHide={() => setShowModal(false)}
//         size="lg"
//         centered
//         contentClassName="rounded-xl"
//       >
//         <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
//           <Modal.Title className="fw-bold text-gray-800">
//             Client Details
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="pt-0 px-4 pb-4">
//           {selectedClient && (
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="mb-4">
//                   <h6 className="text-muted text-uppercase small mb-3">
//                     Basic Information
//                   </h6>
//                   <div className="d-flex align-items-center mb-3">
//                     <div className="me-3">
//                       <div
//                         className="bg-primary bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center"
//                         style={{ width: "60px", height: "60px" }}
//                       >
//                         {selectedClient.type === "company" ? (
//                           <Building size={24} className="text-primary" />
//                         ) : (
//                           <User size={24} className="text-primary" />
//                         )}
//                       </div>
//                     </div>
//                     <div>
//                       <h5 className="fw-bold mb-0 text-gray-800">
//                         {selectedClient.name}
//                       </h5>
//                       <Badge
//                         className="text-uppercase px-2 py-1 mt-1"
//                         style={{
//                           backgroundColor:
//                             selectedClient.type === "company"
//                               ? "#6366f1"
//                               : "#8b5cf6",
//                           fontSize: "0.7rem",
//                         }}
//                       >
//                         {selectedClient.type}
//                       </Badge>
//                     </div>
//                   </div>

//                   <div className="ms-5 ps-2">
//                     <div className="mb-3">
//                       <span className="text-muted small">Email:</span>
//                       <div className="fw-medium text-gray-800">
//                         {selectedClient.email}
//                       </div>
//                     </div>
//                     <div className="mb-3">
//                       <span className="text-muted small">Phone:</span>
//                       <div className="fw-medium text-gray-800">
//                         {selectedClient.phone || "-"}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="col-md-6">
//                 <div className="mb-4">
//                   <h6 className="text-muted text-uppercase small mb-3">
//                     Company Information
//                   </h6>
//                   <div className="mb-3">
//                     <span className="text-muted small">Company Name:</span>
//                     <div className="fw-medium text-gray-800">
//                       {selectedClient.companyName || "-"}
//                     </div>
//                   </div>
//                   <div className="mb-3">
//                     <span className="text-muted small">GST Number:</span>
//                     <div className="fw-medium text-gray-800">
//                       {selectedClient.gstNumber || "-"}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mb-4">
//                   <h6 className="text-muted text-uppercase small mb-3">
//                     Status
//                   </h6>
//                   <Badge
//                     className="fs-6 px-3 py-2"
//                     style={{
//                       backgroundColor:
//                         selectedClient.status === "Active"
//                           ? "#10b981"
//                           : "#ef4444",
//                       fontSize: "0.8rem",
//                     }}
//                   >
//                     {selectedClient.status}
//                   </Badge>
//                 </div>
//               </div>

//               <div className="col-12">
//                 <hr className="my-3" />
//                 <h6 className="text-muted text-uppercase small mb-3">
//                   Timestamps
//                 </h6>
//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="mb-2">
//                       <span className="text-muted small">Created:</span>
//                       <div className="fw-medium text-gray-800">
//                         {new Date(selectedClient.createdAt).toLocaleString()}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="mb-2">
//                       <span className="text-muted small">Updated:</span>
//                       <div className="fw-medium text-gray-800">
//                         {new Date(selectedClient.updatedAt).toLocaleString()}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer className="border-0 px-4 pb-4">
//           <Button
//             variant="outline-secondary"
//             onClick={() => setShowModal(false)}
//             className="rounded-pill px-4"
//             style={{ border: "2px solid #9ca3af", color: "#4b5563" }}
//           >
//             Close
//           </Button>
//           <Button
//             variant="primary"
//             onClick={() => handleEditClient(selectedClient)}
//             className="d-flex align-items-center rounded-pill px-4"
//             style={{ backgroundColor: "#6366f1", border: "none" }}
//           >
//             <Edit size={16} className="me-2" />
//             Edit Client
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Create Client Modal */}
//       <CreateClientModal
//         show={showCreateModal}
//         onHide={() => setShowCreateModal(false)}
//         onSuccess={fetchClients}
//         mode="create"
//       />

//       {/* Edit Client Modal */}
//       <CreateClientModal
//         show={showEditModal}
//         onHide={() => setShowEditModal(false)}
//         onSuccess={fetchClients}
//         mode="edit"
//         client={selectedClient}
//         onUpdate={handleUpdateClient}
//       />

//       {/* Delete Confirm Modal */}
//       <Modal
//         show={showDeleteModal}
//         onHide={() => setShowDeleteModal(false)}
//         centered
//         contentClassName="rounded-xl"
//       >
//         <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
//           <Modal.Title className="fw-bold text-gray-800">
//             Confirm Deletion
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="pt-0 px-4 pb-4">
//           <p className="text-muted">
//             Are you sure you want to delete <strong>{selectedClientToDelete?.name}</strong>?
//             This action cannot be undone.
//           </p>
//         </Modal.Body>
//         <Modal.Footer className="border-0 px-4 pb-4">
//           <Button
//             variant="outline-secondary"
//             onClick={() => setShowDeleteModal(false)}
//             className="rounded-pill px-4"
//             style={{ border: "2px solid #9ca3af", color: "#4b5563" }}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="danger"
//             onClick={confirmDelete}
//             className="rounded-pill px-4"
//             style={{ backgroundColor: "#ef4444", border: "none" }}
//           >
//             Delete
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       <style>{`
//         .hover-lift {
//           transition: all 0.2s ease;
//           box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.1);
//           opacity: 1;
//         }
        
//         .hover-lift:hover {
//           transform: translateY(-4px);
//           box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
//         }
        
//         .cursor-pointer {
//           cursor: pointer;
//         }
        
//         .table tbody tr {
//           transition: all 0.2s ease;
//           border-bottom: 1px solid #f3f4f6;
//         }
        
//         .table tbody tr:hover {
//           background-color: #f9fafb;
//         }
        
//         .table th {
//           border-bottom: 2px solid #e5e7eb;
//           font-weight: 600;
//           font-size: 0.75rem;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//         }
        
//         .table td {
//           border-bottom: 1px solid #f3f4f6;
//           vertical-align: middle;
//           font-size: 0.875rem;
//           color: #374151;
//         }
        
//         .btn-sm {
//           border-radius: 20px;
//           font-weight: 500;
//         }
        
//         .card {
//           border-radius: 16px;
//         }
        
//         .mb-6 {
//           margin-bottom: 2rem !important;
//         }
        
//         .rounded-xl {
//           border-radius: 16px !important;
//         }
        
//         .text-gray-800 {
//           color: #1f2937;
//         }
        
//         .pagination .page-item .page-link {
//           border: none;
//           border-radius: 50%;
//           margin: 0 2px;
//           color: #6b7280;
//         }
        
//         .pagination .page-item.active .page-link {
//           background-color: #6366f1;
//           color: white;
//         }
        
//         .pagination .page-item:not(.active) .page-link:hover {
//           background-color: #f3f4f6;
//           color: #374151;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ClientGrid;


import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Button,
  Badge,
  Modal,
  Form,
  Alert,
  Card,
  InputGroup,
  Table,
  Pagination,
  Dropdown,
} from "react-bootstrap";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Plus,
  User,
  Building,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectedUserId } from "../../../store/authSlice";
import CreateClientModal from "../../Forms/CreateClientModal";
import Loader from "../../Forms/Loader";
import { toast } from "react-toastify";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClientToDelete, setSelectedClientToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
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

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [...rowData];

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

    // Apply sorting
    data.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [rowData, filterText, activeFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

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

  // Handle view client details
  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  // Handle edit client
  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  // Handle delete client
  const handleDeleteClient = async (client) => {
    setSelectedClientToDelete(client);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedClientToDelete) {
      try {
        const response = await fetch(`${API_URL}/api/recipients/${selectedClientToDelete.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setRowData((prev) => prev.filter((c) => c.id !== selectedClientToDelete.id));
          toast.success("Client deleted successfully");
        } else {
          throw new Error("Failed to delete client");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error deleting client:", err);
      } finally {
        setShowDeleteModal(false);
        setSelectedClientToDelete(null);
      }
    }
  };

  // Handle update client
  const handleUpdateClient = async (updatedClient) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/recipients/${selectedClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedClient),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setRowData((prev) =>
          prev.map((client) =>
            client.id === selectedClient.id ? data.data : client
          )
        );
        setShowEditModal(false);
       toast.success("Client updated successfully");
      } else {
        throw new Error(data.message || "Failed to update client");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error updating client:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchClients();
    setCurrentPage(1);
  };

  // Sort indicator component
  const SortIndicator = ({ field }) => {
    if (sortField !== field)
      return <ChevronDown size={14} className="opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  // Loading state
  if (loading) {
    return <Loader />;
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
      style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-gray-900">Client Management</h2>
          <p className="text-gray-600 mb-0">
            Manage your clients and their information
          </p>
        </div>

        <div className="d-flex gap-3">
          <Button
            variant="primary"
            className="d-flex align-items-center rounded-xl px-4 py-2 shadow-sm"
            onClick={() => setShowCreateModal(true)}
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none",
              fontWeight: 500,
              boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.4)",
            }}
          >
            <Plus size={18} className="me-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card
            className="border-0 rounded-xl shadow-lg hover-lift"
            style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-gray-600 mb-1">Total Clients</h6>
                  <h4 className="fw-bold mb-0 text-gray-900">
                    {rowData.length}
                  </h4>
                </div>
                <div
                  className="bg-primary p-3 rounded-xl d-flex align-items-center justify-content-center"
                  style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.4)" }}
                >
                  <User size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card
            className="border-0 rounded-xl shadow-lg hover-lift"
            style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)" }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-gray-600 mb-1">Active</h6>
                  <h4 className="fw-bold mb-0 text-gray-900">
                    {stats.activeClients}
                  </h4>
                </div>
                <div
                  className="bg-success p-3 rounded-xl d-flex align-items-center justify-content-center"
                  style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.4)" }}
                >
                  <Eye size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card
            className="border-0 rounded-xl shadow-lg hover-lift"
            style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-gray-600 mb-1">Companies</h6>
                  <h4 className="fw-bold mb-0 text-gray-900">
                    {stats.companyClients}
                  </h4>
                </div>
                <div
                  className="bg-info p-3 rounded-xl d-flex align-items-center justify-content-center"
                  style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", boxShadow: "0 4px 14px 0 rgba(14, 165, 233, 0.4)" }}
                >
                  <Building size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card
            className="border-0 rounded-xl shadow-lg hover-lift"
            style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)" }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-gray-600 mb-1">Individuals</h6>
                  <h4 className="fw-bold mb-0 text-gray-900">
                    {stats.individualClients}
                  </h4>
                </div>
                <div
                  className="bg-warning p-3 rounded-xl d-flex align-items-center justify-content-center"
                  style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 4px 14px 0 rgba(245, 158, 11, 0.4)" }}
                >
                  <User size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 rounded-xl shadow-lg mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <span className="text-gray-600 me-2 fw-medium">Filter by:</span>
              <Button
                variant={activeFilter === "all" ? "primary" : "outline-primary"}
                size="sm"
                onClick={() => setActiveFilter("all")}
                className="rounded-xl px-3 py-1 shadow-sm"
                style={
                  activeFilter === "all"
                    ? { background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", border: "none", boxShadow: "0 2px 8px 0 rgba(99, 102, 241, 0.3)" }
                    : { border: "2px solid #6366f1", color: "#6366f1", boxShadow: "0 2px 4px 0 rgba(99, 102, 241, 0.1)" }
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
                className="rounded-xl px-3 py-1 shadow-sm"
                style={
                  activeFilter === "Active"
                    ? { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none", boxShadow: "0 2px 8px 0 rgba(16, 185, 129, 0.3)" }
                    : { border: "2px solid #10b981", color: "#10b981", boxShadow: "0 2px 4px 0 rgba(16, 185, 129, 0.1)" }
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
                className="rounded-xl px-3 py-1 shadow-sm"
                style={
                  activeFilter === "Inactive"
                    ? { background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", border: "none", boxShadow: "0 2px 8px 0 rgba(239, 68, 68, 0.3)" }
                    : { border: "2px solid #ef4444", color: "#ef4444", boxShadow: "0 2px 4px 0 rgba(239, 68, 68, 0.1)" }
                }
              >
                Inactive
              </Button>
            </div>

            <div className="d-flex gap-2 align-items-center flex-wrap">
              <InputGroup style={{ width: "300px" }} className="rounded-xl shadow-sm">
                <InputGroup.Text className="bg-white border-end-0 rounded-start-xl">
                  <Search size={18} className="text-gray-500" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search clients..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="border-start-0 rounded-end-xl"
                  style={{ boxShadow: "none", borderColor: "#e5e7eb" }}
                />
              </InputGroup>

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleRefresh}
                className="d-flex align-items-center rounded-xl px-3 py-1 shadow-sm"
                style={{ border: "2px solid #d1d5db", color: "#6b7280", boxShadow: "0 2px 4px 0 rgba(156, 163, 175, 0.2)" }}
              >
                <RefreshCw size={16} className="me-1" />
                Refresh
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Results count and pagination controls */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="text-gray-600 mb-0 fw-medium">
          Showing{" "}
          <strong className="text-gray-900">
            {paginatedData.length > 0
              ? (currentPage - 1) * itemsPerPage + 1
              : 0}
          </strong>{" "}
          to{" "}
          <strong className="text-gray-900">
            {(currentPage - 1) * itemsPerPage + paginatedData.length}
          </strong>{" "}
          of <strong className="text-gray-900">{filteredData.length}</strong>{" "}
          clients
        </p>

        <div className="d-flex align-items-center gap-3">
          <span className="text-gray-600 small">Show:</span>
          <Dropdown>
            <Dropdown.Toggle
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center rounded-xl px-3 py-1 shadow-sm"
              style={{ border: "2px solid #e5e7eb", boxShadow: "0 2px 4px 0 rgba(209, 213, 219, 0.3)" }}
            >
              {itemsPerPage} per page
            </Dropdown.Toggle>
            <Dropdown.Menu className="rounded-xl shadow-lg border-0 mt-1">
              {[5, 10, 20, 50].map((size) => (
                <Dropdown.Item
                  key={size}
                  onClick={() => {
                    setItemsPerPage(size);
                    setCurrentPage(1);
                  }}
                  className="py-2 rounded-lg"
                  style={{ fontSize: "0.875rem" }}
                >
                  {size} per page
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Empty state */}
      {rowData.length === 0 ? (
        <Card className="border-0 rounded-xl shadow-lg">
          <Card.Body className="text-center py-5">
            <div className="mb-3">
              <Search size={48} className="text-gray-400 opacity-50" />
            </div>
            <h5 className="text-gray-900">No clients found</h5>
            <p className="text-gray-600">
              There are no clients in the system yet.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="d-flex align-items-center mx-auto rounded-xl px-4 py-2 shadow-sm"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", border: "none", boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.4)" }}
            >
              <Plus size={16} className="me-2" />
              Add First Client
            </Button>
          </Card.Body>
        </Card>
      ) : filteredData.length === 0 ? (
        <Card className="border-0 rounded-xl shadow-lg">
          <Card.Body className="text-center py-5">
            <div className="mb-3">
              <Filter size={48} className="text-gray-400 opacity-50" />
            </div>
            <h5 className="text-gray-900">No matching clients</h5>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria.
            </p>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setFilterText("");
                setActiveFilter("all");
              }}
              className="rounded-xl px-4 py-2"
              style={{ border: "2px solid #d1d5db", color: "#6b7280", boxShadow: "0 2px 4px 0 rgba(209, 213, 219, 0.3)" }}
            >
              Clear Filters
            </Button>
          </Card.Body>
        </Card>
      ) : (
        /* Modern DataTable */
        <Card className="border-0 rounded-xl shadow-lg overflow-hidden">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}>
                <tr>
                  <th
                    className="cursor-pointer py-4 px-4 border-0 fw-semibold text-uppercase small text-gray-600"
                    onClick={() => handleSort("id")}
                    style={{ width: "80px" }}
                  >
                    <div className="d-flex align-items-center gap-1">
                      ID
                      <SortIndicator field="id" />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer py-4 px-4 border-0 fw-semibold text-uppercase small text-gray-600"
                    onClick={() => handleSort("type")}
                    style={{ width: "120px" }}
                  >
                    <div className="d-flex align-items-center gap-1">
                      Type
                      <SortIndicator field="type" />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer py-4 px-4 border-0 fw-semibold text-uppercase small text-gray-600"
                    onClick={() => handleSort("name")}
                  >
                    <div className="d-flex align-items-center gap-1">
                      Name
                      <SortIndicator field="name" />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer py-4 px-4 border-0 fw-semibold text-uppercase small text-gray-600"
                    onClick={() => handleSort("email")}
                  >
                    <div className="d-flex align-items-center gap-1">
                      Email
                      <SortIndicator field="email" />
                    </div>
                  </th>
                  <th
                    className="py-4 px-4 border-0 fw-semibold text-uppercase small text-gray-600"
                    style={{ width: "150px" }}
                  >
                    Phone
                  </th>
                  <th
                    className="cursor-pointer py-4 px-4 border-0 fw-semibold text-uppercase small text-gray-600"
                    onClick={() => handleSort("companyName")}
                  >
                    <div className="d-flex align-items-center gap-1">
                      Company
                      <SortIndicator field="companyName" />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer py-4 px-4 border-0 fw-semibold text-uppercase small text-gray-600"
                    onClick={() => handleSort("status")}
                    style={{ width: "120px" }}
                  >
                    <div className="d-flex align-items-center gap-1">
                      Status
                      <SortIndicator field="status" />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer py-4 px-4 border-0 fw-semibold text-uppercase small text-gray-600"
                    onClick={() => handleSort("createdAt")}
                    style={{ width: "150px" }}
                  >
                    <div className="d-flex align-items-center gap-1">
                      Created
                      <SortIndicator field="createdAt" />
                    </div>
                  </th>
                  <th
                    className="py-4 px-4 border-0 fw-semibold text-uppercase small text-gray-600 text-center"
                    style={{ width: "100px" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((client) => (
                  <tr key={client.id} className="align-middle">
                    <td className="py-4 px-4 border-0 font-monospace text-gray-900">
                      {client.id}
                    </td>
                    <td className="py-4 px-4 border-0">
                      <Badge
                        bg={client.type === "company" ? "primary" : "secondary"}
                        className="text-uppercase d-flex align-items-center justify-content-center px-3 py-2 rounded-xl"
                        style={{
                          width: "90px",
                          fontSize: "0.75rem",
                          background: client.type === "company" 
                            ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" 
                            : "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                          boxShadow: "0 2px 8px 0 rgba(99, 102, 241, 0.3)",
                        }}
                      >
                        {client.type === "company" ? (
                          <Building size={12} className="me-1" />
                        ) : (
                          <User size={12} className="me-1" />
                        )}
                        {client.type}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 border-0 fw-semibold text-gray-900">
                      {client.name}
                    </td>
                    <td className="py-4 px-4 border-0 text-gray-700">{client.email}</td>
                    <td className="py-4 px-4 border-0 text-gray-700">{client.phone}</td>
                    <td className="py-4 px-4 border-0 text-gray-700">
                      {client.companyName || "-"}
                    </td>
                    <td className="py-4 px-4 border-0">
                      <Badge
                        className="text-uppercase d-flex align-items-center justify-content-center px-3 py-2 rounded-xl"
                        style={{
                          width: "80px",
                          fontSize: "0.75rem",
                          background: client.status === "Active" 
                            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                            : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                          boxShadow: client.status === "Active" 
                            ? "0 2px 8px 0 rgba(16, 185, 129, 0.3)" 
                            : "0 2px 8px 0 rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        {client.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 border-0 text-gray-500 small">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 border-0 text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={() => handleViewClient(client)}
                          className="p-2 border-0 bg-transparent rounded-xl shadow-sm hover-shadow-md"
                          style={{ 
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 4px 0 rgba(59, 130, 246, 0.2)",
                          }}
                          title="View Details"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </Button>
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={() => handleEditClient(client)}
                          className="p-2 border-0 bg-transparent rounded-xl shadow-sm hover-shadow-md"
                          style={{ 
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 4px 0 rgba(34, 197, 94, 0.2)",
                          }}
                          title="Edit"
                        >
                          <Edit size={16} className="text-green-600" />
                        </Button>
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={() => handleDeleteClient(client)}
                          className="p-2 border-0 bg-transparent rounded-xl shadow-sm hover-shadow-md"
                          style={{ 
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 4px 0 rgba(239, 68, 68, 0.2)",
                          }}
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card.Footer className="border-0 bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-gray-600 small">
                  Page {currentPage} of {totalPages}
                </span>
                <Pagination className="mb-0">
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="rounded-xl mx-1 shadow-sm"
                    style={{ 
                      border: "none",
                      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      color: "#6b7280",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Previous
                  </Pagination.Prev>

                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                          className="rounded-xl mx-1 shadow-sm"
                          style={{
                            border: "none",
                            background: page === currentPage 
                              ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" 
                              : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                            color: page === currentPage ? "white" : "#6b7280",
                            transition: "all 0.2s ease",
                            width: "44px",
                            height: "44px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <Pagination.Ellipsis key={page} className="mx-1" />
                      );
                    }
                    return null;
                  })}

                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="rounded-xl mx-1 shadow-sm"
                    style={{ 
                      border: "none",
                      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      color: "#6b7280",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Next
                  </Pagination.Next>
                </Pagination>
              </div>
            </Card.Footer>
          )}
        </Card>
      )}

      {/* Client Details Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        contentClassName="rounded-2xl"
        backdropClassName="backdrop-blur-sm"
      >
        <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
          <Modal.Title className="fw-bold text-gray-900">
            Client Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0 px-4 pb-4">
          {selectedClient && (
            <div className="row">
              <div className="col-md-6">
                <div className="mb-4">
                  <h6 className="text-gray-600 text-uppercase small mb-3 fw-semibold">
                    Basic Information
                  </h6>
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3">
                      <div
                        className="bg-primary bg-opacity-10 p-3 rounded-xl d-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)" }}
                      >
                        {selectedClient.type === "company" ? (
                          <Building size={24} className="text-primary" />
                        ) : (
                          <User size={24} className="text-primary" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0 text-gray-900">
                        {selectedClient.name}
                      </h5>
                      <Badge
                        className="text-uppercase px-3 py-1 mt-1 rounded-xl"
                        style={{
                          background: selectedClient.type === "company"
                            ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                            : "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                          fontSize: "0.7rem",
                          boxShadow: "0 2px 8px 0 rgba(99, 102, 241, 0.3)",
                          color: "white",
                        }}
                      >
                        {selectedClient.type}
                      </Badge>
                    </div>
                  </div>

                  <div className="ms-5 ps-2">
                    <div className="mb-3">
                      <span className="text-gray-600 small fw-medium">Email:</span>
                      <div className="fw-semibold text-gray-900">
                        {selectedClient.email}
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="text-gray-600 small fw-medium">Phone:</span>
                      <div className="fw-semibold text-gray-900">
                        {selectedClient.phone || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-4">
                  <h6 className="text-gray-600 text-uppercase small mb-3 fw-semibold">
                    Company Information
                  </h6>
                  <div className="mb-3">
                    <span className="text-gray-600 small fw-medium">Company Name:</span>
                    <div className="fw-semibold text-gray-900">
                      {selectedClient.companyName || "-"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-gray-600 small fw-medium">GST Number:</span>
                    <div className="fw-semibold text-gray-900">
                      {selectedClient.gstNumber || "-"}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="text-gray-600 text-uppercase small mb-3 fw-semibold">
                    Status
                  </h6>
                  <Badge
                    className="fs-6 px-4 py-2 rounded-xl shadow-sm"
                    style={{
                      background: selectedClient.status === "Active"
                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      fontSize: "0.875rem",
                      boxShadow: selectedClient.status === "Active" 
                        ? "0 2px 8px 0 rgba(16, 185, 129, 0.3)" 
                        : "0 2px 8px 0 rgba(239, 68, 68, 0.3)",
                      color: "white",
                    }}
                  >
                    {selectedClient.status}
                  </Badge>
                </div>
              </div>

              <div className="col-12">
                <hr className="my-4 border-gray-200" />
                <h6 className="text-gray-600 text-uppercase small mb-3 fw-semibold">
                  Timestamps
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-2">
                      <span className="text-gray-600 small fw-medium">Created:</span>
                      <div className="fw-semibold text-gray-900">
                        {new Date(selectedClient.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <span className="text-gray-600 small fw-medium">Updated:</span>
                      <div className="fw-semibold text-gray-900">
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
            className="rounded-xl px-4 py-2 shadow-sm"
            style={{ border: "2px solid #d1d5db", color: "#6b7280", boxShadow: "0 2px 4px 0 rgba(209, 213, 219, 0.3)" }}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => handleEditClient(selectedClient)}
            className="d-flex align-items-center rounded-xl px-4 py-2 shadow-sm"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", border: "none", boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.4)" }}
          >
            <Edit size={16} className="me-2" />
            Edit Client
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Client Modal */}
      <CreateClientModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={fetchClients}
        mode="create"
      />

      {/* Edit Client Modal */}
      <CreateClientModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSuccess={fetchClients}
        mode="edit"
        client={selectedClient}
        onUpdate={handleUpdateClient}
      />

      {/* Delete Confirm Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        contentClassName="rounded-2xl"
        backdropClassName="backdrop-blur-sm"
      >
        <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
          <Modal.Title className="fw-bold text-gray-900">
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0 px-4 pb-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong className="text-gray-900">{selectedClientToDelete?.name}</strong>?
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
            className="rounded-xl px-4 py-2 shadow-sm"
            style={{ border: "2px solid #d1d5db", color: "#6b7280", boxShadow: "0 2px 4px 0 rgba(209, 213, 219, 0.3)" }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            className="rounded-xl px-4 py-2 shadow-sm"
            style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", border: "none", boxShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.4)" }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px -8px rgba(0, 0, 0, 0.08);
        }
        
        .hover-lift:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        .table tbody tr {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-bottom: 1px solid #f1f5f9;
        }
        
        .table tbody tr:hover {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.05);
          transform: scale(1.001);
        }
        
        .table th {
          border-bottom: 2px solid #e2e8f0;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }
        
        .table td {
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
          font-size: 0.875rem;
          color: #475569;
          padding-top: 1.25rem !important;
          padding-bottom: 1.25rem !important;
        }
        
        .btn-sm {
          border-radius: 12px;
          font-weight: 500;
        }
        
        .card {
          border-radius: 20px;
          background: white;
          transition: all 0.3s ease;
        }
        
        .mb-6 {
          margin-bottom: 2rem !important;
        }
        
        .rounded-xl {
          border-radius: 20px !important;
        }
        
        .rounded-2xl {
          border-radius: 24px !important;
        }
        
        .text-gray-900 {
          color: #0f172a;
        }
        
        .text-gray-600 {
          color: #64748b;
        }
        
        .text-gray-700 {
          color: #475569;
        }
        
        .text-gray-500 {
          color: #94a3b8;
        }
        
        .pagination .page-item .page-link {
          border: none;
          border-radius: 12px;
          margin: 0 2px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .pagination .page-item.active .page-link {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.4);
        }
        
        .pagination .page-item:not(.active) .page-link:hover {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          color: #475569;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.1);
        }
        
        .hover-shadow-md {
          transition: all 0.2s ease !important;
        }
        
        .hover-shadow-md:hover {
          box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-1px) !important;
        }
        
        .backdrop-blur-sm {
          backdrop-filter: blur(8px);
        }
        
        hr {
          border-color: #e2e8f0;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default ClientGrid;