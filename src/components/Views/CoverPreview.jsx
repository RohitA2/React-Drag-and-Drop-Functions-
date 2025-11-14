const CoverPreview = ({ cover }) => {
  if (!cover) return null;

  const { content, settings } = cover;

  const defaultSettings = {
    backgroundColor: "#401C47",
    backgroundImage: null,
    backgroundGradient: null,
    backgroundVideo: null,
    filter: "none",
    position: 50,
    blur: 0,
    overlay: false,
    layoutType: "default",
    textColor: "#ffffff",
    textAlign: "center",
  };

  const mergedSettings = { ...defaultSettings, ...settings };

  const getBackgroundStyle = () => {
    if (mergedSettings.backgroundImage) {
      return {
        backgroundImage: `url(${mergedSettings.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: `${mergedSettings.position}% center`,
        backgroundColor: mergedSettings.backgroundColor,
      };
    } else if (mergedSettings.backgroundGradient) {
      return { background: mergedSettings.backgroundGradient };
    } else {
      return { backgroundColor: mergedSettings.backgroundColor };
    }
  };

  return (
    <div
      className="position-relative bg-white border shadow-sm p-4"
      style={{
        maxWidth: "1800px",
        width: "100%",
        minHeight: "600px",
        border: "1px solid #e3e6e8",
      }}
    >
      <div
        className="position-relative rounded-4 overflow-hidden border border-0"
        style={{
          width: "100%",
          minHeight: "600px",
          padding: "48px 24px 220px 24px",
          backgroundColor: mergedSettings.backgroundColor,
        }}
      >
        {/* Background */}
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

        {/* Content */}
        <div
          className="mx-auto position-relative"
          style={{
            width: "72%",
            maxWidth: "980px",
            zIndex: 2,
            textAlign: mergedSettings.textAlign,
            color: mergedSettings.textColor,
          }}
        >
          <div
            className="rounded-3"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "18px 22px",
              backdropFilter: "blur(2px)",
            }}
          >
            <div
              style={{
                borderLeft:
                  mergedSettings.layoutType === "left-panel"
                    ? "4px solid rgba(255,255,255,0.25)"
                    : "none",
                paddingLeft:
                  mergedSettings.layoutType === "left-panel" ? "16px" : "0",
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: content }}
                style={{ color: mergedSettings.textColor }}
              />
            </div>
          </div>
        </div>

        {/* Bottom white band */}
        <div
          className="position-absolute start-0 end-0"
          style={{
            bottom: 0,
            height: "80px",
            background: "#ffffff",
            zIndex: 2,
          }}
        />
      </div>
    </div>
  );
};

export default CoverPreview;
