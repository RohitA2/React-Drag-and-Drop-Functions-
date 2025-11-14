import { useState, useRef } from "react";
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

  // Default settings
  const defaultSettings = {
    backgroundColor: "#401C47",
    backgroundImage: null,
    backgroundGradient: null,
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

  // Save API Call
  const handleSave = async () => {
    try {
      const payload = {
        parentId,
        blockId,
        content,
        settings: mergedSettings,
      };

      const res = await axios.post(
        `${API_URL}/cover/CreateCoverBlock`,
        payload
      );

      // console.log("Saved successfully:", res.data);
      toast.success("Cover Block saved!");
    } catch (err) {
      console.error("Error saving cover block:", err);
      alert("Failed to save cover block.");
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

    if (backgroundImage && backgroundImage !== "null") {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: `${position}% center`,
        backgroundColor,
      };
    } else if (backgroundGradient) {
      return { background: backgroundGradient };
    } else if (backgroundVideo) {
      return { backgroundColor };
    } else {
      return { backgroundColor };
    }
  };

  return (
    <div
      className={`position-relative bg-white border shadow-sm p-2${
        isPreview ? "pointer-events-none" : ""
      }`}
      style={{
        maxWidth: "1800px",
        width: "100%",
        minHeight: "600px",
        border: "2px solid #e3e6e8",
        opacity: isPreview ? 0.6 : 1,
        // transform: isPreview ? "scale(0.9)" : "none",
      }}
    >
      {/* Cover area */}
      <div
        ref={coverRef}
        className="position-relative  overflow-hidden border border-0"
        style={{
          width: "100%",
          minHeight: "600px",
          padding: "48px 24px 220px 24px",
          backgroundColor: mergedSettings.backgroundColor,
        }}
      >
        {/* Background elements */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            ...getBackgroundStyle(),
            filter: `${mergedSettings.filter} blur(${mergedSettings.blur}px)`,
            zIndex: 0,
          }}
        />

        {/* Background video */}
        {mergedSettings.backgroundVideo && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ zIndex: 0, overflow: "hidden" }}
          >
            <video
              autoPlay
              loop
              muted
              className="w-100 h-100"
              style={{
                objectFit: "cover",
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
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              backgroundColor: "rgba(0,0,0,0.3)",
              zIndex: 1,
            }}
          />
        )}

        {/* Content area */}
        <div
          className="mx-auto position-relative"
          style={{
            width: "72%",
            maxWidth: "980px",
            zIndex: 2,
          }}
        >
          <div
            className="rounded-3"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "18px 22px",
              color: "#f3c6ff",
              backdropFilter: "blur(2px)",
            }}
          >
            <div
              style={{
                borderLeft: "4px solid rgba(255,255,255,0.25)",
                paddingLeft: "16px",
              }}
            >
              <EditableQuill
                id="cover-quote"
                value={content}
                onChange={setContent}
                placeholder="Write quote..."
                isPreview={isPreview}
                className="text-start"
                style={{ color: "#f3c6ff" }}
              />
            </div>
          </div>
        </div>

        {/* Bottom white band */}
        <div
          className="position-absolute start-0 end-0"
          style={{
            bottom: 0,
            height: "20px",
            background: "#ffffff",
            zIndex: 2,
          }}
        />
      </div>

      {/* Save Button (show only if not preview) */}
      {!isPreview && (
        <div className="mt-3 text-end">
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default CoverBlock;
