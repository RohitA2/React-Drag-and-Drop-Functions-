import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";

import ProposalViewer from "./components/Views/ProposalViewer";
import Dashboard from "./components/pages/dashboard/Dashboard";
import TemplateBuilder from "./components/templates/TemplateBuilder";
import Projects from "./components/Projects";
import Templates from "./components/templates/Templates";
import Products from "./components/Products/product";
import Snippets from "./components/Snippet/SnippetsTable";
import Profile from "./components/pages/profile/Profile";
import Register from "./components/pages/profile/Register";
import Login from "./components/pages/profile/Login";
import Client from "./components/pages/profile/Client";
import Stats from "./components/pages/profile/Stats";
import OverView from "./components/pages/dashboard/OverView";
import Notfication from "./components/NotificatioPage";
import CompanyRegisterForm from "./components/pages/profile/CompanyRegisterForm";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectedUserId } from "./store/authSlice";
import ForgotPassword from "./components/pages/profile/ForgotPassword";
import ResetPassword from "./components/pages/profile/ResetPassword";
import VerifyOtp from "./components/pages/profile/VerifyOtp";
import BankIdSuccess from "./components/BankIdSuccess";
import BankIdFailed from "./components/BankIdFailed";
import BankIDSignPage from "./components/BankIDSignPage";
import Template from "./components/templates/Templates"

import { requestForToken, onMessageListener } from "./firebase";
const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const userId = useSelector(selectedUserId);
  useEffect(() => {
    if (!userId) return; // only run if user is logged in

    // ✅ Request FCM token
    requestForToken()
      .then(async (token) => {
        if (token) {
          console.log("📱 User FCM Token:", token);

          // ✅ Send token + userId to backend
          try {
            await axios.post(`${API_URL}/schedules/save-fcm-token`, {
              userId,
              token,
            });
            console.log("✅ FCM token saved successfully for user:", userId);
            // toast.success("Live updates enabled!", {
            //   icon: "Bell",
            //   duration: 4000,
            // });
          } catch (err) {
            console.error("❌ Failed to save FCM token:", err);
          }
        }
      })
      .catch((err) => console.error("Error getting FCM token:", err));

    // ✅ Listen for foreground notifications
   const unsubscribe = onMessageListener().then((payload) => {
  console.log("🔔 Foreground Notification:", payload);

  const title = payload?.notification?.title || payload?.data?.title || "New Notification";
  const body = payload?.notification?.body || payload?.data?.body || "";

//  toast.info(<><b>{title}</b><br />{body}</>);

});


    return () => unsubscribe;
  }, [userId]);

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Projects />} />
          {/* <Route path="templates" element={<Template />} /> */}
          <Route path="products" element={<Products />} />
          <Route path="snippets" element={<Snippets />} />
          <Route path="profile" element={<Profile />} />
          <Route path="schedule" element={<OverView />} />
          <Route path="clients" element={<Client />} />
          <Route path="stats" element={<Stats />} />
          <Route path="notifications" element={<Notfication />} />
        </Route>

        <Route path="/register" element={<Register />} />
        <Route path="/register/company" element={<CompanyRegisterForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/proposal" element={<ProposalViewer />} />
        <Route path="/proposal/:headerId" element={<ProposalViewer />} />
        <Route path="/template-builder" element={<TemplateBuilder />} />
         <Route path="/bankid-success" element={<BankIdSuccess />} />
        <Route path="/bankid-failed" element={<BankIdFailed />} />
        <Route path="/bankid-sign" element={<BankIDSignPage />} />
        <Route path="/templates" element={<Template />} />

      </Routes>
    </Router>
  );
}

export default App;


