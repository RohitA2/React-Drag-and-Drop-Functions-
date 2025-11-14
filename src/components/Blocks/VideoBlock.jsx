import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createVideoBlock } from "../../store/videoBlockSlice";
import { selectedUserId } from "../../store/authSlice";
import "bootstrap/dist/css/bootstrap.min.css";

const VideoBlock = ({ blockId ,parentId}) => {
  const user_id = useSelector(selectedUserId);
  const [videoLink, setVideoLink] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const dispatch = useDispatch();

  const handleAddClick = () => {
    const trimmedLink = videoLink.trim();
    if (!trimmedLink) {
      alert("Please enter a video URL");
      return;
    }

    const embed = getEmbedUrl(trimmedLink);
    if (embed) {
      setEmbedUrl(embed);

      // 🔹 Save to backend + redux
      dispatch(
        createVideoBlock({
          blockId: blockId,
          link: trimmedLink,
          user_id: user_id,
          parentId: parentId
        })
      );
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
      className="position-relative bg-white shadow-sm p-1 overflow-hidden "
      style={{
        border: "1px solid #ddd",
        maxWidth: "1800px",
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
