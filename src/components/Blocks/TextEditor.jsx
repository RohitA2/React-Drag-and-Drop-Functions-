// import { useState, useEffect } from "react";
// import EditableQuill from "./HeaderBlocks/EditableQuill";
// import axios from "axios";

// const TextEditor = ({ blockId, parentId, initialTitle, initialContent }) => {
//   const [title, setTitle] = useState(initialTitle || "");
//   const [value, setValue] = useState(initialContent || "");
//   const [editorVisible, setEditorVisible] = useState(Boolean(initialTitle || initialContent));
//   const VITE_API_URL = import.meta.env.VITE_API_URL;

//   // Load saved block
//   useEffect(() => {
//     // If initial values provided, use them and skip fetch
//     if (initialTitle || initialContent) {
//       setEditorVisible(true);
//       return;
//     }
//     const fetchBlock = async () => {
//       try {
//         const res = await axios.get(
//           `${VITE_API_URL}/text/${blockId}/${parentId}`
//         );
//         if (res.data.success) {
//           setTitle(res.data.block.title || "");
//           setValue(res.data.block.content || "");
//           setEditorVisible(true);
//         }
//       } catch (err) {
//         console.log("No existing block found");
//       }
//     };
//     fetchBlock();
//   }, [blockId, parentId, initialTitle, initialContent]);

//   // Save block whenever title or value changes
//   useEffect(() => {
//     if (!editorVisible) return;

//     const timeout = setTimeout(async () => {
//       await axios.post(`${VITE_API_URL}/text/createorupdatetextblock`, {
//         blockId,
//         parentId,
//         title,
//         content: value,
//       });
//     }, 1000); // debounce save (1 sec after typing)

//     return () => clearTimeout(timeout);
//   }, [title, value, blockId, parentId, editorVisible]);

//   const handleFocusEditor = () => {
//     setEditorVisible(true);
//   };

//   return (
//     <div
//       className="position-relative mx-auto"
//       style={{
//         backgroundColor: "#ffffff",
//         padding: "40px 30px",
//         maxWidth: "1800px",
//         minHeight: "100vh",
//         boxShadow: "0 12px 30px rgba(0, 0, 0, 0.1)",
//       }}
//     >
//       {/* Title Field */}
//       <input
//         type="text"
//         placeholder="Title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         className="form-control text-center fs-3 fw-bold border-0 mb-4"
//         style={{
//           background: "transparent",
//           boxShadow: "none",
//           color: "#4b5563",
//         }}
//       />

//       {/* Quill Editor or Placeholder */}
//       <div onClick={handleFocusEditor} style={{ minHeight: "200px" }}>
//         {!editorVisible ? (
//           <p className="text-muted">Start typing here...</p>
//         ) : (
//           <EditableQuill
//             id={`editor-${blockId}`}
//             value={value}
//             onChange={setValue}
//             placeholder="Start typing here..."
//             style={{
//               minHeight: "150px",
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default TextEditor;


import { useState, useEffect, useCallback } from "react";
import EditableQuill from "./HeaderBlocks/EditableQuill";
import axios from "axios";

const TextEditor = ({ blockId, parentId, initialTitle, initialContent }) => {
  const [title, setTitle] = useState(initialTitle || "");
  const [value, setValue] = useState(initialContent || "");
  const [editorVisible, setEditorVisible] = useState(Boolean(initialTitle || initialContent));
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  // Calculate word count
  const wordCount = useCallback(() => {
    if (!value.trim()) return 0;
    // Remove HTML tags and count words
    const text = value.replace(/<[^>]*>/g, ' ').trim();
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }, [value]);

  // Load saved block
  useEffect(() => {
    // If initial values provided, use them and skip fetch
    if (initialTitle || initialContent) {
      setEditorVisible(true);
      return;
    }
    const fetchBlock = async () => {
      try {
        const res = await axios.get(
          `${VITE_API_URL}/text/${blockId}/${parentId}`
        );
        if (res.data.success) {
          setTitle(res.data.block.title || "");
          setValue(res.data.block.content || "");
          setEditorVisible(true);
        }
      } catch (err) {
        console.log("No existing block found");
      }
    };
    fetchBlock();
  }, [blockId, parentId, initialTitle, initialContent]);

  // Save block whenever title or value changes
  useEffect(() => {
    if (!editorVisible) return;

    const timeout = setTimeout(async () => {
      setIsSaving(true);
      try {
        await axios.post(`${VITE_API_URL}/text/createorupdatetextblock`, {
          blockId,
          parentId,
          title,
          content: value,
        });
        setLastSaved(new Date());
      } catch (err) {
        console.error("Failed to save:", err);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // debounce save (1 sec after typing)

    return () => clearTimeout(timeout);
  }, [title, value, blockId, parentId, editorVisible]);

  const handleFocusEditor = () => {
    setEditorVisible(true);
  };

  const formatTime = useCallback((date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Format word count with commas
  const formatWordCount = useCallback((count) => {
    return count.toLocaleString();
  }, []);

 return (
    <div className="relative mx-auto max-w-[1800px]">
      {/* Status Bar */}

      {/* Main Editor Container */}
      <div className="relative bg-white shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* Title Field */}
        <div className="px-8 pt-12 pb-6">
          <input
            type="text"
            placeholder="Enter a captivating title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent tracking-tight"
          />
          <div className="mt-3 h-0.5 w-24 bg-linear-to-r from-blue-500 to-transparent rounded-full" />
        </div>

        {/* Editor Content Area */}
        <div
          onClick={handleFocusEditor}
          className="min-h-[400px] px-8 pb-12 cursor-text transition-all duration-200 hover:bg-gray-50/50"
        >
          {!editorVisible ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="mb-4 text-gray-300">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-lg text-gray-500 font-medium">Click here to start writing...</p>
                <p className="text-sm text-gray-400 mt-2">Your thoughts are just a click away</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <EditableQuill
                id={`editor-${blockId}`}
                value={value}
                onChange={setValue}
                placeholder="Start typing from here..."
                style={{
                  minHeight: "300px",
                  fontSize: "1.125rem",
                  lineHeight: "1.75",
                }}
              />
              {/* Editor Bottom Border Animation */}
              <div className="mt-4 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />
            </div>
          )}
        </div>

        {/* Editor Stats Bar */}
        <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Real-time Word Count */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">
                    {wordCount() === 0 ? '0' : wordCount() < 1000 ? wordCount() : `${(wordCount() / 1000).toFixed(1)}k`}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Words</p>
                  <p className="text-sm font-medium text-gray-700">
                    {formatWordCount(wordCount())}
                  </p>
                </div>
              </div>

              {/* Character Count (Optional) */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-purple-600">
                    {value.length === 0 ? '0' : value.length < 1000 ? value.length : `${(value.length / 1000).toFixed(1)}k`}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Characters</p>
                  <p className="text-sm font-medium text-gray-700">
                    {value.length.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Auto-save Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-xs text-gray-500">
                {isSaving ? 'Saving...' : 'Auto-save enabled'}
              </span>
            </div>
          </div>

          {/* Writing Progress Bar (Optional visual) */}
          {wordCount() > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-linear-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((wordCount() / 10000) * 100, 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                Write as much as you want — no limits
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextEditor;





