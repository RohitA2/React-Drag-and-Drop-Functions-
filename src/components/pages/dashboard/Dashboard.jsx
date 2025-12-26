// import React, { useEffect } from "react";
// import { Outlet, Link } from "react-router-dom";
// import { Navbar, Nav, Button, NavDropdown, Dropdown } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import { Bell } from "react-bootstrap-icons";
// import { useSelector, useDispatch } from "react-redux";
// import { logout } from "../../../store/authSlice";

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { user, token } = useSelector((state) => state.auth);

//   useEffect(() => {
//     if (!user || !token) {
//       navigate("/login");
//     }
//   }, [user, token, navigate]);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/login");
//   };

//   return (
//     <div style={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
//       {/* Top Navbar */}
//       <Navbar
//         bg="white"
//         expand="lg"
//         className="shadow-sm px-4 py-3"
//         style={{
//           fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//         }}
//       >
//         <Navbar.Brand
//           as={Link}
//           to="/"
//           className="d-flex align-items-center"
//           style={{ fontWeight: "700", fontSize: "1.25rem", color: "#333" }}
//         >
//           <img
//             style={{ width: "160px", height: "50px" }}
//             src="/images/signlink.jpg"
//             alt="Logo"
//             height="32"
//             className="me-2 rounded shadow-sm"
//           />
//           {/* <span className="text-primary fw-bold ms-2 me-2 mt-1 mb-1">SignLink</span> */}
//         </Navbar.Brand>

//         <div className="d-flex justify-content-center flex-grow-1">
//           {/* Middle nav */}
//           <Nav
//             variant="pills"
//             className="rounded-pill border p-1 nav-hover-dropdown"
//           >
//             <Nav.Item>
//               <Nav.Link
//                 as={Link}
//                 to="/"
//                 className="px-4 rounded-pill fw-semibold text-dark"
//                 activeclassname="active"
//               >
//                 Overview
//               </Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link
//                 as={Link}
//                 to="/schedule"
//                 className="px-4 rounded-pill fw-semibold text-dark"
//                 activeclassname="active"
//               >
//                 Schedules
//               </Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link
//                 as={Link}
//                 to="/clients"
//                 className="px-4 rounded-pill text-dark fw-semibold"
//                 activeclassname="active"
//               >
//                 Clients
//               </Nav.Link>
//             </Nav.Item>

//             <NavDropdown
//               title="Library"
//               id="library-dropdown"
//               className="nav-dropdown"
//             >
//               <NavDropdown.Item as={Link} to="/templates">
//                 Templates
//               </NavDropdown.Item>
//               <NavDropdown.Item as={Link} to="/products">
//                 Products
//               </NavDropdown.Item>
//               <NavDropdown.Item as={Link} to="/snippets">
//                 Snippets
//               </NavDropdown.Item>
//             </NavDropdown>

//             <Nav.Item>
//               <Nav.Link
//                 as={Link}
//                 to="/stats"
//                 className="px-4 rounded-pill text-dark fw-semibold"
//                 activeclassname="active"
//               >
//                 Stats
//               </Nav.Link>
//             </Nav.Item>
//           </Nav>
//         </div>

//         <div className="d-flex align-items-center">
//           {/* Create Button */}
//           <Button
//             variant="dark"
//             className="me-3 px-4 py-2 rounded-pill fw-bold shadow-sm"
//             style={{
//               backgroundColor: "#222",
//               border: "none",
//               transition: "background-color 0.3s",
//             }}
//             onClick={() => navigate("/template-builder")}
//             onMouseEnter={(e) =>
//               (e.currentTarget.style.backgroundColor = "#000")
//             }
//             onMouseLeave={(e) =>
//               (e.currentTarget.style.backgroundColor = "#222")
//             }
//           >
//             Create
//           </Button>

//           {/* Notification Button */}
//           <div
//             className="position-relative d-flex justify-content-center align-items-center rounded-circle me-3"
//             style={{
//               width: "38px",
//               height: "38px",
//               backgroundColor: "#f0f0f0",
//               cursor: "pointer",
//               transition: "background-color 0.3s",
//             }}
//             onClick={() => navigate("/notifications")}
//             onMouseEnter={(e) =>
//               (e.currentTarget.style.backgroundColor = "#e1e1e1")
//             }
//             onMouseLeave={(e) =>
//               (e.currentTarget.style.backgroundColor = "#f0f0f0")
//             }
//             title="Notifications"
//           >
//             <Bell size={20} color="#444" />
//             <span
//               className="position-absolute top-0 start-50 translate-middle"
//               style={{
//                 width: "10px",
//                 height: "10px",
//                 backgroundColor: "limegreen",
//                 borderRadius: "50%",
//                 border: "2px solid white",
//               }}
//             ></span>
//           </div>

//           {/* Profile Dropdown */}
//           <Dropdown align="end" className="nav-dropdown">
//             <Dropdown.Toggle
//               id="profile-dropdown"
//               className="d-flex align-items-center rounded-pill border bg-white px-3 py-1 shadow-sm"
//               style={{
//                 borderColor: "#ddd",
//                 cursor: "pointer",
//                 userSelect: "none",
//               }}
//             >
//               <img
//                 src={user?.image || "/images/bird.jpg"}
//                 alt="Profile"
//                 className="rounded-circle me-2"
//                 style={{ width: "32px", height: "32px", objectFit: "cover" }}
//               // onError={(e) => {
//               //   e.target.src = "/images/placeholder-user.jpg";
//               // }}
//               />
//               <span className="fw-semibold text-dark">
//                 {user?.firstName || user?.email || "Guest"}
//               </span>
//             </Dropdown.Toggle>

//             <Dropdown.Menu>
//               <Dropdown.Item as={Link} to="/profile">
//                 Profile
//               </Dropdown.Item>
//               <Dropdown.Item as={Link} to="/settings">
//                 Settings
//               </Dropdown.Item>
//               <Dropdown.Divider />
//               <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
//             </Dropdown.Menu>
//           </Dropdown>
//         </div>
//       </Navbar>

//       {/* Page Content */}
//       <div className="container-fluid py-4">
//         <Outlet />
//       </div>

//       {/* Custom styles for dropdown hover */}
//       <style>{`
//         /* Make nav dropdown open on hover */
//         .nav-hover-dropdown .nav-dropdown:hover > .dropdown-menu,
//         .nav-dropdown:hover > .dropdown-menu,
//         .dropdown:hover > .dropdown-menu {
//           display: block !important;
//           margin-top: 0;
//           opacity: 1;
//           visibility: visible;
//           transition: opacity 0.2s ease-in-out;
//         }

//         .nav-hover-dropdown .nav-dropdown > .dropdown-menu,
//         .nav-dropdown > .dropdown-menu,
//         .dropdown > .dropdown-menu {
//           margin-top: 0;
//           opacity: 0;
//           visibility: hidden;
//           transition: opacity 0.2s ease-in-out;
//         }

//         /* Better pills styles */
//         .nav-pills .nav-link {
//           color: #555;
//           transition: background-color 0.3s, color 0.3s;
//         }
//         .nav-pills .nav-link.active,
//         .nav-pills .nav-link:hover {
//           background-color: #5c6ac4;
//           color: white !important;
//         }
//       `}</style>
//     </div>
//   );
// }

import React, { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Navbar, Nav, Button, NavDropdown, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Palette, Box, FileText, BarChart, Grid, Person, GearFill, Power } from "react-bootstrap-icons";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../store/authSlice";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
    }
  }, [user, token, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {/* Top Navbar */}
      <Navbar
        bg="white"
        expand="lg"
        className="shadow-sm px-4 py-3"
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center"
          style={{ fontWeight: "700", fontSize: "1.25rem", color: "#333" }}
        >
          <img
            style={{ width: "160px", height: "50px" }}
            src="/images/signlink.jpg"
            alt="Logo"
            height="32"
            className="me-2 rounded shadow-sm"
          />
        </Navbar.Brand>

        <div className="d-flex justify-content-center grow">
          {/* Middle nav */}
          <Nav
            variant="pills"
            className="rounded-pill border p-1 nav-hover-dropdown"
            style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" }}
          >
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/"
                className="px-4 rounded-pill fw-semibold text-dark d-flex align-items-center"
                activeclassname="active"
              >
                {/* <Grid size={16} className="me-2" /> */}
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/schedule"
                className="px-4 rounded-pill fw-semibold text-dark d-flex align-items-center"
                activeclassname="active"
              >
                {/* <Box size={16} className="me-2" /> */}
                Schedules
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/clients"
                className="px-4 rounded-pill text-dark fw-semibold d-flex align-items-center"
                activeclassname="active"
              >
                {/* <Person  size={16} className="me-2" /> */}
                Clients
              </Nav.Link>
            </Nav.Item>

            {/* Enhanced Library Dropdown */}
            <NavDropdown
              title={
                <span className="d-flex align-items-center fw-semibold">
                  {/* <Palette size={16} className="me-2" /> */}
                  Library
                  <ChevronDown size={14} className="ms-1" />
                </span>
              }
              id="library-dropdown"
              className="nav-dropdown library-dropdown"
              menuVariant="light"
              align="end"
              renderMenuOnMount={true}
            >
              <div className="p-3" style={{ minWidth: "280px" }}>
                <h6 className="text-uppercase text-muted mb-3 fw-bold" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                  Content Library
                </h6>

                <NavDropdown.Item
                  as={Link}
                  to="/templates"
                  className="d-flex align-items-center py-3 px-3 rounded-3 mb-2 dropdown-item-custom"
                >
                  <div className="dropdown-icon-wrapper me-3">
                    <div className="icon-circle bg-primary bg-opacity-10">
                      <FileText size={20} className="text-primary" />
                    </div>
                  </div>
                  <div className="grow">
                    <div className="fw-semibold">Templates</div>
                    <small className="text-muted">Pre-designed document templates</small>
                  </div>
                  <ChevronDown size={12} className="text-muted rotate-90" />
                </NavDropdown.Item>

                <NavDropdown.Item
                  as={Link}
                  to="/products"
                  className="d-flex align-items-center py-3 px-3 rounded-3 mb-2 dropdown-item-custom"
                >
                  <div className="dropdown-icon-wrapper me-3">
                    <div className="icon-circle bg-success bg-opacity-10">
                      <Box size={20} className="text-success" />
                    </div>
                  </div>
                  <div className="grow">
                    <div className="fw-semibold">Products</div>
                    <small className="text-muted">Your digital products catalog</small>
                  </div>
                  <ChevronDown size={12} className="text-muted rotate-90" />
                </NavDropdown.Item>

                <NavDropdown.Item
                  as={Link}
                  to="/snippets"
                  className="d-flex align-items-center py-3 px-3 rounded-3 dropdown-item-custom"
                >
                  <div className="dropdown-icon-wrapper me-3">
                    <div className="icon-circle bg-info bg-opacity-10">
                      <BarChart size={20} className="text-info" />
                    </div>
                  </div>
                  <div className="grow">
                    <div className="fw-semibold">Snippets</div>
                    <small className="text-muted">Reusable code & content pieces</small>
                  </div>
                  <ChevronDown size={12} className="text-muted rotate-90" />
                </NavDropdown.Item>

                <div className="mt-3 pt-3 border-top">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="w-100 rounded-pill fw-semibold"
                    onClick={() => navigate("/library-management")}
                  >
                    Manage Library
                  </Button>
                </div>
              </div>
            </NavDropdown>

            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/stats"
                className="px-4 rounded-pill text-dark fw-semibold d-flex align-items-center"
                activeclassname="active"
              >
                {/* <BarChart size={16} className="me-2" /> */}
                Stats
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        <div className="d-flex align-items-center">
          {/* Create Button */}
          <Button
            variant="dark"
            className="me-3 px-4 py-2 rounded-pill fw-bold shadow-sm d-flex align-items-center"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
            }}
            onClick={() => navigate("/template-builder")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
            }}
          >
            <span className="me-2">+</span>
            Create
          </Button>

          {/* Notification Button */}
          <div
            className="position-relative d-flex justify-content-center align-items-center rounded-circle me-3 notification-btn"
            style={{
              width: "44px",
              height: "44px",
              backgroundColor: "#f0f0f0",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate("/notifications")}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e1e1e1";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f0f0";
              e.currentTarget.style.transform = "scale(1)";
            }}
            title="Notifications"
          >
            <Bell size={20} color="#444" />
            <span
              className="position-absolute top-0 start-50 translate-middle pulse-dot"
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: "#10b981",
                borderRadius: "50%",
                border: "2px solid white",
                boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)",
              }}
            ></span>
          </div>

          {/* Enhanced Profile Dropdown */}
          <Dropdown align="end" className="nav-dropdown profile-dropdown">
            <Dropdown.Toggle
              id="profile-dropdown"
              className="d-flex align-items-center rounded-pill border-0 bg-white px-3 py-2 shadow-sm"
              style={{
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.3s ease",
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.05)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div className="position-relative me-2">
                <img
                  src={user?.image || "/images/bird.jpg"}
                  alt="Profile"
                  className="rounded-circle shadow-sm"
                  style={{
                    width: "36px",
                    height: "36px",
                    objectFit: "cover",
                    border: "3px solid white",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                  }}
                />
                <span className="position-absolute bottom-0 end-0 bg-success rounded-circle"
                  style={{
                    width: "10px",
                    height: "10px",
                    border: "2px solid white"
                  }}
                ></span>
              </div>
              <div className="d-flex flex-column text-start me-2">
                <span className="fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>
                  {user?.firstName || user?.email || "Guest"}
                </span>
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  {user?.role || "Member"}
                </small>
              </div>
              <ChevronDown size={14} className="text-muted" />
            </Dropdown.Toggle>

            <Dropdown.Menu
              className="shadow-lg border-0 p-3"
              style={{
                minWidth: "280px",
                borderRadius: "16px",
                marginTop: "12px",
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                border: "1px solid rgba(0, 0, 0, 0.08)"
              }}
            >
              <div className="text-center mb-3">
                <div className="position-relative d-inline-block mb-2">
                  <img
                    src={user?.image || "/images/bird.jpg"}
                    alt="Profile"
                    className="rounded-circle shadow"
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "cover",
                      border: "4px solid white"
                    }}
                  />
                  <button
                    className="position-absolute bottom-0 end-0 bg-primary rounded-circle border-0 d-flex align-items-center justify-content-center"
                    style={{
                      width: "24px",
                      height: "24px",
                      border: "2px solid white"
                    }}
                    title="Edit Profile"
                  >
                    <span style={{ fontSize: "10px", color: "white" }}>✎</span>
                  </button>
                </div>
                <h6 className="fw-bold mb-0">{user?.firstName || "Guest"}</h6>
                <small className="text-muted">{user?.email}</small>
                <div className="d-flex justify-content-center mt-2">
                  <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1">
                    {user?.plan || "Free Plan"}
                  </span>
                </div>
              </div>

              <Dropdown.Divider className="my-3" />

              <Dropdown.Item
                as={Link}
                to="/profile"
                className="d-flex align-items-center py-2 px-3 rounded-3 mb-2 dropdown-item-custom"
              >
                <div className="dropdown-icon-wrapper me-3">
                  <Person size={18} className="text-primary" />
                </div>
                <div className="grow">
                  <div className="fw-semibold">Profile</div>
                  <small className="text-muted">View and edit your profile</small>
                </div>
              </Dropdown.Item>

              <Dropdown.Item
                as={Link}
                to="/settings"
                className="d-flex align-items-center py-2 px-3 rounded-3 mb-2 dropdown-item-custom"
              >
                <div className="dropdown-icon-wrapper me-3">
                  <GearFill size={18} className="text-info" />
                </div>
                <div className="grow">
                  <div className="fw-semibold">Settings</div>
                  <small className="text-muted">Account preferences</small>
                </div>
              </Dropdown.Item>

              <Dropdown.Divider className="my-3" />

              <Dropdown.Item
                onClick={handleLogout}
                className="d-flex align-items-center py-2 px-3 rounded-3 dropdown-item-custom text-danger"
              >
                <div className="dropdown-icon-wrapper me-3">
                  <Power size={18} className="text-danger" />
                </div>
                <div className="grow">
                  <div className="fw-semibold">Logout</div>
                  <small className="text-muted">Sign out from your account</small>
                </div>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Navbar>

      {/* Page Content */}
      <div className="container-fluid py-4">
        <Outlet />
      </div>

      {/* Custom styles for enhanced dropdowns */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        /* Custom dropdown animations */
        .nav-dropdown .dropdown-menu {
          animation: slideDown 0.2s ease-out;
          opacity: 0;
          transform: translateY(-10px);
          animation-fill-mode: forwards;
          display: none !important;
        }

        .nav-dropdown:hover .dropdown-menu,
        .nav-dropdown.show .dropdown-menu {
          display: block !important;
          opacity: 1;
          transform: translateY(0);
          visibility: visible;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Enhanced dropdown items */
        .dropdown-item-custom {
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .dropdown-item-custom:hover {
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          border-color: #667eea30;
          transform: translateX(4px);
        }

        .dropdown-item-custom:active {
          background-color: rgba(108, 117, 125, 0.1);
        }

        /* Icon styling */
        .dropdown-icon-wrapper {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-circle {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Rotate chevron */
        .rotate-90 {
          transform: rotate(90deg);
        }

        /* Pulse animation for notification dot */
        .pulse-dot {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        /* Library dropdown specific */
        .library-dropdown .dropdown-toggle::after {
          display: none;
        }

        .library-dropdown .dropdown-toggle {
          color: #555 !important;
        }

        .library-dropdown .dropdown-toggle:hover {
          color: #fff !important;
        }

        /* Enhanced nav pills */
        .nav-pills .nav-link {
          color: #555;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .nav-pills .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .nav-pills .nav-link:hover::before {
          left: 100%;
        }

        .nav-pills .nav-link.active,
        .nav-pills .nav-link:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        /* Smooth transitions */
        * {
          transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }

        /* Better scrollbar */
        .dropdown-menu::-webkit-scrollbar {
          width: 6px;
        }

        .dropdown-menu::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .dropdown-menu::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }

        .dropdown-menu::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}