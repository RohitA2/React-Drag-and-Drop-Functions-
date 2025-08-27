import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Eye, EyeOff, Camera, Smile, Sun, User, Mail, Phone, Lock, Save, X, Upload, CheckCircle ,Edit } from 'lucide-react';
import { updateUserProfile } from '../../../store/authSlice'; // You'll need to create this action

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error, success } = useSelector((state) => state.auth);
  
  const [userData, setUserData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setProfileImage(user.profileImage || '');
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
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (userData.newPassword && userData.newPassword !== userData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    
    dispatch(updateUserProfile({
      ...userData,
      profileImage,
      id: user.id
    }));
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setUserData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setProfileImage(user.profileImage || '');
    setIsEditing(false);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        {saveSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="mr-2" size={20} />
            Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar with Best Practices */}
            <div className="w-full lg:w-1/3 bg-gradient-to-b from-indigo-700 to-purple-800 text-white p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <User className="mr-2" size={24} />
                Profile Best Practices
              </h2>
              
              <div className="bg-indigo-600 bg-opacity-30 rounded-xl p-5 mb-8">
                <h3 className="font-medium mb-4 flex items-center">
                  <Camera className="mr-2" size={20} />
                  Photo Guidelines
                </h3>
                
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Smile className="mr-3 mt-0.5 text-indigo-300" size={18} />
                    <span>Make sure to smile. A friendly photo creates better connections.</span>
                  </li>
                  <li className="flex items-start">
                    <Sun className="mr-3 mt-0.5 text-indigo-300" size={18} />
                    <span>Use natural daylight for the best results. Avoid using flash.</span>
                  </li>
                  <li className="flex items-start">
                    <Camera className="mr-3 mt-0.5 text-indigo-300" size={18} />
                    <span>Keep the camera at eye-level for a natural perspective.</span>
                  </li>
                  <li className="flex items-start">
                    <Camera className="mr-3 mt-0.5 text-indigo-300" size={18} />
                    <span>Choose a simple, uncluttered background to keep the focus on you.</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto">
                    <img 
                      src={profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80"} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label htmlFor="profile-upload" className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-2 shadow-md hover:bg-blue-600 transition cursor-pointer">
                    <Upload size={16} />
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                
                <h3 className="text-xl font-medium">{userData.firstName} {userData.lastName}</h3>
                <p className="text-indigo-200">{userData.email}</p>
                <p className="text-sm text-indigo-300 mt-2">Joined January 2023</p>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full lg:w-2/3 p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800">Account Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center"
                  >
                    <Edit size={18} className="mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center"
                    >
                      <X size={18} className="mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="profile-form"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <form id="profile-form" onSubmit={handleSubmit}>
                <div className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={userData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-100"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={userData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Mail className="mr-2" size={18} />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-100"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Phone className="mr-2" size={18} />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Security</h3>
                  
                  <div className="form-group mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Lock className="mr-2" size={18} />
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={userData.currentPassword}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your current password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-100 pr-12"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        disabled={!isEditing}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Change Password</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={userData.newPassword}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter new password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-100 pr-12"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={!isEditing}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={userData.confirmPassword}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Confirm new password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-100 pr-12"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={!isEditing}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
  );
};

export default ProfilePage;