import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Building, Globe, Users, Briefcase, ArrowLeft, MapPin, Phone, User, Mail, Lock, Globe2 } from "lucide-react";

const CompanyRegisterForm = () => {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1); // For multi-step form

    const [formData, setFormData] = useState({
        // Personal Info
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "",

        // Company Info
        companyName: "",
        companyWebsite: "",
        companySize: "",
        industry: "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        taxId: ""
    });

    const companySizes = [
        "1-10 employees",
        "11-50 employees",
        "51-200 employees",
        "201-500 employees",
        "501-1000 employees",
        "1000+ employees"
    ];

    const industries = [
        "Technology",
        "Finance & Banking",
        "Healthcare",
        "Legal",
        "Real Estate",
        "Education",
        "Retail & E-commerce",
        "Manufacturing",
        "Consulting",
        "Marketing & Advertising",
        "Non-profit",
        "Government",
        "Hospitality",
        "Transportation",
        "Construction",
        "Energy",
        "Telecommunications",
        "Other"
    ];

    const roles = [
        "Owner/Founder",
        "CEO/President",
        "Director",
        "Manager",
        "Team Lead",
        "HR Manager",
        "IT Manager",
        "Finance Manager",
        "Sales Manager",
        "Marketing Manager",
        "Individual Contributor",
        "Other"
    ];

    const countries = [
        "United States",
        "Canada",
        "United Kingdom",
        "Australia",
        "Germany",
        "France",
        "Japan",
        "India",
        "Singapore",
        "United Arab Emirates",
        "Other"
    ];

    const usStates = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
        "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
        "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
        "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
        "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
        "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
        "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
        "Wisconsin", "Wyoming"
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const nextStep = () => {
        if (step === 1) {
            // Validate personal info
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.role) {
                toast.error("Please fill all personal information fields");
                return;
            }
            if (formData.password.length < 8) {
                toast.error("Password must be at least 8 characters long");
                return;
            }
        }
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                role: "Client",
                accountType: "company",
                companyName: formData.companyName,
                companyWebsite: formData.companyWebsite ? `https://${formData.companyWebsite}` : "",
                companySize: formData.companySize,
                industry: formData.industry,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country,
                taxId: formData.taxId,
            };

            const res = await axios.post(`${API_URL}/api/auth/register`, payload);

            if (res.status === 200 || res.status === 201) {
                toast.success("Company account created successfully!");
                navigate("/verify-otp", {
                    state: {
                        email: formData.email,
                        accountType: "company",
                        companyName: formData.companyName
                    }
                });
            } else {
                const message = res?.data?.message || "Something went wrong.";
                toast.error(`Error: ${message}`);
            }
        } catch (error) {
            console.error("Registration error:", error);
            const message = error?.response?.data?.message || "Something went wrong.";
            toast.error(`Error: ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="company-register-container">
            <div className="company-background">
                <div className="bg-shape shape-1"></div>
                <div className="bg-shape shape-2"></div>
                <div className="bg-shape shape-3"></div>
                <div className="bg-shape shape-4"></div>
            </div>

            <div className="company-content">
                <div className="company-card">
                    {/* Back Button */}
                    <button className="back-button" onClick={() => navigate("/register")}>
                        <ArrowLeft size={18} />
                        Back to Individual Sign Up
                    </button>

                    <div className="card-header">
                        <div className="company-logo-header">
                            <img src="/images/signlink.jpg" alt="SignLink Logo" className="company-logo" />
                            <div className="company-badge">
                                <Building size={20} />
                                <span>Company Account</span>
                            </div>
                        </div>
                        <h1 className="company-title">Create Company Account</h1>
                        <p className="company-subtitle">
                            Register your company to unlock team management and enterprise features
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="progress-steps">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>
                            <div className="step-circle">1</div>
                            <span className="step-label">Personal Info</span>
                        </div>
                        <div className="step-connector"></div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-circle">2</div>
                            <span className="step-label">Company Details</span>
                        </div>
                        <div className="step-connector"></div>
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-circle">3</div>
                            <span className="step-label">Review & Submit</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="company-form">
                        {/* Step 1: Personal Information */}
                        {step === 1 && (
                            <div className="form-step">
                                <div className="step-header">
                                    <div className="step-icon">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3>Personal Information</h3>
                                        <p className="step-description">Tell us about yourself</p>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstName" className="form-label">
                                            <User size={16} className="label-icon" />
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            placeholder="Enter your first name"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastName" className="form-label">
                                            <User size={16} className="label-icon" />
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            placeholder="Enter your last name"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">
                                        <Mail size={16} className="label-icon" />
                                        Work Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="you@company.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    />
                                    <p className="input-hint">This will be your primary login email</p>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="role" className="form-label">
                                        <Briefcase size={16} className="label-icon" />
                                        Your Role in Company *
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    >
                                        <option value="">Select your role</option>
                                        {roles.map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">
                                        <Lock size={16} className="label-icon" />
                                        Password *
                                    </label>
                                    <div className="password-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            placeholder="Create a strong password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="form-input password-input"
                                            required
                                            minLength="8"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                    <div className="password-requirements">
                                        <p className="requirement-title">Password must contain:</p>
                                        <ul className="requirement-list">
                                            <li className={formData.password.length >= 8 ? 'met' : ''}>At least 8 characters</li>
                                            <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>One uppercase letter</li>
                                            <li className={/[a-z]/.test(formData.password) ? 'met' : ''}>One lowercase letter</li>
                                            <li className={/\d/.test(formData.password) ? 'met' : ''}>One number</li>
                                            <li className={/[!@#$%^&*]/.test(formData.password) ? 'met' : ''}>One special character</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Company Details */}
                        {step === 2 && (
                            <div className="form-step">
                                <div className="step-header">
                                    <div className="step-icon">
                                        <Building size={24} />
                                    </div>
                                    <div>
                                        <h3>Company Details</h3>
                                        <p className="step-description">Tell us about your company</p>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="companyName" className="form-label">
                                        <Building size={16} className="label-icon" />
                                        Company Legal Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        placeholder="Enter company legal name"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="companyWebsite" className="form-label">
                                            <Globe size={16} className="label-icon" />
                                            Company Website
                                        </label>
                                        <div className="input-with-prefix">
                                            <span className="prefix">https://</span>
                                            <input
                                                type="text"
                                                id="companyWebsite"
                                                name="companyWebsite"
                                                placeholder="yourcompany.com"
                                                value={formData.companyWebsite}
                                                onChange={handleInputChange}
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phoneNumber" className="form-label">
                                            <Phone size={16} className="label-icon" />
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="companySize" className="form-label">
                                            <Users size={16} className="label-icon" />
                                            Company Size *
                                        </label>
                                        <select
                                            id="companySize"
                                            name="companySize"
                                            value={formData.companySize}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            required
                                        >
                                            <option value="">Select company size</option>
                                            {companySizes.map((size) => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="industry" className="form-label">
                                            <Briefcase size={16} className="label-icon" />
                                            Industry *
                                        </label>
                                        <select
                                            id="industry"
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            required
                                        >
                                            <option value="">Select industry</option>
                                            {industries.map((industry) => (
                                                <option key={industry} value={industry}>{industry}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="taxId" className="form-label">
                                        Tax ID / EIN
                                    </label>
                                    <input
                                        type="text"
                                        id="taxId"
                                        name="taxId"
                                        placeholder="Enter Tax ID or EIN (optional)"
                                        value={formData.taxId}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                    <p className="input-hint">Required for invoicing and tax purposes</p>
                                </div>

                                <div className="step-header mt-6">
                                    <div className="step-icon">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3>Company Address</h3>
                                        <p className="step-description">Where is your company located?</p>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="address" className="form-label">
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        placeholder="Enter street address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city" className="form-label">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            placeholder="Enter city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="state" className="form-label">
                                            State / Province
                                        </label>
                                        <select
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        >
                                            <option value="">Select state</option>
                                            {usStates.map((state) => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="zipCode" className="form-label">
                                            ZIP / Postal Code *
                                        </label>
                                        <input
                                            type="text"
                                            id="zipCode"
                                            name="zipCode"
                                            placeholder="Enter ZIP code"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="country" className="form-label">
                                            <Globe2 size={16} className="label-icon" />
                                            Country *
                                        </label>
                                        <select
                                            id="country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            required
                                        >
                                            <option value="">Select country</option>
                                            {countries.map((country) => (
                                                <option key={country} value={country}>{country}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review & Submit */}
                        {step === 3 && (
                            <div className="form-step">
                                <div className="step-header">
                                    <div className="step-icon">
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h3>Review Information</h3>
                                        <p className="step-description">Please review your information before submitting</p>
                                    </div>
                                </div>

                                <div className="review-section">
                                    <div className="review-card">
                                        <h4 className="review-title">Personal Information</h4>
                                        <div className="review-grid">
                                            <div className="review-item">
                                                <span className="review-label">Name:</span>
                                                <span className="review-value">{formData.firstName} {formData.lastName}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Email:</span>
                                                <span className="review-value">{formData.email}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Role:</span>
                                                <span className="review-value">{formData.role}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="review-card">
                                        <h4 className="review-title">Company Information</h4>
                                        <div className="review-grid">
                                            <div className="review-item">
                                                <span className="review-label">Company Name:</span>
                                                <span className="review-value">{formData.companyName}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Website:</span>
                                                <span className="review-value">{formData.companyWebsite ? `https://${formData.companyWebsite}` : 'Not provided'}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Size:</span>
                                                <span className="review-value">{formData.companySize}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Industry:</span>
                                                <span className="review-value">{formData.industry}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Phone:</span>
                                                <span className="review-value">{formData.phoneNumber}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Tax ID:</span>
                                                <span className="review-value">{formData.taxId || 'Not provided'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="review-card">
                                        <h4 className="review-title">Company Address</h4>
                                        <div className="review-grid">
                                            <div className="review-item">
                                                <span className="review-label">Address:</span>
                                                <span className="review-value">{formData.address}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">City:</span>
                                                <span className="review-value">{formData.city}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">State:</span>
                                                <span className="review-value">{formData.state || 'Not provided'}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">ZIP Code:</span>
                                                <span className="review-value">{formData.zipCode}</span>
                                            </div>
                                            <div className="review-item">
                                                <span className="review-label">Country:</span>
                                                <span className="review-value">{formData.country}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="terms-section">
                                    <div className="checkbox-group">
                                        <input type="checkbox" id="terms" required />
                                        <label htmlFor="terms" className="terms-label">
                                            I agree to the <a href="/terms" className="terms-link">Terms of Service</a> and <a href="/privacy" className="terms-link">Privacy Policy</a>
                                        </label>
                                    </div>
                                    <div className="checkbox-group">
                                        <input type="checkbox" id="business-terms" required />
                                        <label htmlFor="business-terms" className="terms-label">
                                            I confirm that I have authority to create this company account and bind the company to our terms
                                        </label>
                                    </div>
                                    <div className="checkbox-group">
                                        <input type="checkbox" id="billing-terms" required />
                                        <label htmlFor="billing-terms" className="terms-label">
                                            I understand that company accounts may have different billing terms and team management features
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="form-navigation">
                            {step > 1 && (
                                <button
                                    type="button"
                                    className="nav-button prev-button"
                                    onClick={prevStep}
                                >
                                    Previous
                                </button>
                            )}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    className="nav-button next-button"
                                    onClick={nextStep}
                                >
                                    Continue to {step === 1 ? 'Company Details' : 'Review'}
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner"></span>
                                            Creating Company Account...
                                        </>
                                    ) : (
                                        'Create Company Account'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="login-section">
                        <p className="login-text">
                            Already have a company account?{" "}
                            <span
                                className="login-link"
                                onClick={() => navigate("/login")}
                            >
                                Sign in
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
        .company-register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        .company-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
        }

        .bg-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
        }

        .shape-1 {
          width: 300px;
          height: 300px;
          top: -100px;
          left: -100px;
        }

        .shape-2 {
          width: 200px;
          height: 200px;
          bottom: -50px;
          right: 10%;
        }

        .shape-3 {
          width: 150px;
          height: 150px;
          top: 20%;
          right: -50px;
        }

        .shape-4 {
          width: 100px;
          height: 100px;
          bottom: 20%;
          left: 5%;
        }

        .company-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 800px;
        }

        .company-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .company-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 0;
          margin-bottom: 24px;
          transition: color 0.3s ease;
        }

        .back-button:hover {
          color: #059669;
        }

        .card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .company-logo-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .company-logo {
          width: 180px;
          height: auto;
          border-radius: 8px;
        }

        .company-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #05966910 0%, #10b98110 100%);
          color: #059669;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid #05966930;
        }

        .company-title {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .company-subtitle {
          color: #64748b;
          font-size: 16px;
          margin: 0;
          font-weight: 500;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Progress Steps */
        .progress-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
          position: relative;
          max-width: 500px;
          margin: 0 auto 40px;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 1;
        }

        .step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .step.active .step-circle {
          background: #059669;
          color: white;
          border-color: #059669;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        .step-label {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
          white-space: nowrap;
          transition: color 0.3s ease;
        }

        .step.active .step-label {
          color: #059669;
          font-weight: 600;
        }

        .step-connector {
          flex: 1;
          height: 2px;
          background: #e2e8f0;
          margin: 0 8px;
          transition: background 0.3s ease;
        }

        .step.active ~ .step-connector,
        .step.active + .step.active ~ .step-connector {
          background: #059669;
        }

        /* Form Steps */
        .form-step {
          margin-bottom: 32px;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .step-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #05966920 0%, #10b98120 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #059669;
        }

        .step-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 4px 0;
        }

        .step-description {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        /* Form Styles */
        .company-form {
          margin-bottom: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 600;
          color: #334155;
          font-size: 14px;
        }

        .label-icon {
          color: #64748b;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: #fafafa;
          font-family: inherit;
        }

        select.form-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23718096' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
          padding-right: 40px;
        }

        .form-input:focus {
          outline: none;
          border-color: #059669;
          background: white;
          box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
          transform: translateY(-2px);
        }

        .form-input::placeholder {
          color: #94a3b8;
        }

        .input-hint {
          font-size: 12px;
          color: #64748b;
          margin: 6px 0 0 0;
          line-height: 1.4;
        }

        .input-with-prefix {
          display: flex;
          align-items: center;
        }

        .prefix {
          padding: 14px 12px 14px 16px;
          background: #f1f5f9;
          border: 2px solid #e2e8f0;
          border-right: none;
          border-radius: 12px 0 0 12px;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .input-with-prefix .form-input {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        /* Password Section */
        .password-wrapper {
          position: relative;
        }

        .password-input {
          padding-right: 80px;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .password-toggle:hover {
          color: #059669;
          background: #f1f5f9;
        }

        .password-requirements {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          margin-top: 12px;
          border: 1px solid #e2e8f0;
        }

        .requirement-title {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin: 0 0 8px 0;
        }

        .requirement-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .requirement-list li {
          font-size: 12px;
          color: #94a3b8;
          position: relative;
          padding-left: 20px;
        }

        .requirement-list li:before {
          content: '○';
          position: absolute;
          left: 0;
          color: #cbd5e1;
        }

        .requirement-list li.met {
          color: #059669;
        }

        .requirement-list li.met:before {
          content: '✓';
          color: #059669;
        }

        /* Review Section */
        .review-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }

        .review-card {
          background: #f8fafc;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e2e8f0;
        }

        .review-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
        }

        .review-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .review-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .review-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .review-value {
          font-size: 15px;
          color: #1e293b;
          font-weight: 500;
        }

        /* Terms Section */
        .terms-section {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
          border: 1px solid #e2e8f0;
        }

        .checkbox-group {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .checkbox-group:last-child {
          margin-bottom: 0;
        }

        .checkbox-group input[type="checkbox"] {
          margin-top: 4px;
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid #cbd5e0;
          cursor: pointer;
          flex-shrink: 0;
        }

        .checkbox-group input[type="checkbox"]:checked {
          background-color: #059669;
          border-color: #059669;
        }

        .terms-label {
          font-size: 14px;
          color: #475569;
          line-height: 1.5;
          cursor: pointer;
        }

        .terms-link {
          color: #059669;
          font-weight: 600;
          text-decoration: none;
        }

        .terms-link:hover {
          text-decoration: underline;
        }

        /* Navigation Buttons */
        .form-navigation {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-top: 32px;
        }

        .nav-button {
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .prev-button {
          background: #f1f5f9;
          color: #64748b;
          border-color: #e2e8f0;
        }

        .prev-button:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }

        .next-button, .submit-button {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          border: none;
          flex: 1;
          max-width: 400px;
          margin-left: auto;
        }

        .next-button:hover, .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .submit-button.loading {
          background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-section {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .login-text {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .login-link {
          color: #059669;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.3s ease;
          text-decoration: none;
        }

        .login-link:hover {
          color: #047857;
          text-decoration: underline;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .company-register-container {
            padding: 16px;
            align-items: flex-start;
          }

          .company-card {
            padding: 30px 24px;
            border-radius: 20px;
            margin: 20px 0;
          }

          .company-title {
            font-size: 26px;
          }

          .progress-steps {
            max-width: 100%;
          }

          .step-label {
            font-size: 11px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .review-grid {
            grid-template-columns: 1fr;
          }

          .requirement-list {
            grid-template-columns: 1fr;
          }

          .form-navigation {
            flex-direction: column;
          }

          .nav-button {
            width: 100%;
            max-width: none;
            margin-left: 0;
          }
        }

        @media (max-width: 480px) {
          .company-card {
            padding: 24px 20px;
          }

          .company-title {
            font-size: 22px;
          }

          .step-header {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .step-header h3 {
            font-size: 18px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none;
          }

          .spinner {
            animation-duration: 2s;
          }
        }
      `}</style>
        </div>
    );
};

export default CompanyRegisterForm;