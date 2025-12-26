import React from "react";
import { AlertCircle, FileText, Shield, CheckCircle, Clock, Eye, Lock } from "lucide-react";

const TermsView = ({ terms }) => {
  if (!terms || !terms.content) return null;

  const { title = "Terms & Conditions", content } = terms;

  // Calculate word count
  const wordCount = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div
      className="position-relative bg-white shadow-lg overflow-hidden border-0"
      style={{
        maxWidth: "1800px",
        width: "100%",
        transition: "all 0.3s ease",
        background: "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
        margin: '0 auto'
      }}
    >
      {/* Header */}
      <div
        className="d-flex align-items-center justify-content-between p-4"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <FileText size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-white fw-bold mb-1">{title}</h3>
            <p className="text-white-50 mb-0 small">
              Legal agreement for document approval
            </p>
          </div>
        </div>

        {/* <div className="d-flex align-items-center gap-3">
          <div className="bg-white-20 rounded-pill px-3 py-1 d-flex align-items-center gap-2">
            <Shield size={14} className="text-white" />
            <span className="text-white small fw-medium">Required</span>
          </div>
          <div className="bg-white rounded-circle p-2">
            <Eye size={16} className="text-primary" />
          </div>
        </div> */}
        <div className="d-flex align-items-center gap-3">
          <div className="text-muted small d-flex align-items-center gap-1">
            <FileText size={14} />
            <span>{wordCount} words</span>
          </div>
          <div className="text-white small d-flex align-items-center gap-1">
            <CheckCircle size={16} />
            <span className="fw-medium">Active Agreement</span>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {/* <div 
        className="alert alert-warning border-0 rounded-0 d-flex align-items-center gap-3 py-3 px-4 m-0"
        style={{
          background: "linear-gradient(90deg, #fff3cd 0%, #ffeaa7 100%)",
          borderLeft: "4px solid #ffc107"
        }}
      >
        <AlertCircle size={20} className="text-warning" />
        <div className="grow">
          <strong className="d-block mb-1">Important Legal Notice</strong>
          <span className="small">
            By approving this document, you legally agree to all terms and conditions specified below.
          </span>
        </div>
        <div className="btn btn-sm btn-outline-warning rounded-pill px-3 d-flex align-items-center gap-2">
          <FileText size={14} />
          View Full Terms
        </div>
      </div> */}

      {/* Main Content */}
      <div className="p-5">
        {/* Content Header */}
        {/* <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-semibold mb-1">Terms Content</h5>
            <p className="text-muted small mb-0">View the terms and conditions below</p>
          </div>
          
        </div> */}

        {/* Terms Content Display */}
        <div
          className="rounded-lg border p-4 bg-light"
          style={{
            minHeight: '200px',
            background: '#f9fafb'
          }}
        >
          <div
            className="ql-editor-view"
            dangerouslySetInnerHTML={{ __html: content }}
            style={{
              fontSize: '1rem',
              lineHeight: '1.6',
              color: '#374151',
            }}
          />
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-4 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle bg-success" style={{ width: 8, height: 8 }} />
                <span>This is a view-only version of the legal agreement</span>
              </div>
            </div>
            <div className="text-muted small d-flex align-items-center gap-1">
              <Lock size={14} />
              <span>Mandatory for document approval</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles for content */}
      <style jsx>{`
        .ql-editor-view h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #2d3748;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .ql-editor-view h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #4a5568;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }
        
        .ql-editor-view h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #718096;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .ql-editor-view p {
          margin-bottom: 1rem;
          line-height: 1.6;
          color: #4a5568;
        }
        
        .ql-editor-view strong {
          color: #2d3748;
          font-weight: 600;
        }
        
        .ql-editor-view ul, .ql-editor-view ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .ql-editor-view li {
          margin-bottom: 0.5rem;
        }
        
        .ql-editor-view blockquote {
          border-left: 4px solid #667eea;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          background: linear-gradient(90deg, #f7fafc 0%, #edf2f7 100%);
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: italic;
          color: #4a5568;
        }
        
        .ql-editor-view a {
          color: #667eea;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        
        .ql-editor-view a:hover {
          border-bottom-color: #667eea;
        }
      `}</style>
    </div>
  );
};

export default TermsView;