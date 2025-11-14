import React, { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Navbar, Nav, Button, NavDropdown, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Bell } from "react-bootstrap-icons";
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
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
          {/* <span className="text-primary fw-bold ms-2 me-2 mt-1 mb-1">SignLink</span> */}
        </Navbar.Brand>

        <div className="d-flex justify-content-center flex-grow-1">
          {/* Middle nav */}
          <Nav
            variant="pills"
            className="rounded-pill border p-1 nav-hover-dropdown"
          >
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/"
                className="px-4 rounded-pill fw-semibold text-dark"
                activeclassname="active"
              >
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/schedule"
                className="px-4 rounded-pill fw-semibold text-dark"
                activeclassname="active"
              >
                Schedules
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/clients"
                className="px-4 rounded-pill text-dark fw-semibold"
                activeclassname="active"
              >
                Clients
              </Nav.Link>
            </Nav.Item>

            <NavDropdown
              title="Library"
              id="library-dropdown"
              className="nav-dropdown"
            >
              <NavDropdown.Item as={Link} to="/templates">
                Templates
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products">
                Products
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/snippets">
                Snippets
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/stats"
                className="px-4 rounded-pill text-dark fw-semibold"
                activeclassname="active"
              >
                Stats
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        <div className="d-flex align-items-center">
          {/* Create Button */}
          <Button
            variant="dark"
            className="me-3 px-4 py-2 rounded-pill fw-bold shadow-sm"
            style={{
              backgroundColor: "#222",
              border: "none",
              transition: "background-color 0.3s",
            }}
            onClick={() => navigate("/template-builder")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#000")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#222")
            }
          >
            Create
          </Button>

          {/* Notification Button */}
          <div
            className="position-relative d-flex justify-content-center align-items-center rounded-circle me-3"
            style={{
              width: "38px",
              height: "38px",
              backgroundColor: "#f0f0f0",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onClick={() => navigate("/notifications")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#e1e1e1")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#f0f0f0")
            }
            title="Notifications"
          >
            <Bell size={20} color="#444" />
            <span
              className="position-absolute top-0 start-50 translate-middle"
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: "limegreen",
                borderRadius: "50%",
                border: "2px solid white",
              }}
            ></span>
          </div>

          {/* Profile Dropdown */}
          <Dropdown align="end" className="nav-dropdown">
            <Dropdown.Toggle
              id="profile-dropdown"
              className="d-flex align-items-center rounded-pill border bg-white px-3 py-1 shadow-sm"
              style={{
                borderColor: "#ddd",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <img
                src={user?.image || "/images/bird.jpg"}
                alt="Profile"
                className="rounded-circle me-2"
                style={{ width: "32px", height: "32px", objectFit: "cover" }}
              // onError={(e) => {
              //   e.target.src = "/images/placeholder-user.jpg";
              // }}
              />
              <span className="fw-semibold text-dark">
                {user?.firstName || user?.email || "Guest"}
              </span>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/profile">
                Profile
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/login">
                Login
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/register">
                Register
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/settings">
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Navbar>

      {/* Page Content */}
      <div className="container-fluid py-4">
        <Outlet />
      </div>

      {/* Custom styles for dropdown hover */}
      <style>{`
        /* Make nav dropdown open on hover */
        .nav-hover-dropdown .nav-dropdown:hover > .dropdown-menu,
        .nav-dropdown:hover > .dropdown-menu,
        .dropdown:hover > .dropdown-menu {
          display: block !important;
          margin-top: 0;
          opacity: 1;
          visibility: visible;
          transition: opacity 0.2s ease-in-out;
        }

        .nav-hover-dropdown .nav-dropdown > .dropdown-menu,
        .nav-dropdown > .dropdown-menu,
        .dropdown > .dropdown-menu {
          margin-top: 0;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease-in-out;
        }

        /* Better pills styles */
        .nav-pills .nav-link {
          color: #555;
          transition: background-color 0.3s, color 0.3s;
        }
        .nav-pills .nav-link.active,
        .nav-pills .nav-link:hover {
          background-color: #5c6ac4;
          color: white !important;
        }
      `}</style>
    </div>
  );
}