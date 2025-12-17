import { useState, useRef, useEffect } from "react";
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
  Trash,
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
  const [digitalSignature, setDigitalSignature] = useState(""); // Typed signature
  const [showIPDetailsModal, setShowIPDetailsModal] = useState(false);
  const [ipDetails, setIpDetails] = useState(null);
  const effectiveProposalId = proposalId || parentId;

  // Canvas ref and drawing state
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && showDigitalSignatureModal) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Set drawing style
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000000";

      // Clear canvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctxRef.current = ctx;
    }
  }, [showDigitalSignatureModal]);

  // Start drawing
  const startDrawing = (e) => {
    e.preventDefault();
    if (!ctxRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    let x, y;
    if (e.type.includes('touch')) {
      const touch = e.touches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);

    setLastX(x);
    setLastY(y);
    setIsDrawing(true);
    setHasDrawnSignature(true);
  };

  // Draw
  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing || !ctxRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    let x, y;
    if (e.type.includes('touch')) {
      const touch = e.touches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();

    setLastX(x);
    setLastY(y);
  };

  // Stop drawing
  const stopDrawing = () => {
    if (ctxRef.current) {
      ctxRef.current.closePath();
    }
    setIsDrawing(false);
  };

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (ctx && canvas) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHasDrawnSignature(false);
    }
  };

  // Get signature data URL
  const getSignatureDataURL = () => {
    const canvas = canvasRef.current;
    if (!canvas) return "";

    // Create a new canvas to crop the signature
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Get the bounding box of the signature
    const ctx = ctxRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    // Find the bounds of the drawn content
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    // Add padding
    const padding = 20;
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropWidth = Math.min(width - cropX, maxX - minX + padding * 2);
    const cropHeight = Math.min(height - cropY, maxY - minY + padding * 2);

    // Only crop if we found a signature
    if (cropWidth > 10 && cropHeight > 10) {
      tempCanvas.width = cropWidth;
      tempCanvas.height = cropHeight;
      tempCtx.fillStyle = "#ffffff";
      tempCtx.fillRect(0, 0, cropWidth, cropHeight);
      tempCtx.drawImage(
        canvas,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );
      return tempCanvas.toDataURL("image/png");
    }

    return canvas.toDataURL("image/png");
  };

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

  // Handle Digital Signature (with drawn or typed)
  const handleDigitalSignature = async () => {
    let signatureData = "";
    let signatureType = "";

    // Get drawn signature if exists
    if (hasDrawnSignature) {
      signatureData = getSignatureDataURL();
      signatureType = "drawn";
    } else if (digitalSignature.trim()) {
      signatureData = digitalSignature.trim();
      signatureType = "typed";
    } else {
      toast.error("Please create or type your signature first");
      return;
    }

    if (!signatureData) {
      toast.error("Please create or type your signature first");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        signature_method: "digital",
        digital_signature: signatureData,
        signature: signatureData,
        signature_type: signatureType,
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
            method: "digital",
            type: signatureType
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
        clearCanvas();
        setHasDrawnSignature(false);

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
    // Reset states when modal opens
    setDigitalSignature("");
    setHasDrawnSignature(false);
  };

  // Close digital signature modal
  const closeDigitalSignatureModal = () => {
    setShowDigitalSignatureModal(false);
    setDigitalSignature("");
    clearCanvas();
    setHasDrawnSignature(false);
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

        <Modal.Footer className="border-0 justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={handleCloseDeclineModal}
            disabled={isDeclining}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeclineConfirm}
            disabled={isDeclining || !declineComment.trim() || declineComment.trim().length < 10}
            className="d-flex align-items-center px-4"
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
      <Modal show={showDigitalSignatureModal} onHide={closeDigitalSignatureModal} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0 bg-primary text-white">
          <Modal.Title className="fw-bold">
            <Pen className="me-2" size={24} />
            Create Your Digital Signature
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-4">
          <div className="row g-4">
            {/* Drawing Canvas Section */}
            <div className="col-md-7">
              <div className="mb-3">
                <h6 className="fw-semibold text-primary mb-2">
                  <Pen className="me-2" />
                  Draw Your Signature
                </h6>
                <p className="text-muted small">Draw your signature in the box below using your mouse or finger.</p>
              </div>
              <div
                className="signature-canvas-wrapper border border-secondary-subtle rounded-3 p-3 bg-white position-relative overflow-hidden"
                style={{
                  minHeight: '250px',
                  backgroundColor: '#fafbfc',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-100 h-100"
                  style={{
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    display: 'block',
                    cursor: 'crosshair',
                    touchAction: 'none'
                  }}
                />
                {!hasDrawnSignature && (
                  <div className="position-absolute top-50 start-50 translate-middle text-center text-muted">
                    <Pen size={48} className="mb-2 opacity-75" />
                    <p className="mb-0 fw-light">Draw your signature here</p>
                  </div>
                )}
              </div>
              <div className="d-flex justify-content-between mt-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={clearCanvas}
                  disabled={!hasDrawnSignature}
                  className="d-flex align-items-center"
                >
                  <Trash className="me-1" size={14} />
                  Clear Drawing
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    if (hasDrawnSignature) {
                      toast.success("Signature drawn successfully!");
                    }
                  }}
                  disabled={!hasDrawnSignature}
                  className="d-flex align-items-center"
                >
                  <Check2Circle className="me-1" size={14} />
                  Drawing Complete
                </Button>
              </div>
            </div>

            {/* Typed Signature Section */}
            <div className="col-md-5">
              <div className="mb-3">
                <h6 className="fw-semibold text-primary mb-2">
                  <Pen className="me-2" />
                  Or Type Your Name
                </h6>
                <p className="text-muted small">Enter your full name for a typed digital signature.</p>
              </div>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Type your full name here..."
                  value={digitalSignature}
                  onChange={(e) => setDigitalSignature(e.target.value)}
                  className="form-control-lg text-center fw-semibold border-primary"
                  style={{
                    fontFamily: 'Great Vibes, cursive',
                    fontSize: '1.8rem',
                    minHeight: '60px',
                    borderWidth: '2px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                  maxLength={100}
                />
                <Form.Text className="text-muted text-center w-100">
                  Legally binding digital signature
                </Form.Text>
              </Form.Group>

              {/* Preview */}
              {(hasDrawnSignature || digitalSignature) && (
                <div className="mt-4 p-3 bg-light rounded-2">
                  <h6 className="fw-semibold text-muted mb-2">Signature Preview:</h6>
                  <div className="text-center py-2">
                    <small className="text-muted">
                      {hasDrawnSignature
                        ? "Your drawn signature will be submitted"
                        : `Typed signature: ${digitalSignature}`}
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Signature Instructions */}
          <div className="alert alert-light mt-4 border">
            <div className="row">
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                    <Pen size={16} className="text-primary" />
                  </div>
                  <small className="text-muted">Draw with mouse or touch</small>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                    <Trash size={16} className="text-primary" />
                  </div>
                  <small className="text-muted">Clear if you make a mistake</small>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                    <Clock size={16} className="text-primary" />
                  </div>
                  <small className="text-muted">Automatically timestamped</small>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                    <ShieldCheck size={16} className="text-primary" />
                  </div>
                  <small className="text-muted">Secure and encrypted</small>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 justify-content-between bg-light">
          <Button
            variant="outline-secondary"
            onClick={closeDigitalSignatureModal}
            disabled={isLoading}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDigitalSignature}
            disabled={isLoading || (!hasDrawnSignature && !digitalSignature.trim())}
            className="px-4 d-flex align-items-center fw-semibold"
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Signing Document...
              </>
            ) : (
              <>
                <Pen className="me-2" size={18} />
                Apply Digital Signature
                <ArrowRight className="ms-2" size={18} />
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

        <Modal.Footer className="border-0 justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={() => setShowIPDetailsModal(false)}
            disabled={isLoading}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="info"
            onClick={handleIPVerificationSigning}
            disabled={isLoading}
            className="d-flex align-items-center px-4"
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
      <Card className="shadow-lg signature-action-card border-0 overflow-hidden">
        <Card.Body className="p-4 p-md-5 bg-white">
          <div className="text-center mb-4 mb-md-5">
            <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex p-3 p-md-4 mb-3 mx-auto">
              <ShieldCheck size={32} className="text-primary" />
            </div>
            <h2 className="fw-bold text-dark mb-2">Secure Document Signing</h2>
            <p className="text-muted lead">Choose your preferred method. All signatures are legally binding, encrypted, and audit-trail protected.</p>
          </div>

          <Row className="g-3 g-md-4 mb-4 mb-md-5 justify-content-center">
            {/* BankID Signing */}
            <Col xs={12} md={4}>
              <Card className="h-100 border-0 shadow-sm hover-lift transition-all bg-white rounded-3">
                <Card.Body className="text-center p-3 p-md-4 d-flex flex-column">
                  <div className="mb-3 mb-md-4 flex-shrink-0">
                    <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex p-2 p-md-3 mx-auto">
                      <Fingerprint size={24} className="text-success" />
                    </div>
                  </div>
                  <h5 className="fw-bold text-dark mb-2 mb-md-3">BANKID Signing</h5>
                  <p className="text-muted small mb-3 mb-md-4 flex-grow-1">Sweden's premier eID – highest legal validity & instant verification</p>

                  <ul className="text-start mb-3 mb-md-4 list-unstyled flex-grow-1">
                    <li className="d-flex align-items-center mb-2">
                      <PersonCheck size={16} className="text-success me-3 flex-shrink-0" />
                      <small className="text-dark">Government-backed ID</small>
                    </li>
                    <li className="d-flex align-items-center mb-2">
                      <ShieldCheck size={16} className="text-success me-3 flex-shrink-0" />
                      <small className="text-dark">Bank-grade security</small>
                    </li>
                    <li className="d-flex align-items-center">
                      <Clock size={16} className="text-success me-3 flex-shrink-0" />
                      <small className="text-dark">Mobile app ready</small>
                    </li>
                  </ul>

                  <Button
                    onClick={handleBankIDSigning}
                    disabled={isLoading}
                    variant="success"
                    className="w-100 d-flex align-items-center justify-content-center py-3 fw-semibold rounded-2 flex-shrink-0 mt-auto"
                    style={{
                      background: 'linear-gradient(135deg, #198754 0%, #157347 100%)',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(25, 135, 84, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <span className="position-relative z-2 d-flex align-items-center">
                      {isLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Preparing Secure Sign...
                        </>
                      ) : (
                        <>
                          Sign with BankID
                          <ArrowRight className="ms-2" size={18} />
                        </>
                      )}
                    </span>
                    <span className="position-absolute top-0 start-0 w-100 h-100 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></span>
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* Digital Signature */}
            <Col xs={12} md={4}>
              <Card className="h-100 border-0 shadow-sm hover-lift transition-all bg-white rounded-3">
                <Card.Body className="text-center p-3 p-md-4 d-flex flex-column">
                  <div className="mb-3 mb-md-4 flex-shrink-0">
                    <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex p-2 p-md-3 mx-auto">
                      <Pen size={24} className="text-primary" />
                    </div>
                  </div>
                  <h5 className="fw-bold text-dark mb-2 mb-md-3">Digital Signature</h5>
                  <p className="text-muted small mb-3 mb-md-4 flex-grow-1">Hand-drawn or typed – elegant, timestamped, and verifiable</p>

                  <ul className="text-start mb-3 mb-md-4 list-unstyled flex-grow-1">
                    <li className="d-flex align-items-center mb-2">
                      <Pen size={16} className="text-primary me-3 flex-shrink-0" />
                      <small className="text-dark">Custom drawing pad</small>
                    </li>
                    <li className="d-flex align-items-center mb-2">
                      <Clock size={16} className="text-primary me-3 flex-shrink-0" />
                      <small className="text-dark">Real-time timestamp</small>
                    </li>
                    <li className="d-flex align-items-center">
                      <HddStack size={16} className="text-primary me-3 flex-shrink-0" />
                      <small className="text-dark">Complete audit log</small>
                    </li>
                  </ul>

                  <Button
                    onClick={showDigitalSignatureModalHandler}
                    disabled={isLoading}
                    variant="primary"
                    className="w-100 d-flex align-items-center justify-content-center py-3 fw-semibold rounded-2 flex-shrink-0 mt-auto"
                    style={{
                      background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(13, 110, 253, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <span className="position-relative z-2 d-flex align-items-center">
                      <Pen className="me-2" size={18} />
                      Create Signature
                    </span>
                    <span className="position-absolute top-0 start-0 w-100 h-100 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></span>
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* IP Verification */}
            <Col xs={12} md={4}>
              <Card className="h-100 border-0 shadow-sm hover-lift transition-all bg-white rounded-3">
                <Card.Body className="text-center p-3 p-md-4 d-flex flex-column">
                  <div className="mb-3 mb-md-4 flex-shrink-0">
                    <div className="rounded-circle bg-info bg-opacity-10 d-inline-flex p-2 p-md-3 mx-auto">
                      <Globe size={24} className="text-info" />
                    </div>
                  </div>
                  <h5 className="fw-bold text-dark mb-2 mb-md-3">IP Verification</h5>
                  <p className="text-muted small mb-3 mb-md-4 flex-grow-1">Geolocated signing with device fingerprinting</p>

                  <ul className="text-start mb-3 mb-md-4 list-unstyled flex-grow-1">
                    <li className="d-flex align-items-center mb-2">
                      <GeoAlt size={16} className="text-info me-3 flex-shrink-0" />
                      <small className="text-dark">Precise location data</small>
                    </li>
                    <li className="d-flex align-items-center mb-2">
                      <Laptop size={16} className="text-info me-3 flex-shrink-0" />
                      <small className="text-dark">Device profiling</small>
                    </li>
                    <li className="d-flex align-items-center">
                      <Clock size={16} className="text-info me-3 flex-shrink-0" />
                      <small className="text-dark">Immutable timestamp</small>
                    </li>
                  </ul>

                  <div className="d-flex gap-3 flex-shrink-0 mt-auto">
                    <Button
                      variant="outline-info"
                      className="flex-fill py-3 fw-semibold rounded-2"
                      onClick={showIPVerificationModal}
                      disabled={isLoading}
                      style={{
                        background: 'transparent',
                        border: '2px solid #0dcaf0',
                        color: '#0dcaf0',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(13, 202, 240, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(13, 202, 240, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Eye className="me-2" size={16} />
                      Review Details
                    </Button>
                    <Button
                      onClick={showIPVerificationModal}
                      disabled={isLoading}
                      variant="info"
                      className="flex-fill py-3 fw-semibold rounded-2"
                      style={{
                        background: 'linear-gradient(135deg, #0dcaf0 0%, #0baccc 100%)',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(13, 202, 240, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <span className="position-relative z-2 d-flex align-items-center justify-content-center">
                        <Globe className="me-2" size={16} />
                        Sign via IP
                      </span>
                      <span className="position-absolute top-0 start-0 w-100 h-100 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></span>
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Decline Section */}
          <div className="text-center mt-4 mt-md-5 pt-4 pt-md-4 border-top border-light">
            <h6 className="fw-bold text-muted mb-3">Not ready to sign?</h6>
            <p className="text-muted small mb-3 mb-md-4">You can decline with a detailed reason for the record.</p>
            <Button
              onClick={handleDeclineClick}
              variant="outline-danger"
              size="lg"
              className="px-5 py-3 fw-semibold rounded-2"
              disabled={isLoading}
              style={{
                background: 'transparent',
                border: '2px solid #dc3545',
                color: '#dc3545',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(220, 53, 69, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span className="position-relative z-2 d-flex align-items-center justify-content-center">
                <XCircle className="me-2" size={20} />
                Decline This Proposal
              </span>
            </Button>
          </div>

          {/* Security Badges */}
          <div className="mt-4 mt-md-5 pt-4 pt-md-4 border-top border-light text-center">
            <div className="row g-2 g-md-3 justify-content-center">
              <div className="col-auto">
                <small className="text-muted d-flex align-items-center justify-content-center">
                  <Lock size={14} className="me-1 text-primary" />
                  AES-256 Encryption
                </small>
              </div>
              <div className="col-auto">
                <small className="text-muted d-flex align-items-center justify-content-center">
                  <ShieldCheck size={14} className="me-1 text-success" />
                  GDPR & eIDAS Compliant
                </small>
              </div>
              <div className="col-auto">
                <small className="text-muted d-flex align-items-center justify-content-center">
                  <Clock size={14} className="me-1 text-info" />
                  Blockchain-Ready Audit Trail
                </small>
              </div>
            </div>
          </div>
        </Card.Body>

        {/* Custom Styles */}
        <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
    
    .bg-primary {
      --bs-btn-bg: #0d6efd;
      --bs-btn-border-color: #0d6efd;
      --bs-btn-hover-bg: #0b5ed7;
      --bs-btn-hover-border-color: #0a58ca;
    }
    
    .shadow-lg {
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    }
    
    .shadow-sm {
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    
    .hover-lift:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 32px rgba(0,0,0,0.12) !important;
    }
    
    .transition-all {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .signature-canvas-wrapper {
      transition: box-shadow 0.3s ease;
    }
    
    .signature-canvas-wrapper:hover {
      box-shadow: inset 0 2px 8px rgba(0,0,0,0.08);
    }
    
    canvas {
      touch-action: none;
    }
    
    .d-flex.flex-column .flex-grow-1 {
      min-height: 0;
    }
    
    /* Modern button hover effects */
    .btn-success, .btn-primary, .btn-info {
      transition: all 0.3s ease !important;
    }
    
    .btn-success:hover:not(:disabled),
    .btn-primary:hover:not(:disabled),
    .btn-info:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.2) !important;
    }
    
    .btn-success:active:not(:disabled),
    .btn-primary:active:not(:disabled),
    .btn-info:active:not(:disabled) {
      transform: translateY(0);
      transition-duration: 0.1s;
    }
    
    /* Pulse animation for loading states */
    @keyframes pulse-glow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .btn:disabled {
      opacity: 0.7;
      animation: pulse-glow 2s infinite;
    }
    
    /* Button focus states */
    .btn:focus:not(:disabled) {
      outline: 2px solid rgba(13, 110, 253, 0.5);
      outline-offset: 2px;
    }
    
    @media (max-width: 768px) {
      .signature-action-card {
        margin: 0 -1rem;
        border-radius: 0;
      }
      
      .signature-action-card .card-body {
        padding: 1.5rem 1rem !important;
      }
      
      .d-flex.gap-3 {
        flex-direction: column;
        gap: 0.75rem !important;
      }
      
      .d-flex.gap-3 button {
        width: 100%;
      }
      
      .signature-canvas-wrapper {
        min-height: 200px;
      }
      
      .row.g-3.g-md-4 > [class*="col-"] {
        margin-bottom: 1rem;
      }
    }
    
    @media (max-width: 576px) {
      .modal-footer,
      .modal-header {
        padding-left: 1rem;
        padding-right: 1rem;
      }
      
      .btn {
        font-size: 0.875rem;
        padding: 0.75rem 1rem !important;
      }
    }
  `}</style>
      </Card>
    </>
  );
}