const TextView = ({ blockId, parentId, title, content }) => {
  // console.log("TextView", blockId, parentId, title, content);

  if (!title && !content) return null;

  return (
    <div
      style={{
        background: "#fff",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "16px" }}>{title}</h2>
      <div
        className="ql-editor"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default TextView;
