// import { useState } from "react";
// import { Button, Spinner } from "react-bootstrap";
// import axios from "axios";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import { toast } from "react-toastify";

// const API_URL = import.meta.env.VITE_API_URL;

// // Helper: Add capture mask to hide UI elements during PDF render
// function addCaptureMask(selector = ".proposal-viewer") {
//   const el = document.querySelector(selector);
//   if (!el) return () => { };
//   const cls = "capture-mode";
//   el.classList.add(cls);
//   const style = document.createElement("style");
//   style.id = "capture-mode-style";
//   style.textContent = `
//     .capture-mode .no-print, .capture-mode button, .capture-mode [role="button"], 
//     .capture-mode .toastify, .capture-mode .Toastify { 
//       visibility: hidden !important; 
//     }
//   `;
//   document.head.appendChild(style);
//   return () => {
//     el.classList.remove(cls);
//     document.getElementById("capture-mode-style")?.remove();
//   };
// }

// // Render proposal to PDF Blob (multi-page support)
// async function renderProposalToPdfBlob(selector = ".proposal-viewer", jpegQuality = 0.72) {
//   if (document.fonts?.ready) await document.fonts.ready.catch(() => { });
//   await new Promise((r) => setTimeout(r, 100));

//   const element = document.querySelector(selector);
//   if (!element) throw new Error("Proposal content not found.");

//   const canvas = await html2canvas(element, {
//     scale: Math.min(window.devicePixelRatio || 1, 2),
//     useCORS: true,
//     backgroundColor: "#ffffff",
//     logging: false,
//   });

//   const pdf = new jsPDF("p", "mm", "a4");
//   const pageWidth = pdf.internal.pageSize.getWidth();
//   const pageHeight = pdf.internal.pageSize.getHeight();
//   const imgWidth = pageWidth;
//   const imgHeight = (canvas.height * pageWidth) / canvas.width;

//   if (imgHeight <= pageHeight) {
//     const imgData = canvas.toDataURL("image/jpeg", jpegQuality);
//     pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
//   } else {
//     // Multi-page logic
//     const pageCanvas = document.createElement("canvas");
//     pageCanvas.width = canvas.width;
//     const pxPerMm = canvas.width / pageWidth;
//     const pageHeightPx = Math.floor(pageHeight * pxPerMm);
//     const ctx = pageCanvas.getContext("2d");
//     let renderedHeight = 0;
//     let pageIndex = 0;

//     while (renderedHeight < canvas.height) {
//       const sliceHeight = Math.min(pageHeightPx, canvas.height - renderedHeight);
//       pageCanvas.height = sliceHeight;
//       ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
//       ctx.drawImage(canvas, 0, renderedHeight, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

//       const imgData = pageCanvas.toDataURL("image/jpeg", jpegQuality);
//       if (pageIndex > 0) pdf.addPage();
//       pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, sliceHeight / pxPerMm, undefined, "FAST");

//       renderedHeight += sliceHeight;
//       pageIndex++;
//     }
//   }

//   return pdf.output("blob");
// }

// export default function SignatureAction({
//   user,
//   parentId,
//   recipient,
//   proposalId,
//   proposalName,
//   signatureId,
//   blockId,
//   debugPdf = import.meta.env.VITE_DEBUG_PDF === "true",
// }) {
//   const [isLoading, setIsLoading] = useState(false);
//   const effectiveProposalId = proposalId || parentId;

//   const startSigning = async () => {
//     setIsLoading(true);
//     const undoMask = addCaptureMask();

//     try {
//       let pdfBlob = await renderProposalToPdfBlob(".proposal-viewer", 0.72);
//       if (pdfBlob.size > 8 * 1024 * 1024) {
//         pdfBlob = await renderProposalToPdfBlob(".proposal-viewer", 0.6);
//       }

//       const fname = `${(proposalName || "proposal").replace(/\s+/g, "-").toLowerCase()}-${effectiveProposalId}.pdf`;

//       // Debug logging only
//       if (debugPdf) {
//         console.group("PDF Debug Info");
//         console.log("File Name:", fname);
//         console.log("MIME Type:", pdfBlob.type || "application/pdf");
//         console.log("Size (bytes):", pdfBlob.size);
//         console.log(`Size: ${(pdfBlob.size / 1024).toFixed(2)} KB`);
//         console.groupEnd();
//         console.log("PDF generated successfully - ready for BankID signing");
//       }

//       const fd = new FormData();
//       fd.append("file", pdfBlob, fname);
//       fd.append("message", `Signing proposal: ${proposalName || "Document"}`);
//       fd.append("relay_state", JSON.stringify({
//         parentId: parentId || "",
//         proposalId: String(effectiveProposalId || ""),
//         userId: String(user?.id || ""),
//         signatureId: String(signatureId || ""),
//         blockId: String(blockId || ""),
//         recipientEmail: recipient?.recipientEmail || "",
//         recipientName: recipient?.recipientName || ""
//       }));

//       const res = await axios.post(`${API_URL}/api/bankid/start-sign-pdf`, fd, {
//         timeout: 60000,
//       });

//       if (res.data?.redirect_url) {
//         toast.success("Redirecting to BankID for secure signing...", { autoClose: 2000 });
//         setTimeout(() => {
//           window.location.href = res.data.redirect_url;
//         }, 800);
//       } else {
//         throw new Error(res.data?.error || "Failed to initiate BankID signing.");
//       }
//     } catch (err) {
//       console.error("Signing error:", err);
//       toast.error(err?.response?.data?.error || err.message || "Failed to start signing process.");
//     } finally {
//       undoMask();
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       {/* Fullscreen Loading Overlay */}
//       {isLoading && (
//         <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-90" style={{ zIndex: 9999 }}>
//           <div className="text-center text-white">
//             <Spinner animation="border" variant="success" className="mb-4" style={{ width: "4rem", height: "4rem" }} />
//             <h4 className="fw-bold">Preparing Secure Document</h4>
//             <p className="opacity-75 mb-4">Generating PDF and connecting to BankID...</p>
//           </div>
//         </div>
//       )}

//       {/* Signature Block UI */}
//       <div
//         className="position-relative bg-white shadow-sm p-0"
//         style={{ maxWidth: "1800px", width: "100%" }}
//       >
//         <div className="d-flex justify-content-center gap-4 border-bottom p-5 bg-white">
//           {/* Decline Button with tooltip */}
//           <div className="tooltip-wrapper">
//             <button className="btn btn-light text-muted">Decline</button>
//             <span className="tooltip-text">decline the proposal</span>
//           </div>

//           {/* Sign Button with tooltip */}
//           <div className="tooltip-wrapper">
//             <button
//               onClick={startSigning}
//               disabled={isLoading}
//               className="btn px-4 text-white"
//               style={{
//                 backgroundColor: "#95df8d",
//                 borderColor: "#95df8d",
//                 borderRadius: "0.375rem",
//               }}
//             >
//               {isLoading ? (
//                 <>
//                   <Spinner animation="border" size="sm" className="me-2" />
//                   Preparing...
//                 </>
//               ) : (
//                 <>
//                   <i className="bi bi-check-lg me-2"></i>Sign with BankID
//                 </>
//               )}
//             </button>
//             <span className="tooltip-text">
//               Sign securely using BankID electronic signature
//             </span>
//           </div>
//         </div>

//         <style>{`
//           .tooltip-wrapper {
//             position: relative;
//             display: inline-block;
//           }

//           .tooltip-wrapper .tooltip-text {
//             visibility: hidden;
//             width: max-content;
//             background-color: #838383;
//             color: #fff;
//             text-align: center;
//             border-radius: 6px;
//             padding: 5px 8px;
//             position: absolute;
//             z-index: 1000;
//             bottom: 120%; /* above button */
//             left: 50%;
//             transform: translateX(-50%);
//             opacity: 0;
//             transition: opacity 0.2s;
//           }

//           .tooltip-wrapper:hover .tooltip-text {
//             visibility: visible;
//             opacity: 1;
//           }
//         `}</style>
//       </div>
//     </>
//   );
// }



import { useState } from "react";
import { Button, Spinner, Card, Modal, Form } from "react-bootstrap";
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
  const effectiveProposalId = proposalId || parentId;

  const startSigning = async () => {
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
      fd.append("receipentEmail", recipient?.recipientEmail || "");
      fd.append("recipientName", recipient?.recipientName || "");
      fd.append("relay_state", JSON.stringify({
        parentId: parentId || "",
        proposalId: String(effectiveProposalId || ""),
        userId: String(user?.id || ""),
        signatureId: String(signatureId || ""),
        blockId: String(blockId || ""),
        recipientEmail: recipient?.recipientEmail || "",
        recipientName: recipient?.recipientName || ""
      }));

      const res = await axios.post(`${API_URL}/api/bankid/start-sign-pdf`, fd, {
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
      console.error("Signing error:", err);
      toast.error(err?.response?.data?.error || err.message || "Failed to start signing process.");
    } finally {
      undoMask();
      setIsLoading(false);
    }
  };

  const handleDeclineClick = () => {
    setShowDeclineModal(true);
  };

  const handleDeclineConfirm = async () => {
    if (!declineComment.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }

    setIsDeclining(true);
    try {
      // API call to update signature status
      const response = await axios.put(`${API_URL}/signatures/decline/${signatureId}`, {
        status: "true",
        method:"type",
        comment: declineComment,
        receipent_email: recipient?.recipientEmail,
        receipent_name: recipient?.recipientName
      });

      if (response.data.success) {
        toast.success("Proposal declined successfully");
        setShowDeclineModal(false);
        setDeclineComment("");
        // You can add additional logic here, like redirecting or updating UI state
      } else {
        throw new Error(response.data.error || "Failed to decline proposal");
      }
    } catch (err) {
      console.error("Decline error:", err);
      toast.error(err?.response?.data?.error || err.message || "Failed to decline proposal");
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
            <h4 className="fw-bold">Preparing Secure Document</h4>
            <p className="opacity-75 mb-4">Generating PDF and connecting to BankID...</p>
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
                placeholder="Please provide your reason for declining this proposal..."
                value={declineComment}
                onChange={(e) => setDeclineComment(e.target.value)}
                className="border-2"
                style={{ resize: 'none' }}
              />
              <Form.Text className="text-muted">
                This comment will be recorded with your decline decision.
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
            disabled={isDeclining || !declineComment.trim()}
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

      {/* Premium Signature Card */}
      <Card className="shadow-lg signature-action-card">
        <Card.Body className="p-5 text-center">
          {/* Header Icon */}
          <div className="mb-4">
            <div className="signature-main-icon mx-auto">
              <ShieldCheck size={48} />
            </div>
          </div>

          <h3 className="fw-bold text-dark mb-3">Sign Document with BankID</h3>
          <p className="text-muted mb-4 lead">
            Your identity will be securely verified using Sweden's most trusted electronic ID
          </p>

          {/* Feature Badges */}
          <div className="row g-3 mb-5">
            <div className="col-md-4">
              <div className="signature-feature p-3 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25">
                <Fingerprint size={28} className="text-success mb-2" />
                <div className="small fw-semibold">BankID Verified</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="signature-feature p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25">
                <Lock size={28} className="text-warning mb-2" />
                <div className="small fw-semibold">Encrypted & Secure</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="signature-feature p-3 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25">
                <PersonCheck size={28} className="text-primary mb-2" />
                <div className="small fw-semibold">Legally Binding</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-center gap-4 modern-buttons-container">
            {/* Decline Button */}
            <Button
              onClick={handleDeclineClick}
              disabled={isLoading}
              variant="outline-danger"
              size="lg"
              className="px-5 py-3 modern-decline-btn position-relative overflow-hidden"
            >
              <span className="position-relative z-3 fw-bold d-flex align-items-center">
                <XCircle className="me-2" size={20} />
                Decline
              </span>
              <div className="button-shine"></div>
              <div className="border-glow"></div>
            </Button>

            {/* Sign Button */}
            <Button
              onClick={startSigning}
              disabled={isLoading}
              size="lg"
              className="px-5 py-3 modern-sign-btn position-relative overflow-hidden"
            >
              <span className="position-relative z-3 fw-bold d-flex align-items-center">
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Preparing...
                  </>
                ) : (
                  <>
                    Sign with BankID
                    <div className="arrow-container ms-2">
                      <ArrowRight size={20} />
                    </div>
                  </>
                )}
              </span>
              <div className="button-shine"></div>
              <div className="pulse-effect"></div>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-4 text-center">
            <small className="text-success fw-semibold">
              <Check2Circle className="me-1" />
              Over 8 million Swedes use BankID daily
            </small>
            <br />
            <small className="text-muted">
              <Lock size={14} className="me-1" />
              256-bit encryption • GDPR compliant • No data stored
            </small>
          </div>
        </Card.Body>

        {/* Custom Styles */}
        <style>{`
          .modern-buttons-container {
            position: relative;
          }

          .modern-decline-btn {
            background: transparent !important;
            border: 2px solid transparent !important;
            border-radius: 16px !important;
            font-size: 1.1rem;
            color: #dc3545 !important;
            box-shadow: 
              0 4px 15px rgba(220, 53, 69, 0.15),
              inset 0 0 0 2px #dc3545;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, rgba(220, 53, 69, 0.05) 0%, rgba(220, 53, 69, 0.02) 100%) !important;
          }

          .modern-decline-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%) !important;
            color: #dc3545 !important;
            transform: translateY(-3px) scale(1.02);
            box-shadow: 
              0 8px 25px rgba(220, 53, 69, 0.25),
              inset 0 0 0 2px #dc3545,
              0 0 20px rgba(220, 53, 69, 0.3);
            border-color: transparent !important;
          }

          .modern-decline-btn:active {
            transform: translateY(-1px) scale(1.01);
            box-shadow: 
              0 4px 15px rgba(220, 53, 69, 0.2),
              inset 0 0 0 2px #dc3545;
          }

          .modern-sign-btn {
            background: linear-gradient(135deg, #20c997 0%, #0dcaf0 100%) !important;
            border: none !important;
            border-radius: 16px !important;
            font-size: 1.1rem;
            box-shadow: 
              0 4px 15px rgba(32, 201, 151, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            position: relative;
            overflow: hidden;
          }

          .modern-sign-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #0dcaf0 0%, #20c997 100%) !important;
            transform: translateY(-3px) scale(1.02);
            box-shadow: 
              0 12px 30px rgba(32, 201, 151, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }

          .modern-sign-btn:active {
            transform: translateY(-1px) scale(1.01);
          }

          .button-shine {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.4),
              transparent
            );
            transition: left 0.8s ease;
          }

          .modern-decline-btn:hover .button-shine,
          .modern-sign-btn:hover .button-shine {
            left: 100%;
          }

          .border-glow {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 16px;
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
            transition: box-shadow 0.3s ease;
          }

          .modern-decline-btn:hover .border-glow {
            box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.3);
            animation: borderPulse 2s infinite;
          }

          .pulse-effect {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            opacity: 0;
          }

          .modern-sign-btn:active .pulse-effect {
            animation: pulse 0.6s ease-out;
          }

          .arrow-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
          }

          .modern-sign-btn:hover .arrow-container {
            transform: translateX(3px);
          }

          @keyframes pulse {
            0% {
              width: 0;
              height: 0;
              opacity: 0.8;
            }
            100% {
              width: 200px;
              height: 200px;
              opacity: 0;
            }
          }

          @keyframes borderPulse {
            0% {
              box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
            }
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .modern-buttons-container {
              flex-direction: column;
              gap: 1rem !important;
            }
            
            .modern-decline-btn,
            .modern-sign-btn {
              width: 100%;
              justify-content: center;
            }
          }
        `}</style>
      </Card>
    </>
  );
}