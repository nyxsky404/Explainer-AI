import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
});

// Mermaid v11 rejects double quotes inside edge labels |"…"| — replace with single quotes
const sanitizeMermaid = (chart) =>
  chart.replace(/\|([^|]*)\|/g, (_, label) => `|${label.replace(/"/g, "'")}|`);

// Convert fixed-dimension SVG to a responsive one via viewBox.
// Only patches the root <svg> tag — child element dimensions must not be touched.
const makeResponsive = (svg) =>
  svg.replace(/<svg\b([^>]*)>/, (_, attrs) => {
    const wMatch = attrs.match(/\bwidth="([\d.]+)"/);
    const hMatch = attrs.match(/\bheight="([\d.]+)"/);
    if (!attrs.includes('viewBox') && wMatch && hMatch) {
      attrs += ` viewBox="0 0 ${wMatch[1]} ${hMatch[1]}"`;
    }
    attrs = attrs.replace(/\bwidth="[\d.]+(?:px)?"/, 'width="100%"');
    attrs = attrs.replace(/\bheight="[\d.]+(?:px)?"/, '');
    return `<svg${attrs}>`;
  });

const MermaidRenderer = ({ chart, title = 'Diagram' }) => {
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart) return;
      try {
        setError(null);
        await mermaid.parse(sanitizeMermaid(chart));
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, sanitizeMermaid(chart));
        setSvgContent(makeResponsive(svg));
        setZoom(1);
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        setError('Failed to render diagram. The AI generated invalid diagram syntax.');
      }
    };
    renderChart();
  }, [chart]);

  const handleDownload = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_diagram.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-zinc-950">
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <Button size="icon" variant="outline" onClick={handleDownload} title="Download SVG">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-full w-full overflow-auto p-6">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease',
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <Button size="icon" variant="secondary" onClick={() => setZoom((z) => Math.min(+(z + 0.2).toFixed(1), 4))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={() => setZoom((z) => Math.max(+(z - 0.2).toFixed(1), 0.2))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={() => setZoom(1)}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MermaidRenderer;
