import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createVideoBlock } from "../../store/videoBlockSlice";
import { selectedUserId } from "../../store/authSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaYoutube, FaVimeo, FaPlayCircle, FaPlus, FaTimes } from "react-icons/fa";

const VideoBlock = ({ blockId, parentId, data, isExisting }) => {
  const user_id = useSelector(selectedUserId);
  const dispatch = useDispatch();

  // Helper to get embed URL from video link
  const getEmbedUrlFromLink = (url) => {
    if (!url) return "";
    try {
      const parsedUrl = new URL(url);
      // YouTube
      if (parsedUrl.hostname.includes("youtube.com") || parsedUrl.hostname.includes("youtu.be")) {
        let videoId = "";
        if (parsedUrl.hostname === "youtu.be") {
          videoId = parsedUrl.pathname.slice(1);
        } else {
          videoId = parsedUrl.searchParams.get("v");
        }
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
      }
      // Vimeo
      if (parsedUrl.hostname.includes("vimeo.com")) {
        const videoId = parsedUrl.pathname.split("/")[1];
        return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
      }
      // Wistia
      if (parsedUrl.hostname.includes("wistia.com")) {
        const videoId = parsedUrl.pathname.split("/").pop();
        return `https://fast.wistia.net/embed/iframe/${videoId}`;
      }
    } catch {
      return "";
    }
    return "";
  };

  // Initialize from existing data if available
  const getInitialEmbedUrl = () => {
    if (isExisting && data) {
      const videoUrl = data.video || data.link || data.url || "";
      if (videoUrl) {
        // Check if it's already an embed URL
        if (videoUrl.includes("/embed/") || videoUrl.includes("player.vimeo")) {
          return videoUrl;
        }
        return getEmbedUrlFromLink(videoUrl);
      }
    }
    return "";
  };

  const [videoLink, setVideoLink] = useState("");
  const [embedUrl, setEmbedUrl] = useState(getInitialEmbedUrl);
  const [isEditing, setIsEditing] = useState(!getInitialEmbedUrl());
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(isExisting || false);

  // Update from data prop if it loads later
  useEffect(() => {
    if (isExisting && data && !isInitialized) {
      const videoUrl = data.video || data.link || data.url || "";
      if (videoUrl) {
        let embed = videoUrl;
        if (!videoUrl.includes("/embed/") && !videoUrl.includes("player.vimeo")) {
          embed = getEmbedUrlFromLink(videoUrl);
        }
        if (embed) {
          setEmbedUrl(embed);
          setIsEditing(false);
          setIsInitialized(true);
          console.log("VideoBlock loaded existing data:", embed);
        }
      }
    }
  }, [data, isExisting, isInitialized]);

  const handleAddClick = async () => {
    const trimmedLink = videoLink.trim();
    if (!trimmedLink) {
      alert("Please enter a video URL");
      return;
    }

    setIsLoading(true);
    
    try {
      const embed = getEmbedUrl(trimmedLink);
      if (embed) {
        setEmbedUrl(embed);
        setIsEditing(false);

        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

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
        alert("Unsupported or invalid video URL. Please try YouTube, Vimeo, or Wistia.");
      }
    } catch (error) {
      alert("Error processing video link. Please check the URL and try again.");
    } finally {
      setIsLoading(false);
      setVideoLink("");
    }
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
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
      }

      // Vimeo
      if (parsedUrl.hostname.includes("vimeo.com")) {
        const videoId = parsedUrl.pathname.split("/")[1];
        return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
      }

      // Wistia
      if (
        parsedUrl.hostname.includes("wistia.com") ||
        parsedUrl.hostname.includes("wi.st")
      ) {
        const match = url.match(/\/medias\/([a-zA-Z0-9]+)/);
        if (match) {
          return `https://fast.wistia.net/embed/iframe/${match[1]}?videoFoam=true`;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  const handleRemoveVideo = () => {
    setEmbedUrl("");
    setIsEditing(true);
    setVideoLink("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleAddClick();
    }
  };

  return (
    <div
      className="position-relative bg-white  shadow-lg overflow-hidden border-0"
      style={{
        maxWidth: "1800px",
        width: "100%",
        transition: "all 0.3s ease",
      }}
    >
      {/* Video Display Section */}
      {embedUrl && !isEditing ? (
        <div className="position-relative">
          <div className="ratio ratio-16x9">
            <iframe
              src={embedUrl}
              title="Embedded video"
              className="rounded-3"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            ></iframe>
          </div>
          
          {/* Video Overlay Controls
          <div className="position-absolute top-0 end-0 p-3">
            <button
              onClick={handleRemoveVideo}
              className="btn btn-sm btn-light shadow-sm  "
              style={{ width: '36px', height: '36px' }}
              title="Replace video"
            >
              <FaTimes />
            </button>
          </div> */}
          
          {/* Video Info Bar */}
          <div className="bg-light p-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              {embedUrl.includes("youtube") && <FaYoutube className="text-danger" size={20} />}
              {embedUrl.includes("vimeo") && <FaVimeo className="text-primary" size={20} />}
              <span className="text-muted small">Video embedded successfully</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline-primary btn-sm rounded-pill px-3"
            >
              Change Video
            </button>
          </div>
        </div>
      ) : (
        /* Input Section */
        <div
          className="d-flex flex-column justify-content-center align-items-center p-5"
          style={{
            minHeight: "300px",
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          }}
        >
          <div className="text-center mb-5" style={{ maxWidth: "600px", width: "100%" }}>
            {/* Icon and Title */}
            <div className="mb-4">
              <div className="position-relative d-inline-block">
                <div className="rounded-circle bg-primary p-3 shadow">
                  <FaPlayCircle size={48} className="text-white" />
                </div>
                <div className="position-absolute top-0 start-100 translate-middle">
                  <FaPlus className="text-success bg-white rounded-circle p-1" size={20} />
                </div>
              </div>
              <h3 className="mt-4 fw-bold text-dark">Add a Video</h3>
              <p className="text-muted mb-4">
                Paste a YouTube, Vimeo, or Wistia link to embed your video
              </p>
            </div>

            {/* Input Group */}
            <div className="input-group input-group-lg shadow-sm">
              <input
                type="text"
                className="form-control form-control-lg border-2 border-end-0 py-3 px-4"
                placeholder="Paste your video link here..."
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                style={{
                  borderRadius: '12px 0 0 12px',
                  borderColor: '#e0e0e0'
                }}
              />
              <button
                className="btn btn-primary py-3 px-4 d-flex align-items-center gap-2"
                onClick={handleAddClick}
                disabled={isLoading}
                style={{
                  borderRadius: '0 12px 12px 0',
                  border: '2px solid #0d6efd',
                  borderLeft: 'none'
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Add Video
                  </>
                )}
              </button>
            </div>

            {/* Supported Platforms */}
            <div className="mt-4">
              <p className="text-muted small mb-2">Supported platforms:</p>
              <div className="d-flex justify-content-center gap-4">
                <div className="d-flex align-items-center gap-2">
                  <FaYoutube className="text-danger" />
                  <span className="text-muted">YouTube</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <FaVimeo className="text-primary" />
                  <span className="text-muted">Vimeo</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-dark text-white rounded px-2 py-1 small fw-bold">
                    W
                  </div>
                  <span className="text-muted">Wistia</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-4 p-3 bg-white rounded-3 shadow-sm">
              <p className="text-muted small mb-0">
                💡 <strong>Tip:</strong> Make sure your video link is public or unlisted
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoBlock;