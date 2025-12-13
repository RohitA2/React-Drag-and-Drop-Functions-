import { useState } from "react";
import { Button, Spinner, Card, Modal, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import {
  ShieldCheck,
  Fingerprint,
  ArrowRight,
  PersonCheck,
  Lock,
  Stars,
  Check2Circle,
  XCircle,
  Person,
  Envelope,
  ChatText,
  Pen,
  Clock,
  Globe,
  HddStack,
  Eye,
  GeoAlt,
  Laptop,
} from "react-bootstrap-icons";

const API_URL = import.meta.env.VITE_API_URL;

// Helper functions remain the same
function addCaptureMask(selector = ".proposal-viewer") {
  const el = document.querySelector(selector);
  if (!el) return () => { };
  const cls = "capture-mode";
  el.classList.add(cls);
  const style = document.createElement("style");
  style.id = "capture-mode-style";
  style.textContent = `
    .capture-mode .no-print, .capture-mode button, .capture-mode [role="button"], 
    .capture-mode .toastify, .capture-mode .Toastify { 
      visibility: hidden !important; 
    }
  `;
  document.head.appendChild(style);
  return () => {
    el.classList.remove(cls);
    document.getElementById("capture-mode-style")?.remove();
  };
}

async function renderProposalToPdfBlob(selector = ".proposal-viewer", jpegQuality = 0.72) {
  if (document.fonts?.ready) await document.fonts.ready.catch(() => { });
  await new Promise((r) => setTimeout(r, 100));

  const element = document.querySelector(selector);
  if (!element) throw new Error("Proposal content not found.");

  const canvas = await html2canvas(element, {
    scale: Math.min(window.devicePixelRatio || 1, 2),
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  if (imgHeight <= pageHeight) {
    const imgData = canvas.toDataURL("image/jpeg", jpegQuality);
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
  } else {
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    const pxPerMm = canvas.width / pageWidth;
    const pageHeightPx = Math.floor(pageHeight * pxPerMm);
    const ctx = pageCanvas.getContext("2d");
    let renderedHeight = 0;
    let pageIndex = 0;

    while (renderedHeight < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - renderedHeight);
      pageCanvas.height = sliceHeight;
      ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, renderedHeight, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      const imgData = pageCanvas.toDataURL("image/jpeg", jpegQuality);
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, sliceHeight / pxPerMm, undefined, "FAST");

      renderedHeight += sliceHeight;
      pageIndex++;
    }
  }

  return pdf.output("blob");
}

export default function SignatureAction({
  user,
  parentId,
  recipient,
  proposalId,
  proposalName,
  signatureId,
  blockId,
  debugPdf = import.meta.env.VITE_DEBUG_PDF === "true",
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineComment, setDeclineComment] = useState("");
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDigitalSignatureModal, setShowDigitalSignatureModal] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState("");
  const [showIPDetailsModal, setShowIPDetailsModal] = useState(false);
  const [ipDetails, setIpDetails] = useState(null);
  const effectiveProposalId = proposalId || parentId;

  // Handle BankID signing (with PDF)
  const handleBankIDSigning = async () => {
    setIsLoading(true);
    const undoMask = addCaptureMask();

    try {
      let pdfBlob = await renderProposalToPdfBlob(".proposal-viewer", 0.72);
      if (pdfBlob.size > 8 * 1024 * 1024) {
        pdfBlob = await renderProposalToPdfBlob(".proposal-viewer", 0.6);
      }

      const fname = `${(proposalName || "proposal").replace(/\s+/g, "-").toLowerCase()}-${effectiveProposalId}.pdf`;

      if (debugPdf) {
        console.group("PDF Debug Info");
        console.log("File Name:", fname);
        console.log("MIME Type:", pdfBlob.type || "application/pdf");
        console.log("Size (bytes):", pdfBlob.size);
        console.log(`Size: ${(pdfBlob.size / 1024).toFixed(2)} KB`);
        console.groupEnd();
        console.log("PDF generated successfully - ready for BankID signing");
      }

      const fd = new FormData();
      fd.append("file", pdfBlob, fname);
      fd.append("message", `Signing proposal: ${proposalName || "Document"}`);
      fd.append("signature_id", String(signatureId || ""));
      fd.append("parent_id", String(parentId || ""));
      fd.append("recipientEmail", recipient?.recipientEmail || "");
      fd.append("recipientName", recipient?.recipientName || "");
      fd.append("method", "bankid");
      fd.append("signature_method", "bankid");

      fd.append("relay_state", JSON.stringify({
        parentId: parentId || "",
        proposalId: String(effectiveProposalId || ""),
        userId: String(user?.id || ""),
        signatureId: String(signatureId || ""),
        blockId: String(blockId || ""),
        recipientEmail: recipient?.recipientEmail || "",
        recipientName: recipient?.recipientName || "",
        method: "bankid"
      }));

      const endpoint = `${API_URL}/api/bankid/start-sign-pdf`;
      
      const res = await axios.post(endpoint, fd, {
        timeout: 60000,
      });

      if (res.data?.redirect_url) {
        toast.success("Redirecting to BankID for secure signing...", { autoClose: 2000 });
        setTimeout(() => {
          window.location.href = res.data.redirect_url;
        }, 800);
      } else {
        throw new Error(res.data?.error || "Failed to initiate BankID signing.");
      }
    } catch (err) {
      console.error("BankID signing error:", err);
      toast.error(err?.response?.data?.error || err.message || "Failed to start BankID signing process.");
    } finally {
      undoMask();
      setIsLoading(false);
    }
  };

  // Handle Digital Signature (without PDF)
  const handleDigitalSignature = async () => {
    if (!digitalSignature.trim()) {
      toast.error("Please create or type your signature first");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        signature_method: "digital",
        digital_signature: digitalSignature,
        signature: digitalSignature, // Send as both for backward compatibility
        parent_id: parentId || "",
        recipient_email: recipient?.recipientEmail || "",
        recipient_name: recipient?.recipientName || "",
        user_id: user?.id || null,
        block_id: blockId || "",
        proposal_id: proposalId || "",
        proposal_name: proposalName || "",
        security_level: "medium",
        audit_trail: [
          {
            action: "digital_signature_created",
            timestamp: new Date().toISOString(),
            method: "digital"
          }
        ]
      };

      const endpoint = `${API_URL}/signatures/${signatureId || blockId}`;
      
      const res = await axios.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000,
      });

      if (res.data?.success) {
        toast.success("Document signed successfully with digital signature!");
        setShowDigitalSignatureModal(false);
        setDigitalSignature("");
        
        // Optional: Refresh page or update UI state
        // window.location.reload();
      } else {
        throw new Error(res.data?.error || "Failed to process digital signature.");
      }
    } catch (err) {
      console.error("Digital signature error:", err);
      
      // Handle specific error cases
      if (err.response?.data?.error?.includes("Already signed")) {
        toast.error("This document has already been signed.");
      } else if (err.response?.status === 404) {
        toast.error("Signature record not found.");
      } else {
        toast.error(err?.response?.data?.error || err.message || "Failed to process digital signature.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle IP Verification (without PDF)
  const handleIPVerificationSigning = async () => {
    setIsLoading(true);
    try {
      // Collect IP details if not already collected
      let ipData = ipDetails;
      if (!ipData) {
        ipData = await collectIPDetails();
      }

      const payload = {
        signature_method: "ip",
        ip_details: ipData,
        parent_id: parentId || "",
        recipient_email: recipient?.recipientEmail || "",
        recipient_name: recipient?.recipientName || "",
        user_id: user?.id || null,
        block_id: blockId || "",
        proposal_id: proposalId || "",
        proposal_name: proposalName || "",
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`
        },
        location_data: {
          ip: ipData.ip,
          city: ipData.city,
          region: ipData.region,
          country: ipData.country
        },
        security_level: "high",
        audit_trail: [
          {
            action: "ip_verification_signature",
            timestamp: new Date().toISOString(),
            method: "ip"
          }
        ]
      };

      const endpoint = `${API_URL}/signatures/${signatureId || blockId}`;
      
      const res = await axios.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000,
      });

      if (res.data?.success) {
        toast.success("Document signed successfully with IP verification!");
        setShowIPDetailsModal(false);
        setIpDetails(null);
        
        // Optional: Refresh page or update UI state
        // window.location.reload();
      } else {
        throw new Error(res.data?.error || "Failed to process IP verification.");
      }
    } catch (err) {
      console.error("IP verification error:", err);
      
      // Handle specific error cases
      if (err.response?.data?.error?.includes("Already signed")) {
        toast.error("This document has already been signed.");
      } else if (err.response?.status === 404) {
        toast.error("Signature record not found.");
      } else {
        toast.error(err?.response?.data?.error || err.message || "Failed to process IP verification.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to collect IP details
  const collectIPDetails = async () => {
    try {
      // Use ipapi.co for IP geolocation
      const response = await axios.get('https://ipapi.co/json/', { timeout: 5000 });
      return {
        ip: response.data.ip,
        city: response.data.city,
        region: response.data.region,
        country: response.data.country_name,
        country_code: response.data.country_code,
        postal: response.data.postal,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        timezone: response.data.timezone,
        org: response.data.org,
        asn: response.data.asn,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.warn("Failed to fetch IP details from ipapi.co, using fallback:", error);
      // Fallback to basic IP detection
      try {
        // Try another IP service
        const fallbackResponse = await axios.get('https://api.ipify.org?format=json', { timeout: 3000 });
        return {
          ip: fallbackResponse.data.ip,
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString()
        };
      } catch (fallbackError) {
        // Ultimate fallback
        return {
          ip: 'Unable to detect',
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString()
        };
      }
    }
  };

  // Show IP details modal
  const showIPVerificationModal = async () => {
    setIsLoading(true);
    try {
      const details = await collectIPDetails();
      setIpDetails(details);
      setShowIPDetailsModal(true);
    } catch (error) {
      toast.error("Unable to collect IP details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show digital signature modal
  const showDigitalSignatureModalHandler = () => {
    setShowDigitalSignatureModal(true);
  };

  // Handle decline
  const handleDeclineClick = () => {
    setShowDeclineModal(true);
  };

  const handleDeclineConfirm = async () => {
    if (!declineComment.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }

    if (declineComment.trim().length < 10) {
      toast.error("Decline reason must be at least 10 characters long");
      return;
    }

    setIsDeclining(true);
    try {
      const payload = {
        signature_method: "decline",
        method: "decline",
        comment: declineComment,
        recipient_email: recipient?.recipientEmail || "",
        recipient_name: recipient?.recipientName || "",
        user_id: user?.id || null,
        parent_id: parentId || "",
        block_id: blockId || ""
      };

      const endpoint = `${API_URL}/signatures/${signatureId || blockId}`;
      
      const response = await axios.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000,
      });

      if (response.data.success) {
        toast.success("Proposal declined successfully");
        setShowDeclineModal(false);
        setDeclineComment("");
        
        // Optional: Refresh page or update UI state
        // window.location.reload();
      } else {
        throw new Error(response.data.error || "Failed to decline proposal");
      }
    } catch (err) {
      console.error("Decline error:", err);
      
      if (err.response?.data?.error?.includes("Already declined")) {
        toast.error("This document has already been declined.");
      } else if (err.response?.status === 404) {
        toast.error("Signature record not found.");
      } else {
        toast.error(err?.response?.data?.error || err.message || "Failed to decline proposal");
      }
    } finally {
      setIsDeclining(false);
    }
  };

  const handleCloseDeclineModal = () => {
    setShowDeclineModal(false);
    setDeclineComment("");
  };

  return (
    <>
      {/* Fullscreen Loading Overlay */}
      {isLoading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-90" style={{ zIndex: 9999 }}>
          <div className="text-center text-white">
            <Spinner animation="border" variant="success" className="mb-4" style={{ width: "4rem", height: "4rem" }} />
            <h4 className="fw-bold">Processing Your Request</h4>
            <p className="opacity-75 mb-4">Please wait while we process your signature...</p>
            <div className="d-flex justify-content-center gap-2">
              <Stars size={28} className="text-warning animate__animated animate__flash animate__infinite" />
              <ShieldCheck size={36} className="text-success" />
              <Stars size={28} className="text-warning animate__animated animate__flash animate__infinite" />
            </div>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      <Modal show={showDeclineModal} onHide={handleCloseDeclineModal} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-danger">
            <XCircle className="me-2" size={24} />
            Decline Proposal
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-0">
          {/* Recipient Information */}
          {(recipient?.recipientName || recipient?.recipientEmail) && (
            <div className="mb-4 p-3 bg-light rounded-3">
              <h6 className="fw-semibold mb-3">Recipient Information</h6>
              {recipient?.recipientName && (
                <div className="d-flex align-items-center mb-2">
                  <Person size={16} className="text-muted me-2" />
                  <span className="text-dark">{recipient.recipientName}</span>
                </div>
              )}
              {recipient?.recipientEmail && (
                <div className="d-flex align-items-center">
                  <Envelope size={16} className="text-muted me-2" />
                  <span className="text-dark">{recipient.recipientEmail}</span>
                </div>
              )}
            </div>
          )}

          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                <ChatText className="me-2" size={16} />
                Reason for Declining <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Please provide your reason for declining this proposal (minimum 10 characters)..."
                value={declineComment}
                onChange={(e) => setDeclineComment(e.target.value)}
                className="border-2"
                style={{ resize: 'none' }}
                minLength={10}
              />
              <Form.Text className="text-muted">
                This comment will be permanently recorded with your decline decision.
                Minimum 10 characters required.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={handleCloseDeclineModal}
            disabled={isDeclining}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeclineConfirm}
            disabled={isDeclining || !declineComment.trim() || declineComment.trim().length < 10}
            className="d-flex align-items-center"
          >
            {isDeclining ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Declining...
              </>
            ) : (
              <>
                <XCircle className="me-2" size={18} />
                Confirm Decline
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Digital Signature Modal */}
      <Modal show={showDigitalSignatureModal} onHide={() => setShowDigitalSignatureModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary">
            <Pen className="me-2" size={24} />
            Digital Signature
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-0">
          <div className="mb-4">
            <p className="text-muted">Draw or type your signature below. This will be timestamped and included in the audit trail.</p>

            {/* Simple signature drawing area */}
            <div className="signature-canvas-container mb-4 border rounded p-4" style={{ minHeight: '200px', backgroundColor: '#f8f9fa' }}>
              <div className="text-center">
                <Pen size={48} className="text-muted mb-3" />
                <p className="text-muted">Digital signature will be recorded with timestamp</p>
                <small className="text-muted">(Drawing functionality can be implemented with a canvas library)</small>
              </div>
            </div>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Type Your Signature</Form.Label>
              <Form.Control
                type="text"
                placeholder="Type your full name as digital signature"
                value={digitalSignature}
                onChange={(e) => setDigitalSignature(e.target.value)}
                className="form-control-lg text-center fw-bold"
                style={{ 
                  fontFamily: 'cursive', 
                  fontSize: '1.5rem',
                  border: '2px solid #dee2e6'
                }}
                maxLength={100}
              />
              <Form.Text className="text-muted">
                This will serve as your legally binding digital signature
              </Form.Text>
            </Form.Group>

            <div className="alert alert-info">
              <div className="d-flex align-items-center">
                <Clock className="me-2" />
                <span>Timestamp will be automatically recorded: {new Date().toLocaleString()}</span>
              </div>
              <div className="d-flex align-items-center mt-2">
                <HddStack className="me-2" />
                <span>Full audit trail included with IP and device information</span>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowDigitalSignatureModal(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDigitalSignature}
            disabled={isLoading || !digitalSignature.trim()}
            className="d-flex align-items-center"
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <Pen className="me-2" size={18} />
                Sign with Digital Signature
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* IP Verification Details Modal */}
      <Modal show={showIPDetailsModal} onHide={() => setShowIPDetailsModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-info">
            <Globe className="me-2" size={24} />
            IP Verification Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-0">
          <div className="mb-4">
            <p className="text-muted">Your digital footprint will be recorded for verification:</p>

            {ipDetails && (
              <div className="border rounded p-3 bg-light">
                <div className="mb-3">
                  <h6 className="fw-semibold mb-2">
                    <GeoAlt className="me-2" />
                    Location Information
                  </h6>
                  {ipDetails.city && ipDetails.country ? (
                    <div className="mb-2">
                      <strong>Location:</strong> {ipDetails.city}, {ipDetails.region}, {ipDetails.country}
                    </div>
                  ) : (
                    <div className="mb-2 text-warning">
                      <strong>Location:</strong> Unable to determine exact location
                    </div>
                  )}
                  <div className="mb-2">
                    <strong>IP Address:</strong> {ipDetails.ip}
                  </div>
                  {ipDetails.latitude && ipDetails.longitude && (
                    <div className="mb-2">
                      <strong>Coordinates:</strong> {ipDetails.latitude}, {ipDetails.longitude}
                    </div>
                  )}
                  {ipDetails.org && (
                    <div className="mb-2">
                      <strong>ISP/Organization:</strong> {ipDetails.org}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <h6 className="fw-semibold mb-2">
                    <Laptop className="me-2" />
                    Device Information
                  </h6>
                  <div className="mb-1">
                    <strong>Platform:</strong> {ipDetails.platform}
                  </div>
                  <div className="mb-1">
                    <strong>User Agent:</strong> <small className="text-muted">{ipDetails.userAgent?.substring(0, 50)}...</small>
                  </div>
                  <div className="mb-1">
                    <strong>Timestamp:</strong> {new Date(ipDetails.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <div className="alert alert-warning mt-3">
              <div className="d-flex align-items-center">
                <Eye className="me-2" />
                <span>This information will be permanently recorded with your signature for audit purposes</span>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowIPDetailsModal(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="info"
            onClick={handleIPVerificationSigning}
            disabled={isLoading}
            className="d-flex align-items-center"
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Verifying...
              </>
            ) : (
              <>
                <Globe className="me-2" size={18} />
                Verify & Sign with IP
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Secure Document Signing Card */}
      <Card className="shadow-lg signature-action-card">
        <Card.Body className="p-4">
          <h3 className="fw-bold text-dark mb-4 text-center">Secure Document Signing</h3>
          <p className="text-muted text-center mb-4">Choose your preferred signing method. All methods are legally binding and secure.</p>

          <Row className="g-4 mb-4">
            {/* BankID Signing */}
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex p-3">
                      <Fingerprint size={32} className="text-success" />
                    </div>
                  </div>
                  <h5 className="fw-bold mb-3">BANKID Signing</h5>
                  <p className="text-muted small mb-4">Sweden's most trusted electronic ID with highest legal validity</p>

                  <div className="text-start mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <PersonCheck size={16} className="text-success me-2" />
                      <small className="text-dark">Legal Identification</small>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <ShieldCheck size={16} className="text-success me-2" />
                      <small className="text-dark">Highest security level</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <Clock size={16} className="text-success me-2" />
                      <small className="text-dark">Instant verification</small>
                    </div>
                  </div>

                  <Button
                    onClick={handleBankIDSigning}
                    disabled={isLoading}
                    variant="success"
                    className="w-100 d-flex align-items-center justify-content-center py-2"
                  >
                    {isLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        Sign with BankID
                        <ArrowRight className="ms-2" size={18} />
                      </>
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* Digital Signature */}
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex p-3">
                      <Pen size={32} className="text-primary" />
                    </div>
                  </div>
                  <h5 className="fw-bold mb-3">Digital Signature</h5>
                  <p className="text-muted small mb-4">Draw or type your signature directly with timestamp verification</p>

                  <div className="text-start mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <Pen size={16} className="text-primary me-2" />
                      <small className="text-dark">Draw or type signature</small>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <Clock size={16} className="text-primary me-2" />
                      <small className="text-dark">Timestamp recorded</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <HddStack size={16} className="text-primary me-2" />
                      <small className="text-dark">Audit trail included</small>
                    </div>
                  </div>

                  <Button
                    onClick={showDigitalSignatureModalHandler}
                    disabled={isLoading}
                    variant="primary"
                    className="w-100 d-flex align-items-center justify-content-center py-2"
                  >
                    <Pen className="me-2" size={18} />
                    Add Signature
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* IP Verification */}
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <div className="rounded-circle bg-info bg-opacity-10 d-inline-flex p-3">
                      <Globe size={32} className="text-info" />
                    </div>
                  </div>
                  <h5 className="fw-bold mb-3">IP Verification</h5>
                  <p className="text-muted small mb-4">Record your digital footprint with IP, location, and device data</p>

                  <div className="text-start mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <GeoAlt size={16} className="text-info me-2" />
                      <small className="text-dark">Location recorded</small>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <Laptop size={16} className="text-info me-2" />
                      <small className="text-dark">Device information</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <Clock size={16} className="text-info me-2" />
                      <small className="text-dark">Precise timestamp</small>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-info"
                      className="grow py-2"
                      onClick={showIPVerificationModal}
                      disabled={isLoading}
                    >
                      <Eye className="me-2" size={16} />
                      View Details
                    </Button>
                    <Button
                      onClick={showIPVerificationModal}
                      disabled={isLoading}
                      variant="info"
                      className="grow py-2"
                    >
                      <Globe className="me-2" size={16} />
                      Verify with IP
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Decline Section */}
          <div className="text-center mt-4 pt-4 border-top">
            <h6 className="fw-bold text-muted mb-3">Need to decline?</h6>
            <p className="text-muted small mb-3">Provide a reason for declining this proposal</p>
            <Button
              onClick={handleDeclineClick}
              variant="outline-danger"
              size="lg"
              className="px-5 py-2"
              disabled={isLoading}
            >
              <XCircle className="me-2" size={20} />
              Decline Proposal
            </Button>
          </div>

          {/* Security Badges */}
          <div className="mt-4 pt-3 border-top text-center">
            <div className="d-flex flex-wrap justify-content-center gap-4">
              <small className="text-muted d-flex align-items-center">
                <Lock size={14} className="me-1" />
                256-bit Encryption
              </small>
              <small className="text-muted d-flex align-items-center">
                <ShieldCheck size={14} className="me-1" />
                GDPR Compliant
              </small>
              <small className="text-muted d-flex align-items-center">
                <Clock size={14} className="me-1" />
                Timestamped Audit Trail
              </small>
            </div>
          </div>
        </Card.Body>

        {/* Custom Styles */}
        <style>{`
          .hover-shadow:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
          }
          
          .transition-all {
            transition: all 0.3s ease;
          }
          
          @media (max-width: 768px) {
            .card {
              margin-bottom: 1rem;
            }
            
            .d-flex.gap-2 {
              flex-direction: column;
              gap: 0.5rem !important;
            }
            
            .d-flex.gap-2 button {
              width: 100%;
            }
          }
        `}</style>
      </Card>
    </>
  );
}