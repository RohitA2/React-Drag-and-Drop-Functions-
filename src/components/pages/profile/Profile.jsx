import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Eye,
  EyeOff,
  Camera,
  Smile,
  Sun,
  User,
  Mail,
  Phone,
  Lock,
  Save,
  X,
  Upload,
  CheckCircle,
  Edit,
} from "lucide-react";
import { updateUserProfile } from "../../../store/authSlice";
import { toast } from "react-toastify";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error, success } = useSelector((state) => state.auth);

  const [userData, setUserData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    mobile_number: user?.mobile_number || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        mobile_number: user.mobile_number || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setProfileImage(user.image || "");
    }
  }, [user]);

  useEffect(() => {
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  }, [success]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Preview locally first
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage(e.target.result); // Temp local preview
    };
    reader.readAsDataURL(file);

    try {
      // ✅ Upload file to backend
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post(`${API_URL}/upload/img`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ Add auth if backend requires it
        },
      });

      const uploadedUrl = uploadRes.data.url;
      console.log("uploadedUrl", uploadedUrl);

      // ✅ Update Redux with just the image (minimal update)
      dispatch(
        updateUserProfile({
          id: user.id,
          image: uploadedUrl, // Only send image + id
        })
      );

      // ✅ Switch to real URL for preview
      setProfileImage(uploadedUrl);

      // ✅ Clear file input to allow re-upload of same file
      e.target.value = "";
    } catch (err) {
      console.error("Image upload failed:", err);
      // ✅ Revert to original on error
      setProfileImage(user?.profileImage || "");
      toast.error("Image upload failed. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      userData.newPassword &&
      userData.newPassword !== userData.confirmPassword
    ) {
      toast.error("New passwords don't match!"); // Use toast for consistency
      return;
    }
    if (userData.newPassword && userData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    dispatch(
      updateUserProfile({
        ...userData,
        password: userData.newPassword || undefined,
        image: profileImage, // ✅ Current image (uploaded or original)
        id: user.id,
      })
    );

    // ✅ Clear sensitive fields
    setUserData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));

    setIsEditing(false);
  };

  const handleCancel = () => {
    setUserData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      mobile_number: user.mobile_number || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setProfileImage(user.profileImage || "");
    setIsEditing(false);
  };

  return (
    <div className="container-fluid py-0.5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card shadow-sm">
            <div className="row g-0">
              {/* Sidebar with Best Practices */}
              <div className="col-12 col-lg-4 bg-primary text-white p-4">
                <div className="text-center">
                  <div className="position-relative d-inline-block mb-3">
                    <div
                      className="rounded-circle overflow-hidden border border-4 border-white shadow-lg mx-auto"
                      style={{ width: "160px", height: "160px" }}
                    >
                      <img
                        src={
                          profileImage?.trim()
                            ? profileImage
                            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
                        }}
                        alt="Profile"
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <label
                      htmlFor="profile-upload"
                      className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 shadow-sm hover-bg-primary bg-opacity-90 transition cursor-pointer"
                    >
                      <Upload size={16} />
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>

                  <h3 className="h5 fw-medium">
                    {userData.firstName} {userData.lastName}
                  </h3>
                  <p className="text-primary bg-opacity-75">{userData.email}</p>
                  {/* <p className="small text-primary bg-opacity-75 mt-2">
                    Joined January 2023
                  </p> */}
                </div>
                <h2 className="h5 fw-semibold mb-4 d-flex align-items-center">
                  <User className="me-2" size={24} />
                  Profile Best Practices
                </h2>

                <div className="bg-primary bg-opacity-25 rounded-3 p-4 mb-4">
                  <h3 className="h6 fw-medium mb-3 d-flex align-items-center">
                    <Camera className="me-2" size={20} />
                    Photo Guidelines
                  </h3>

                  <ul className="list-unstyled">
                    <li className="d-flex align-items-start mb-3">
                      <Smile
                        className="me-3 mt-1 text-primary bg-opacity-50"
                        size={18}
                      />
                      <span className="small">
                        Make sure to smile. A friendly photo creates better
                        connections.
                      </span>
                    </li>
                    <li className="d-flex align-items-start mb-3">
                      <Sun
                        className="me-3 mt-1 text-primary bg-opacity-50"
                        size={18}
                      />
                      <span className="small">
                        Use natural daylight for the best results. Avoid using
                        flash.
                      </span>
                    </li>
                    <li className="d-flex align-items-start mb-3">
                      <Camera
                        className="me-3 mt-1 text-primary bg-opacity-50"
                        size={18}
                      />
                      <span className="small">
                        Keep the camera at eye-level for a natural perspective.
                      </span>
                    </li>
                    <li className="d-flex align-items-start">
                      <Camera
                        className="me-3 mt-1 text-primary bg-opacity-50"
                        size={18}
                      />
                      <span className="small">
                        Choose a simple, uncluttered background to keep the
                        focus on you.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Main Content */}
              <div className="col-12 col-lg-8 p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="h4 fw-semibold text-dark">
                    Account Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-primary d-flex align-items-center"
                    >
                      <Edit size={18} className="me-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="d-flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="btn btn-outline-secondary d-flex align-items-center"
                      >
                        <X size={18} className="me-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="profile-form"
                        disabled={loading}
                        className="btn btn-primary d-flex align-items-center"
                      >
                        {loading ? (
                          <>
                            <div
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} className="me-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <form id="profile-form" onSubmit={handleSubmit}>
                  <div className="mb-5">
                    <h3 className="h5 fw-semibold text-dark mb-4 pb-2 border-bottom">
                      Personal Information
                    </h3>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={userData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="form-control"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={userData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium d-flex align-items-center">
                          <Mail className="me-2" size={18} />
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={userData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="form-control"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium d-flex align-items-center">
                          <Phone className="me-2" size={18} />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="mobile_number"
                          value={userData.mobile_number}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="h5 fw-semibold text-dark mb-4 pb-2 border-bottom">
                      Security
                    </h3>

                    <div className="mb-4">
                      <label className="form-label fw-medium d-flex align-items-center">
                        <Lock className="me-2" size={18} />
                        Current Password
                      </label>
                      <div className="position-relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={userData.currentPassword}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter your current password"
                          className="form-control pe-5"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          disabled={!isEditing}
                          className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-decoration-none text-muted"
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    <h4 className="h6 fw-medium text-dark mb-3">
                      Change Password
                    </h4>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          New Password
                        </label>
                        <div className="position-relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={userData.newPassword}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Enter new password"
                            className="form-control pe-5"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            disabled={!isEditing}
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-decoration-none text-muted"
                          >
                            {showNewPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          Confirm Password
                        </label>
                        <div className="position-relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={userData.confirmPassword}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Confirm new password"
                            className="form-control pe-5"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            disabled={!isEditing}
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-decoration-none text-muted"
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;