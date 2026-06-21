import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import api from '@/api/axios';
import { Card } from '@/components/ui/card';
import HandwrittenRenderer from '@/components/shared/HandwrittenRenderer';
import { Loader2, Calendar, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PublicNotesView() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cleanMode, setCleanMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const noteContentRef = useRef(null);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await api.get(`/notes/share/${id}`);
      setNote(response.data.data);
    } catch (error) {
      console.error('Error fetching note:', error);
      setError('Note not found or link has expired');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!noteContentRef.current) return;
    setExporting(true);
    try {
      const [{ toPng }, { default: jsPDF }] = await Promise.all([
        import('html-to-image'),
        import('jspdf'),
      ]);

      const element = noteContentRef.current;
      const imgData = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const img = new Image();
      await new Promise((resolve) => { img.onload = resolve; img.src = imgData; });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = pdfWidth / img.naturalWidth;
      const scaledHeight = img.naturalHeight * ratio;

      let yOffset = 0;
      let pageCount = 0;

      while (yOffset < scaledHeight) {
        if (pageCount > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfWidth, scaledHeight);
        yOffset += pdfHeight;
        pageCount++;
      }

      const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      pdf.save(fileName);
      toast.success('PDF downloaded!');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Note Not Found</h1>
        <p className="text-muted-foreground">{error || "This note doesn't exist"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{note.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{note.style}</span>
              </div>
              <div>
                By <span className="font-semibold">{note.user?.name || 'Anonymous'}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {exporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>

        <Card className="p-6 bg-white shadow-md" ref={noteContentRef}>
          <HandwrittenRenderer
            note={note}
            cleanMode={cleanMode}
            onCleanModeChange={setCleanMode}
          />
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Generated with Explainer AI
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Create Your Own Notes
          </a>
        </div>
      </div>
    </div>
  );
}
