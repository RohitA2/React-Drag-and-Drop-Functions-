import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Navbar, Nav, Button, NavDropdown,Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Bell } from "react-bootstrap-icons";

export default function Dashboard() {
  return (
    <div style={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      {/* Top Navbar */}
      <Navbar bg="white" expand="lg" className="shadow-sm px-4">
        <Navbar.Brand as={Link} to="/">
          <img src="/images/bird.jpg" alt="Logo" height="30" />
        </Navbar.Brand>
        <div className="d-flex justify-content-center flex-grow-1">
          <Nav variant="pills" className="rounded-pill border p-1">
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/"
                className="px-3 rounded-pill fw-medium"
              >
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/"
                className="px-3 rounded-pill text-dark"
              >
                Clients
              </Nav.Link>
            </Nav.Item>
            <NavDropdown
              title="Library"
              id="library-dropdown"
              className="rounded-pill"
            >
              <NavDropdown.Item as={Link} to="/templates">
                Templates
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/Products">
                Products
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/snippets">
                Snippets
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Item>
              <Nav.Link href="#" className="px-3 rounded-pill text-dark">
                Stats
              </Nav.Link>
            </Nav.Item>
            <NavDropdown
              title="More"
              id="more-dropdown"
              className="rounded-pill"
            >
              <NavDropdown.Item href="#">Option 1</NavDropdown.Item>
              <NavDropdown.Item href="#">Option 2</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </div>
        <div className="d-flex align-items-center">
          {/* Create Button */}
          <Button
            variant="dark"
            className="me-3 px-4 py-2 rounded-pill fw-bold"
            style={{ backgroundColor: "black", border: "none" }}
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
          >
            <Bell size={18} />
            {/* Green Dot */}
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
                src="/images/bird.jpg"
                alt="Profile"
                className="rounded-circle me-2"
                style={{ width: "30px", height: "30px" }}
              />
              <span className="fw-medium me-2 text-dark">Makise </span>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="#/profile">Profile</Dropdown.Item>
              <Dropdown.Item href="#/settings">Settings</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item href="#/logout">Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Navbar>

      {/* Page Content */}
      <div className="container py-4">
        <Outlet /> {/* Nested routes render here */}
      </div>
    </div>
  );
}
