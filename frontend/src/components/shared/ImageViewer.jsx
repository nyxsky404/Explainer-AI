import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Download, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ImageViewer = ({ src, alt = 'Visualizer Image', title = 'image' }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}_visual.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      window.open(src, '_blank');
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border bg-zinc-950 shadow-sm">
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <Button size="icon" variant="secondary" className="bg-black/50 hover:bg-black/70 text-white border-0" onClick={() => window.open(src, '_blank')} title="Open Original">
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" className="bg-black/50 hover:bg-black/70 text-white border-0" onClick={handleDownload} title="Download PNG">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit={true}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute bottom-4 right-4 z-10 flex gap-2">
              <Button size="icon" variant="secondary" className="bg-black/50 hover:bg-black/70 text-white border-0" onClick={() => zoomIn()}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="bg-black/50 hover:bg-black/70 text-white border-0" onClick={() => zoomOut()}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="bg-black/50 hover:bg-black/70 text-white border-0" onClick={() => resetTransform()}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full flex items-center justify-center">
              <div className="flex min-h-[400px] w-full items-center justify-center bg-zinc-950 p-4">
                <img 
                  src={src} 
                  alt={alt} 
                  className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl" 
                />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default ImageViewer;
