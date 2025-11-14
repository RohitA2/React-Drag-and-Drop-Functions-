// src/components/VideoView.jsx
import React from "react";

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

const VideoView = ({ videoUrl }) => {
  if (!videoUrl) return null;

  const embedUrl = getEmbedUrl(videoUrl);

  if (!embedUrl) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          background: "#f8d7da",
          borderRadius: "8px",
        }}
      >
        Invalid or unsupported video URL
      </div>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-white shadow-sm "
      style={{
        width: "100%",
        padding: "20px",
        backgroundColor: "#F5F5F5",
      }}
    >
      <div
        style={{
          width: "900px",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div className="ratio ratio-16x9">
          <iframe
            src={embedUrl}
            title="Video Viewer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: "none" }}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default VideoView;
