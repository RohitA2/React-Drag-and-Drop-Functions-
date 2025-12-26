// const TextView = ({ blockId, parentId, title, content }) => {
//   // console.log("TextView", blockId, parentId, title, content);

//   if (!title && !content) return null;

//   return (
//     <div
//       style={{
//         background: "#fff",
//         padding: "24px",
//         boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
//       }}
//     >
//       <h2 style={{ textAlign: "center", marginBottom: "16px" }}>{title}</h2>
//       <div
//         className="ql-editor"
//         dangerouslySetInnerHTML={{ __html: content }}
//       />
//     </div>
//   );
// };

// export default TextView;
import { useState, useEffect } from "react";
import axios from "axios";

const TextView = ({ blockId, parentId, title: propTitle, content: propContent }) => {
  const [title, setTitle] = useState(propTitle || "");
  const [content, setContent] = useState(propContent || "");
  const [loading, setLoading] = useState(!propTitle && !propContent);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  // Calculate word and character counts
  useEffect(() => {
    if (content) {
      const text = content.replace(/<[^>]*>/g, ' ').trim();
      const words = text.split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharCount(content.length);
    }
  }, [content]);

  // Fetch content if not provided via props
  useEffect(() => {
    if (propTitle || propContent) {
      setLoading(false);
      return;
    }

    const fetchContent = async () => {
      try {
        const res = await axios.get(
          `${VITE_API_URL}/text/${blockId}/${parentId}`
        );
        if (res.data.success) {
          setTitle(res.data.block.title || "");
          setContent(res.data.block.content || "");
        }
      } catch (err) {
        console.log("No content found");
      } finally {
        setLoading(false);
      }
    };

    if (blockId && parentId) {
      fetchContent();
    }
  }, [blockId, parentId, propTitle, propContent]);

  const formatWordCount = (count) => {
    if (count === 0) return '0';
    if (count < 1000) return count.toString();
    return `${(count / 1000).toFixed(1)}k`;
  };

  const formatCharCount = (count) => {
    if (count === 0) return '0';
    if (count < 1000) return count.toString();
    return `${(count / 1000).toFixed(1)}k`;
  };

  if (loading) {
    return (
      <div className="max-w-[1800px] mx-auto px-4">
        {/* Skeleton Loader */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />

          <div className="p-8">
            {/* Title skeleton */}
            <div className="max-w-3xl mx-auto mb-10">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-4" />
              <div className="h-1 w-24 bg-gray-200 rounded-full mx-auto animate-pulse" />
            </div>

            {/* Content skeleton */}
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mt-8" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
            </div>

            {/* Stats skeleton */}
            <div className="max-w-3xl mx-auto mt-12 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                      <div>
                        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mb-1" />
                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!title && !content) return null;

  return (
    <div className="max-w-[1800px]">
      {/* Main Container */}
      <div className="bg-white shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Top Gradient Bar */}
        <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="p-8">
          {/* Title Section */}
          {title && (
            <div className="max-w-3xl mx-auto mb-10">
              <h1 className="text-4xl font-bold text-gray-900 text-center leading-tight tracking-tight">
                {title}
              </h1>
              <div className="mt-3 h-0.5 w-24 bg-linear-to-r from-blue-500 to-transparent rounded-full mx-auto" />
            </div>
          )}

          {/* Content Section */}
          {content && (
            <div className="max-w-3xl mx-auto">
              <div
                className="ql-editor prose prose-lg prose-blue max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
                style={{
                  fontSize: '1.125rem',
                  lineHeight: '1.75',
                  color: '#374151',
                }}
              />

              {/* Content separator */}
              <div className="mt-10 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />
            </div>
          )}

          {/* Stats Bar */}
          {content && (
            <div className="max-w-3xl mx-auto mt-8 pt-6">
              <div className="flex items-center justify-between">
                {/* Left side: Word & Character Count */}
                <div className="flex items-center space-x-6">
                  {/* Word Count */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {formatWordCount(wordCount)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Words</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {wordCount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Character Count */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">
                        {formatCharCount(charCount)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Characters</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {charCount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Reading Time */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Read time</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {Math.max(1, Math.ceil(wordCount / 200))} min
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side: View Only Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-500 font-medium">
                    Read-only view
                  </span>
                </div>
              </div>

              {/* Progress Bar for Long Content */}
              {wordCount > 100 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-linear-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((wordCount / 5000) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {wordCount > 2000 ? 'Long-form content' : 'Medium-length content'}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {Math.round(Math.min((wordCount / 5000) * 100, 100))}% of typical long-form
                    </p>
                  </div>
                  {/* <p className="text-xs text-gray-400 mt-1 text-center">
                    Write as much as you want — no limits
                  </p> */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom styles for Quill content */}
      <style>{`
        .ql-editor h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #111827;
          margin-top: 2rem;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }
        
        .ql-editor h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-top: 1.75rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        
        .ql-editor h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .ql-editor p {
          margin-bottom: 1.25rem;
          line-height: 1.75;
        }
        
        .ql-editor ul, .ql-editor ol {
          margin-bottom: 1.25rem;
          padding-left: 1.75rem;
        }
        
        .ql-editor li {
          margin-bottom: 0.5rem;
        }
        
        .ql-editor blockquote {
          border-left: 4px solid #3b82f6;
          padding: 1rem 1.5rem;
          margin: 2rem 0;
          background: #f8fafc;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #475569;
        }
        
        .ql-editor pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 2rem 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9rem;
        }
        
        .ql-editor code {
          background: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9em;
          color: #dc2626;
        }
        
        .ql-editor a {
          color: #2563eb;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s;
        }
        
        .ql-editor a:hover {
          border-bottom-color: #2563eb;
        }
        
        .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 2rem auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .ql-editor table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .ql-editor th {
          background: #f8fafc;
          font-weight: 600;
          text-align: left;
          padding: 1rem;
          border: 1px solid #e2e8f0;
        }
        
        .ql-editor td {
          padding: 1rem;
          border: 1px solid #e2e8f0;
        }
      `}</style>
    </div>
  );
};

export default TextView;