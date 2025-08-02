import React, { useState } from "react";
import { X } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

const VideoBlock = ({ id, onRemove }) => {
  const [videoLink, setVideoLink] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");

  const handleAddClick = () => {
    const trimmedLink = videoLink.trim();
    if (!trimmedLink) {
      alert("Please enter a video URL");
      return;
    }

    const embed = getEmbedUrl(trimmedLink);
    if (embed) {
      setEmbedUrl(embed);
    } else {
      alert("Unsupported or invalid video URL.");
    }

    setVideoLink("");
  };

  const getEmbedUrl = (url) => {
    try {
      const parsedUrl = new URL(url);

      // YouTube
      if (
        parsedUrl.hostname.includes("youtube.com") ||
        parsedUrl.hostname.includes("youtu.be")
      ) {
        let videoId = "";
        if (parsedUrl.hostname === "youtu.be") {
          videoId = parsedUrl.pathname.slice(1);
        } else {
          videoId = parsedUrl.searchParams.get("v");
        }
        return `https://www.youtube.com/embed/${videoId}`;
      }

      // Vimeo
      if (parsedUrl.hostname.includes("vimeo.com")) {
        const videoId = parsedUrl.pathname.split("/")[1];
        return `https://player.vimeo.com/video/${videoId}`;
      }

      // Wistia
      if (
        parsedUrl.hostname.includes("wistia.com") ||
        parsedUrl.hostname.includes("wi.st")
      ) {
        const match = url.match(/\/medias\/([a-zA-Z0-9]+)/);
        if (match) {
          return `https://fast.wistia.net/embed/iframe/${match[1]}`;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  return (
    <div
      className="position-relative bg-white rounded-2 shadow-sm p-1 overflow-hidden mx-auto"
      style={{
        border: "1px solid #ddd",
        maxWidth: "1400px",
        width: "100%",
      }}
    >
      {/* Input Section */}
      {!embedUrl && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            minHeight: "200px",
            padding: "1rem",
            background: "#f8f9fa",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "600px", width: "100%" }}>
            <h5 className="mb-4 text-secondary fw-semibold">
              Paste a YouTube, Vimeo, or Wistia video link.
            </h5>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="https://www..."
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
              />
              <button
                className="btn text-white"
                style={{ backgroundColor: "#0094ff" }}
                onClick={handleAddClick}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Display Section */}
      {embedUrl && (
        <div className="ratio ratio-16x9">
          <iframe
            src={embedUrl}
            title="Embedded video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default VideoBlock;
