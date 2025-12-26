// import { useState, useRef } from "react";
// import html2canvas from "html2canvas";
// import EditableQuill from "../HeaderBlocks/EditableQuill";
// import axios from "axios";

// const DEFAULT_HTML = `
// <p>Include a testimonial from a happy client here. The key is to have your client talk about why they enjoyed working with you.</p>
// <p><br></p>
// <p>- Client Name</p>
// `;

// const API_URL = import.meta.env.VITE_API_URL;

// const CoverBlock = ({
//   isPreview = false,
//   settings = {},
//   parentId,
//   blockId,
// }) => {
//   const [content, setContent] = useState(DEFAULT_HTML);
//   const coverRef = useRef(null);

//   // Default settings
//   const defaultSettings = {
//     backgroundColor: null,
//     backgroundImage: null,
//     backgroundGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
//     backgroundVideo: null,
//     filter: "none",
//     position: 50,
//     blur: 0,
//     overlay: false,
//   };

//   const incomingTopLevel = settings || {};
//   const nestedCoverSettings = incomingTopLevel["cover-1"] || {};
//   const mergedSettings = {
//     ...defaultSettings,
//     ...incomingTopLevel,
//     ...nestedCoverSettings,
//   };

//   // Save API Call
//   const handleSave = async () => {
//     try {
//       const payload = {
//         parentId,
//         blockId,
//         content,
//         settings: mergedSettings,
//       };

//       const res = await axios.post(
//         `${API_URL}/cover/CreateCoverBlock`,
//         payload
//       );

//       console.log("Saved successfully:", res.data);
//       alert("Cover Block saved!");
//     } catch (err) {
//       console.error("Error saving cover block:", err);
//       alert("Failed to save cover block.");
//     }
//   };

//   // Function to determine background style
//   const getBackgroundStyle = () => {
//     const {
//       backgroundImage,
//       backgroundGradient,
//       backgroundVideo,
//       backgroundColor,
//       position,
//     } = mergedSettings;

//     if (backgroundImage && backgroundImage !== "null") {
//       return {
//         backgroundImage: `url(${backgroundImage})`,
//         backgroundSize: "cover",
//         backgroundPosition: `${position}% center`,
//         backgroundColor,
//       };
//     } else if (backgroundGradient) {
//       return { background: backgroundGradient };
//     } else if (backgroundVideo) {
//       return { backgroundColor };
//     } else {
//       return { backgroundColor };
//     }
//   };

//   return (
//     <div
//       className={`position-relative bg-white border shadow-sm p-2${
//         isPreview ? "pointer-events-none" : ""
//       }`}
//       style={{
//         maxWidth: "1800px",
//         width: "100%",
//         minHeight: "600px",
//         border: "2px solid #e3e6e8",
//         opacity: isPreview ? 0.6 : 1,
//         // transform: isPreview ? "scale(0.9)" : "none",
//       }}
//     >
//       {/* Cover area */}
//       <div
//         ref={coverRef}
//         className="position-relative  overflow-hidden border border-0"
//         style={{
//           width: "100%",
//           minHeight: "600px",
//           padding: "48px 24px 220px 24px",
//           backgroundColor: mergedSettings.backgroundColor,
//         }}
//       >
//         {/* Background elements */}
//         <div
//           className="position-absolute top-0 start-0 w-100 h-100"
//           style={{
//             ...getBackgroundStyle(),
//             filter: `${mergedSettings.filter} blur(${mergedSettings.blur}px)`,
//             zIndex: 0,
//           }}
//         />

//         {/* Background video */}
//         {mergedSettings.backgroundVideo && (
//           <div
//             className="position-absolute top-0 start-0 w-100 h-100"
//             style={{ zIndex: 0, overflow: "hidden" }}
//           >
//             <video
//               autoPlay
//               loop
//               muted
//               className="w-100 h-100"
//               style={{
//                 objectFit: "cover",
//                 objectPosition: `${mergedSettings.position}% center`,
//               }}
//             >
//               <source src={mergedSettings.backgroundVideo} type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>
//           </div>
//         )}

//         {/* Overlay */}
//         {mergedSettings.overlay && (
//           <div
//             className="position-absolute top-0 start-0 w-100 h-100"
//             style={{
//               backgroundColor: "rgba(0,0,0,0.3)",
//               zIndex: 1,
//             }}
//           />
//         )}

//         {/* Content area */}
//         <div
//           className="mx-auto position-relative"
//           style={{
//             width: "72%",
//             maxWidth: "980px",
//             zIndex: 2,
//           }}
//         >
//           <div
//             className="rounded-3"
//             style={{
//               backgroundColor: "rgba(255,255,255,0.06)",
//               border: "1px solid rgba(255,255,255,0.08)",
//               padding: "18px 22px",
//               color: "#f3c6ff",
//               backdropFilter: "blur(2px)",
//             }}
//           >
//             <div
//               style={{
//                 borderLeft: "4px solid rgba(255,255,255,0.25)",
//                 paddingLeft: "16px",
//               }}
//             >
//               <EditableQuill
//                 id="cover-quote"
//                 value={content}
//                 onChange={setContent}
//                 placeholder="Write quote..."
//                 isPreview={isPreview}
//                 className="text-start"
//                 style={{ color: "#f3c6ff" }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Bottom white band */}
//         <div
//           className="position-absolute start-0 end-0"
//           style={{
//             bottom: 0,
//             height: "20px",
//             background: "#ffffff",
//             zIndex: 2,
//           }}
//         />
//       </div>

//       {/* Save Button (show only if not preview) */}
//       {!isPreview && (
//         <div className="mt-3 text-end">
//           <button onClick={handleSave} className="btn btn-primary">
//             Save
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CoverBlock;


import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import EditableQuill from "../HeaderBlocks/EditableQuill";
import axios from "axios";
import { toast } from "react-toastify";

const DEFAULT_HTML = `
<p>Include a testimonial from a happy client here. The key is to have your client talk about why they enjoyed working with you.</p>
<p><br></p>
<p>- Client Name</p>
`;

const API_URL = import.meta.env.VITE_API_URL;

const CoverBlock = ({
  isPreview = false,
  settings = {},
  parentId,
  blockId,
}) => {
  const [content, setContent] = useState(DEFAULT_HTML);
  const coverRef = useRef(null);
  const debounceTimer = useRef(null);
  const isInitial = useRef(true);

  // Default settings
  const defaultSettings = {
    backgroundColor: null,
    backgroundImage: null,
    backgroundGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    backgroundVideo: null,
    filter: "none",
    position: 50,
    blur: 0,
    overlay: false,
  };

  const incomingTopLevel = settings || {};
  const nestedCoverSettings = incomingTopLevel["cover-1"] || {};
  const mergedSettings = {
    ...defaultSettings,
    ...incomingTopLevel,
    ...nestedCoverSettings,
  };

  const settingsKey = JSON.stringify(mergedSettings);

  // Auto-save with debounce (only in edit mode, skips initial mount)
  useEffect(() => {
    if (isPreview) return;

    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    const timer = setTimeout(() => {
      handleSave();
    }, 3000);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = timer;

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [content, settingsKey, parentId, blockId]);

  // Save API Call
  const handleSave = async () => {
    try {
      const payload = {
        parentId,
        blockId,
        content,
        settings: mergedSettings,
      };

      await axios.post(`${API_URL}/cover/CreateCoverBlock`, payload);
      toast.success("Cover Block auto-saved!");
    } catch (err) {
      console.error("Error auto-saving cover block:", err);
      toast.error("Failed to auto-save cover block.");
    }
  };

  // Function to determine background style
  const getBackgroundStyle = () => {
    const {
      backgroundImage,
      backgroundGradient,
      backgroundVideo,
      backgroundColor,
      position,
    } = mergedSettings;

    if (backgroundVideo) {
      return { backgroundColor: backgroundColor || undefined };
    }

    if (backgroundImage && backgroundImage !== "null") {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: `${position}% center`,
        backgroundColor: backgroundColor || undefined,
      };
    } else if (backgroundGradient) {
      return { background: backgroundGradient };
    } else {
      return { backgroundColor: backgroundColor || undefined };
    }
  };

  return (
    <div
      className={`relative bg-white shadow-sm p-2 max-w-[1800px] w-full min-h-[600px] border-2 border-[#e3e6e8] ${
        isPreview ? "pointer-events-none opacity-60" : "opacity-100"
      }`}
    >
      {/* Cover area */}
      <div
        ref={coverRef}
        className="relative overflow-hidden w-full min-h-[600px] pt-12 px-6 pb-[220px]"
      >
        {/* Background elements (image/gradient/color) */}
        <div
          className="absolute inset-0 z-0"
          style={{
            ...getBackgroundStyle(),
            filter: `${mergedSettings.filter} blur(${mergedSettings.blur}px)`,
          }}
        />

        {/* Background video */}
        {mergedSettings.backgroundVideo && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{
                objectPosition: `${mergedSettings.position}% center`,
              }}
            >
              <source src={mergedSettings.backgroundVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Overlay */}
        {mergedSettings.overlay && (
          <div className="absolute inset-0 bg-black/30 z-1" />
        )}

        {/* Content area - quote/testimonial style with glass box */}
        <div className="mx-auto relative z-2 w-[72%] max-w-[980px]">
          <div className="rounded-xl bg-white/6 border border-white/8 px-[22px] py-[18px] text-[#f3c6ff] backdrop-blur-[2px]">
            <div className="border-l-4 border-white/25 pl-4">
              <EditableQuill
                id="cover-quote"
                value={content}
                onChange={setContent}
                placeholder="Write quote..."
                isPreview={isPreview}
                className="text-left"
                style={{ color: "#f3c6ff" }}
              />
            </div>
          </div>
        </div>

        {/* Bottom white band */}
        <div className="absolute inset-x-0 bottom-0 h-5 bg-white z-2" />
      </div>
    </div>
  );
};

export default CoverBlock;