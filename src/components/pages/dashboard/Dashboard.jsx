import React, { use, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Navbar, Nav, Button, NavDropdown, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Bell } from "react-bootstrap-icons";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../store/authSlice"; // Import logout action

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Get both user and token from Redux
  const { user, token } = useSelector((state) => state.auth);

  // ✅ Redirect to login if no user or token
  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
    }
  }, [user, token, navigate]);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div style={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      {/* Top Navbar */}
      <Navbar bg="white" expand="lg" className="shadow-sm px-4">
        <Navbar.Brand as={Link} to="/dashboard">
          <img src="/images/bird.jpg" alt="Logo" height="30" />
        </Navbar.Brand>

        <div className="d-flex justify-content-center flex-grow-1">
          {/* Middle nav */}
          <Nav variant="pills" className="rounded-pill border p-1">
            <Nav.Item>
              <Nav.Link as={Link} to="/dashboard" className="px-3 rounded-pill fw-medium">
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/clients" className="px-3 rounded-pill text-dark">
                Clients
              </Nav.Link>
            </Nav.Item>
            <NavDropdown title="Library" id="library-dropdown">
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
              <Nav.Link as={Link} to="/stats" className="px-3 rounded-pill text-dark">
                Stats
              </Nav.Link>
            </Nav.Item>
            <NavDropdown title="More" id="more-dropdown">
              <NavDropdown.Item as={Link} to="/members">Members</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/documents">Documents</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/sms-sender">SMS Sender</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/subdomain">Subdomain</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/email-domain">Email Domain</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/billing">Billing</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </div>

        <div className="d-flex align-items-center">
          {/* Create Button */}
          <Button
            variant="dark"
            className="me-3 px-4 py-2 rounded-pill fw-bold"
            style={{ backgroundColor: "black", border: "none" }}
            onClick={() => navigate("/template-builder")}
          >
            Create
          </Button>

          {/* Notification Button */}
          <div
            className="position-relative d-flex justify-content-center align-items-center rounded-circle me-3"
            style={{
              width: "38px",
              height: "38px",
              backgroundColor: "#F5F5F5",
              cursor: "pointer",
            }}
            onClick={() => navigate("/notifications")}
          >
            <Bell size={18} />
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
          <Dropdown align="end">
            <Dropdown.Toggle
              id="profile-dropdown"
              className="d-flex align-items-center rounded-pill border bg-white px-2"
              style={{ borderColor: "#ddd" }}
            >
              <img
                src={user?.profile_image ||"/images/bird.jpg"}
                alt="Profile"
                className="rounded-circle me-2"
                style={{ width: "30px", height: "30px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = "/images/placeholder-user.jpg";
                }}
              />
              <span className="fw-medium me-2 text-dark">
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
    </div>
  );
}