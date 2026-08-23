import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';

const ScanViewer = ({ scanUrl, type }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  return (
    <div className="flex flex-col h-full bg-[#050810] rounded-xl overflow-hidden border border-[var(--border-color)]">
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <span className="badge badge-primary uppercase">{type}</span>
          <span className="text-xs text-[var(--text-secondary)]">Zoom: {Math.round(scale * 100)}%</span>
        </div>
        
        <div className="flex gap-1">
          <button onClick={handleZoomOut} className="p-1.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-white" title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <button onClick={handleReset} className="p-1.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-white" title="Reset">
            <RotateCcw size={18} />
          </button>
          <button onClick={handleZoomIn} className="p-1.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-white" title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button className="p-1.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-white ml-2" title="Fullscreen">
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {/* Viewer Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div 
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          className="relative"
        >
          <img 
            src={scanUrl} 
            alt="Medical Scan" 
            className="max-w-full max-h-[800px] object-contain pointer-events-none"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ScanViewer;
