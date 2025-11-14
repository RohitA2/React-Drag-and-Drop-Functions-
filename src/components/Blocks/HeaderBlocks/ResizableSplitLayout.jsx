import React, { useRef, useState, useEffect, useCallback } from 'react';

const ResizableSplitLayout = ({
  leftContent,
  rightContent,
  defaultLeftWidth = 50,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  isPreview = false
}) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringDivider, setIsHoveringDivider] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    if (isPreview) return;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    const percentage = Math.min(Math.max((mouseX / containerWidth) * 100, minLeftWidth), maxLeftWidth);
    
    setLeftWidth(percentage);
  }, [isDragging, minLeftWidth, maxLeftWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      className="d-flex position-relative w-100 h-100"
      ref={containerRef}
      style={{
        overflow: 'hidden',
      }}
    >
      {/* Left Panel - now with explicit border */}
      <div 
        className="h-100"
        style={{
          width: `${leftWidth}%`,
          transition: isDragging ? 'none' : 'width 0.2s ease-out',
          overflow: 'hidden',
          position: 'relative',
          borderRight: isDragging ? '2px solid #FC0404' : 
                     isHoveringDivider ? '2px solid rgba(252, 4, 4, 0.7)' : '2px solid transparent'
        }}
      >
        {leftContent}
      </div>

      {/* Right Panel - now with explicit border */}
      <div 
        className="h-100"
        style={{
          width: `${100 - leftWidth}%`,
          transition: isDragging ? 'none' : 'width 0.2s ease-out',
          overflow: 'hidden',
          position: 'relative',
          borderLeft: isDragging ? '2px solid #FC0404' : 
                     isHoveringDivider ? '2px solid rgba(252, 4, 4, 0.7)' : '2px solid transparent'
        }}
      >
        {rightContent}
      </div>

      {/* Divider Handle - now purely interactive without visual element */}
      {!isPreview && (
        <div
          style={{
            width: '12px',
            cursor: 'col-resize',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${leftWidth}%`,
            transform: 'translateX(-50%)',
            zIndex: 10,
            pointerEvents: 'auto',
          }}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setIsHoveringDivider(true)}
          onMouseLeave={() => setIsHoveringDivider(false)}
        />
      )}
    </div>
  );
};

export default ResizableSplitLayout;