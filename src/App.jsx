// src/App.js
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProposalViewer from "./components/Views/ProposalViewer";

import Dashboard from "./components/pages/dashboard/Dashboard";
import TemplateBuilder from "./components/templates/TemplateBuilder";
import Templates from "./components/templates/Templates";
import Products from "./components/Products/product";
import Snippets from "./components/Snippet/SnippetsTable";
import Profile from "./components/pages/profile/Profile";
import Register from "./components/pages/profile/Register";
import Login from "./components/pages/profile/Login";
import Client from "./components/pages/profile/Client";
import Stats from "./components/pages/profile/Stats"
import OverviewDashboard from "./components/pages/dashboard/OverView";
import Projects from "./components/Projects";
import Schedule from "./components/Blocks/Schedule";
import OverView from "./components/pages/dashboard/OverView";

function App() {
  return (
    <Router>
      {/* ✅ Keep ToastContainer outside Routes */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* Dashboard layout pages */}
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Projects />} />
          {/* <Route index element={<ClientPage />} /> */}
          <Route path="templates" element={<Templates />} />
          <Route path="products" element={<Products />} />
          <Route path="snippets" element={<Snippets />} />
          <Route path="profile" element={<Profile />} />
          <Route path="schedule" element={<OverView/>} />
          <Route path="clients" element={<Client />} />
          <Route path="stats" element={<Stats />} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/proposal" element={<ProposalViewer />} />
        <Route path="/proposal/:headerId" element={<ProposalViewer />} />

        {/* FULLSCREEN editor (no dashboard layout) */}
        <Route path="/template-builder" element={<TemplateBuilder />} />
      </Routes>
    </Router>
  );
}

export default App;
