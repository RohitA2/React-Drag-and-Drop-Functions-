// import { useMemo, useState } from "react";
// import { Button, Spinner, Modal, Form, Card } from "react-bootstrap";
// import axios from "axios";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import { toast } from "react-toastify";
// import {
//   ShieldCheck,
//   Fingerprint,
//   ArrowRight,
//   PersonCheck,
//   Lock,
//   Stars,
// } from "react-bootstrap-icons";

// const API_URL = import.meta.env.VITE_API_URL;

// // --- Helper functions remain unchanged ---
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

// async function renderProposalToPdfBlob(selector = ".proposal-viewer", jpegQuality = 0.72) {
//   if (document.fonts?.ready) await document.fonts.ready.catch(() => { });
//   await new Promise(r => setTimeout(r, 100));

//   const element = document.querySelector(selector);
//   if (!element) throw new Error("Proposal content not found.");

//   const canvas = await html2canvas(element, {
//     scale: Math.min(window.devicePixelRatio || 1, 2),
//     useCORS: true,
//     backgroundColor: "#ffffff",
//     width: element.scrollWidth,
//     height: element.scrollHeight,
//     windowWidth: element.scrollWidth,
//     windowHeight: element.scrollHeight,
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

// function normalizeNin(ninRaw) {
//   const digits = (ninRaw || "").replace(/\D/g, "");
//   if (digits.length !== 10 && digits.length !== 12) return { ok: false };
//   if (digits.length === 12) return { ok: true, nin12: digits };
//   const yy = parseInt(digits.slice(0, 2), 10);
//   const currentYY = new Date().getFullYear() % 100;
//   const century = yy <= currentYY ? "20" : "19";
//   return { ok: true, nin12: `${century}${digits}` };
// }

// export default function SignatureAction({ user, parentId, recipient, proposalId, proposalName, signatureId, blockId }) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [showNinModal, setShowNinModal] = useState(false);
//   const [ninInput, setNinInput] = useState(recipient?.nin || "");
//   const [ninError, setNinError] = useState("");

//   const effectiveProposalId = proposalId || parentId;
//   const ninHint = useMemo(() => "YYYYMMDDNNNN or YYMMDDNNNN", []);

//   const handleOpenModal = () => {
//     if (!isLoading) setShowNinModal(true);
//   };

//   const handleCloseModal = () => {
//     if (!isLoading) setShowNinModal(false);
//   };

//   const startSigning = async (nin12) => {
//     setIsLoading(true);
//     const undoMask = addCaptureMask();

//     try {
//       // 1️⃣ Convert proposal to PDF
//       let pdfBlob = await renderProposalToPdfBlob(".proposal-viewer", 0.72);
//       if (pdfBlob.size > 8 * 1024 * 1024) {
//         pdfBlob = await renderProposalToPdfBlob(".proposal-viewer", 0.6);
//       }

//       const fname = `${(proposalName || "proposal").replace(/\s+/g, "-").toLowerCase()}-${effectiveProposalId}.pdf`;
//       const pdfFile = new File([pdfBlob], fname, { type: "application/pdf" });

//       // 2️⃣ Prepare payload
//       const fd = new FormData();
//       fd.append("file", pdfFile);
//       fd.append("parentId", parentId || "");
//       fd.append("proposalId", String(effectiveProposalId || ""));
//       fd.append("userId", String(user?.id || ""));
//       fd.append("signatureId", String(signatureId || ""));
//       fd.append("blockId", String(blockId || ""));
//       fd.append("recipientEmail", recipient?.recipientEmail || "");
//       fd.append("recipientName", recipient?.recipientName || "");
//       fd.append("nin", nin12 || "");

//       // 3️⃣ Call backend to create ZignSec session
//       const res = await axios.post(`${API_URL}/api/zignsec/create-session`, fd, {
//         timeout: 60000,
//         headers: { Accept: "application/json" },
//       });

//       if (res.data?.redirectUrl) {
//         toast.success("Redirecting to BankID...");
//         window.location.href = res.data.redirectUrl;
//       } else {
//         throw new Error(res.data?.error || "Failed to start signing session.");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.response?.data?.error || err.message);
//     } finally {
//       undoMask();
//       setIsLoading(false);
//     }
//   };

//   const handleNinSubmit = async (e) => {
//     e.preventDefault();
//     setNinError("");

//     const { ok, nin12 } = normalizeNin(ninInput);
//     if (!ok) {
//       setNinError("Invalid Swedish personal number (10 or 12 digits).");
//       return;
//     }

//     setShowNinModal(false);
//     await startSigning(nin12);
//   };

//   return (
//     <>
//       {/* Fullscreen Loader */}
//       {isLoading && (
//         <div className="signing-overlay">
//           <div className="signing-loader">
//             <Spinner animation="border" variant="light" className="mb-3" />
//             <h5 className="text-white fw-bold">Redirecting to Signicat...</h5>
//             <p className="text-white-50">Please wait while we securely prepare your document</p>
//             <div className="pulse-animation">
//               <Stars size={36} className="text-white" />
//             </div>
//           </div>
//         </div>
//       )}

//       <Card className="signature-card-modern">
//         <div className="signature-header">
//           <div className="icon-glow">
//             <ShieldCheck size={36} />
//           </div>
//           <div>
//             <h4 className="fw-bold text-white mb-1">Secure Digital Signature</h4>
//             <p className="mb-0 text-white-70">Powered by Signicat & BankID</p>
//           </div>
//         </div>

//         <Card.Body className="p-4">
//           <div className="features-grid">
//             <div className="feature">
//               <div className="feature-icon bg-success bg-opacity-20">
//                 <Fingerprint size={22} />
//               </div>
//               <span>BankID Verified</span>
//             </div>
//             <div className="feature">
//               <div className="feature-icon bg-primary bg-opacity-20">
//                 <PersonCheck size={22} />  {/* Fixed: PersonCheck */}
//               </div>
//               <span>Identity Confirmed</span>
//             </div>
//             <div className="feature">
//               <div className="feature-icon bg-purple bg-opacity-20">
//                 <Lock size={22} />
//               </div>
//               <span>End-to-End Encrypted</span>
//             </div>
//           </div>

//           <Button
//             onClick={handleOpenModal}
//             disabled={isLoading}
//             className="sign-button w-100 mt-4 position-relative overflow-hidden"
//             size="lg"
//           >
//             <span className="position-relative z-3">
//               {isLoading ? "Preparing Document..." : "Sign with BankID"}
//             </span>
//             {!isLoading && <ArrowRight className="ms-2" size={20} />}
//             <div className="shine"></div>
//           </Button>

//           <div className="trust-badge mt-3">
//             <Lock size={14} className="me-1" />
//             <small>256-bit SSL • GDPR Compliant</small>
//           </div>
//         </Card.Body>
//       </Card>

//       {/* NIN Modal */}
//       <Modal show={showNinModal} onHide={handleCloseModal} centered backdrop="static">
//         <div className="modal-gradient-header">
//           <Modal.Header closeButton className="border-0">
//             <Modal.Title className="text-white">
//               <div className="d-flex align-items-center">
//                 <div className="modal-icon">
//                   <Fingerprint size={28} />
//                 </div>
//                 <div>
//                   <h5 className="mb-0">Verify Identity</h5>
//                   <small className="opacity-80">Swedish Personal Number</small>
//                 </div>
//               </div>
//             </Modal.Title>
//           </Modal.Header>
//         </div>

//         <Modal.Body className="pt-4">
//           <Form onSubmit={handleNinSubmit}>
//             <Form.Group>
//               <Form.Label className="fw-semibold">Personnummer</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="ÅÅÅÅMMDDXXXX"
//                 value={ninInput}
//                 onChange={(e) => setNinInput(e.target.value)}
//                 autoFocus
//                 className="nin-input"
//                 inputMode="numeric"
//               />
//               <Form.Text>{ninHint}</Form.Text>
//               {ninError && <div className="text-danger mt-2 small">{ninError}</div>}
//             </Form.Group>
//           </Form>
//         </Modal.Body>

//         <Modal.Footer className="bg-light border-0">
//           <Button variant="light" onClick={handleCloseModal} disabled={isLoading}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleNinSubmit} disabled={isLoading} className="px-4">
//             {isLoading ? (
//               <>
//                 <Spinner size="sm" className="me-2" />
//                 Preparing...
//               </>
//             ) : (
//               <>
//                 Continue <ArrowRight className="ms-2" />
//               </>
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       <style>{`
//         /* Same beautiful styles as before */
//         .signing-overlay {
//           position: fixed; inset: 0; background: rgba(0,0,0,0.85);
//           backdrop-filter: blur(8px); display: flex; align-items: center;
//           justify-content: center; z-index: 9999; animation: fadeIn 0.4s ease-out;
//         }
//         .signing-loader { text-align: center; padding: 2rem; border-radius: 10px;
//           background: rgba(255,255,255,0.1); backdrop-filter: blur(20px);
//           border: 1px solid rgba(255,255,255,0.2);
//         }
//         .pulse-animation { margin-top: 1.5rem; animation: pulse 2s infinite; }
//         .signature-card-modern { border: none;  overflow: hidden;
//           background: rgba(255,255,255,0.95); backdrop-filter: blur(16px);
//           box-shadow: 0 20px 40px rgba(0,0,0,0.1); transition: all 0.3s ease;
//         }
//         .signature-card-modern:hover { transform: translateY(-8px);
//           box-shadow: 0 30px 60px rgba(0,0,0,0.15);
//         }
//         .signature-header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
//           padding: 2rem; text-align: center; color: white;
//         }
//         .icon-glow { width: 70px; height: 70px; background: rgba(255,255,255,0.2);
//           border-radius: 50%; display: flex; align-items: center; justify-content: center;
//           margin: 0 auto 1rem; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);
//           box-shadow: 0 8px 32px rgba(0,0,0,0.2);
//         }
//         .features-grid { display: grid; gap: 1rem; }
//         .feature { display: flex; align-items: center; gap: 1rem; padding: 0.75rem;
//           border-radius: 16px; background: rgba(102,126,234,0.05); transition: all 0.2s ease;
//         }
//         .feature:hover { background: rgba(102,126,234,0.1); transform: translateX(4px); }
//         .feature-icon { width: 48px; height: 48px; border-radius: 14px;
//           display: flex; align-items: center; justify-content: center; flex-shrink: 0;
//         }
//         .sign-button { background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
//           border: none; border-radius: 16px; padding: 1rem; font-weight: 600;
//           font-size: 1.1rem; color: white; position: relative; overflow: hidden;
//           transition: all 0.3s ease;
//         }
//         .sign-button:hover:not(:disabled) { transform: translateY(-2px);
//           box-shadow: 0 10px 30px rgba(16,185,129,0.4);
//         }
//         .shine { position: absolute; top: 0; left: -150%; width: 50%; height: 100%;
//           background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
//           transform: skewX(-25deg); transition: left 0.7s ease;
//         }
//         .sign-button:hover .shine { left: 150%; }
//         .trust-badge { text-align: center; color: #6b7280; font-size: 0.85rem; }
//         .modal-gradient-header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
//         .modal-icon { width: 56px; height: 56px; background: rgba(255,255,255,0.2);
//           border-radius: 50%; display: flex; align-items: center; justify-content: center;
//           margin-right: 1rem; backdrop-filter: blur(10px);
//         }
//         .nin-input { border: 2px solid #e5e7eb; border-radius: 14px; padding: 1rem;
//           font-size: 1.1rem; transition: all 0.3s ease;
//         }
//         .nin-input:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.15); }
//         @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
//         @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
//         @media (max-width: 576px) {
//           .signature-header { padding: 1.5rem; }
//           .icon-glow { width: 60px; height: 60px; }
//           .sign-button { font-size: 1rem; }
//         }
//       `}</style>
//     </>
//   );
// }



import { useMemo, useState } from "react";
import { Button, Spinner, Modal, Form, Card } from "react-bootstrap";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import { ShieldCheck, Fingerprint, ArrowRight, PersonCheck, Lock, Stars } from "react-bootstrap-icons";

const API_URL = import.meta.env.VITE_API_URL;

// Helper functions remain mostly the same
function addCaptureMask(selector = ".proposal-viewer") {
  const el = document.querySelector(selector);
  if (!el) return () => {};
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
  if (document.fonts?.ready) await document.fonts.ready.catch(() => {});
  await new Promise((r) => setTimeout(r, 100));

  const element = document.querySelector(selector);
  if (!element) throw new Error("Proposal content not found.");

  const canvas = await html2canvas(element, {
    scale: Math.min(window.devicePixelRatio || 1, 2),
    useCORS: true,
    backgroundColor: "#ffffff",
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
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

function normalizeNin(ninRaw) {
  const digits = (ninRaw || "").replace(/\D/g, "");
  if (digits.length !== 10 && digits.length !== 12) return { ok: false };
  if (digits.length === 12) return { ok: true, nin12: digits };
  const yy = parseInt(digits.slice(0, 2), 10);
  const currentYY = new Date().getFullYear() % 100;
  const century = yy <= currentYY ? "20" : "19";
  return { ok: true, nin12: `${century}${digits}` };
}

export default function SignatureAction({ user, parentId, recipient, proposalId, proposalName, signatureId, blockId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showNinModal, setShowNinModal] = useState(false);
  const [ninInput, setNinInput] = useState(recipient?.nin || "");
  const [ninError, setNinError] = useState("");

  const effectiveProposalId = proposalId || parentId;
  const ninHint = useMemo(() => "YYYYMMDDNNNN or YYMMDDNNNN", []);

  const handleOpenModal = () => !isLoading && setShowNinModal(true);
  const handleCloseModal = () => !isLoading && setShowNinModal(false);

  const startSigning = async (nin12) => {
    setIsLoading(true);
    const undoMask = addCaptureMask();

    try {
      // Convert proposal to PDF
      let pdfBlob = await renderProposalToPdfBlob(".proposal-viewer", 0.72);
      if (pdfBlob.size > 8 * 1024 * 1024) pdfBlob = await renderProposalToPdfBlob(".proposal-viewer", 0.6);

      const fname = `${(proposalName || "proposal").replace(/\s+/g, "-").toLowerCase()}-${effectiveProposalId}.pdf`;
      const pdfFile = new File([pdfBlob], fname, { type: "application/pdf" });

      // Prepare FormData
      const fd = new FormData();
      fd.append("file", pdfFile);
      fd.append("parentId", parentId || "");
      fd.append("proposalId", String(effectiveProposalId || ""));
      fd.append("userId", String(user?.id || ""));
      fd.append("signatureId", String(signatureId || ""));
      fd.append("blockId", String(blockId || ""));
      fd.append("recipientEmail", recipient?.recipientEmail || "");
      fd.append("recipientName", recipient?.recipientName || "");
      fd.append("nin", nin12 || "");

      // Call backend to create ZignSec session
      const res = await axios.post(`${API_URL}/api/zignsec/create-session`, fd, {
        timeout: 60000,
        headers: { Accept: "application/json" },
      });

      if (res.data?.redirectUrl) {
        toast.success("Redirecting to BankID...");
        window.location.href = res.data.redirectUrl;
      } else {
        throw new Error(res.data?.error || "Failed to start signing session.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || err.message);
    } finally {
      undoMask();
      setIsLoading(false);
    }
  };

  const handleNinSubmit = async (e) => {
    e.preventDefault();
    setNinError("");
    const { ok, nin12 } = normalizeNin(ninInput);
    if (!ok) {
      setNinError("Invalid Swedish personal number (10 or 12 digits).");
      return;
    }
    setShowNinModal(false);
    await startSigning(nin12);
  };

  return (
    <>
      {/* Loader */}
      {isLoading && (
        <div className="signing-overlay">
          <div className="signing-loader text-center">
            <Spinner animation="border" variant="light" className="mb-3" />
            <h5 className="text-white fw-bold">Redirecting to BankID...</h5>
            <p className="text-white-50">Preparing your document securely</p>
            <div className="pulse-animation"><Stars size={36} className="text-white" /></div>
          </div>
        </div>
      )}

      {/* Signature Card */}
      <Card className="signature-card-modern">
        <div className="signature-header">
          <div className="icon-glow"><ShieldCheck size={36} /></div>
          <div>
            <h4 className="fw-bold text-white mb-1">Secure Digital Signature</h4>
            <p className="mb-0 text-white-70">Powered by Signicat & BankID</p>
          </div>
        </div>

        <Card.Body className="p-4">
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon bg-success bg-opacity-20"><Fingerprint size={22} /></div>
              <span>BankID Verified</span>
            </div>
            <div className="feature">
              <div className="feature-icon bg-primary bg-opacity-20"><PersonCheck size={22} /></div>
              <span>Identity Confirmed</span>
            </div>
            <div className="feature">
              <div className="feature-icon bg-purple bg-opacity-20"><Lock size={22} /></div>
              <span>End-to-End Encrypted</span>
            </div>
          </div>

          <Button onClick={handleOpenModal} disabled={isLoading} className="sign-button w-100 mt-4 position-relative overflow-hidden" size="lg">
            <span className="position-relative z-3">{isLoading ? "Preparing Document..." : "Sign with BankID"}</span>
            {!isLoading && <ArrowRight className="ms-2" size={20} />}
            <div className="shine"></div>
          </Button>

          <div className="trust-badge mt-3"><Lock size={14} className="me-1" /><small>256-bit SSL • GDPR Compliant</small></div>
        </Card.Body>
      </Card>

      {/* NIN Modal */}
      <Modal show={showNinModal} onHide={handleCloseModal} centered backdrop="static">
        <div className="modal-gradient-header">
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="text-white d-flex align-items-center">
              <div className="modal-icon"><Fingerprint size={28} /></div>
              <div>
                <h5 className="mb-0">Verify Identity</h5>
                <small className="opacity-80">Swedish Personal Number</small>
              </div>
            </Modal.Title>
          </Modal.Header>
        </div>

        <Modal.Body className="pt-4">
          <Form onSubmit={handleNinSubmit}>
            <Form.Group>
              <Form.Label className="fw-semibold">Personnummer</Form.Label>
              <Form.Control type="text" placeholder="ÅÅÅÅMMDDXXXX" value={ninInput} onChange={(e) => setNinInput(e.target.value)} autoFocus inputMode="numeric" />
              <Form.Text>{ninHint}</Form.Text>
              {ninError && <div className="text-danger mt-2 small">{ninError}</div>}
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer className="bg-light border-0">
          <Button variant="light" onClick={handleCloseModal} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" onClick={handleNinSubmit} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" className="me-2" /> : <>Continue <ArrowRight className="ms-2" /></>}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
