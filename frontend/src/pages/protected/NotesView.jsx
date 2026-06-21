import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import api from '@/api/axios';
import { toast } from 'sonner';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import HandwrittenRenderer from '@/components/shared/HandwrittenRenderer';
import {
  Loader2,
  Download,
  Share2,
  Trash2,
  ArrowLeft,
  Calendar,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import ShareDialog from '@/components/blocks/DetailsDialogs/share-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function NotesView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleanMode, setCleanMode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const noteContentRef = useRef(null);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await api.get(`/notes/${id}`);
      setNote(response.data.data);
    } catch (error) {
      console.error('Error fetching note:', error);
      toast.error(getFriendlyErrorMessage(error.message));
      navigate('/dashboard/notes');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    setShareDialogOpen(true);
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Note deleted successfully');
      navigate('/dashboard/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error(getFriendlyErrorMessage(error.message));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <p className="text-center text-muted-foreground">Note not found</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/notes')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Notes
        </Button>

        <div className="flex items-start justify-between gap-4">
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
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {exporting ? 'Exporting...' : 'Export PDF'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <ShareDialog
              open={shareDialogOpen}
              onOpenChange={setShareDialogOpen}
              url={`${window.location.origin}/share/notes/${id}`}
              type="note"
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Note</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this note? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Note Content */}
      <Card className="p-6" ref={noteContentRef}>
        <HandwrittenRenderer
          note={note}
          cleanMode={cleanMode}
          onCleanModeChange={setCleanMode}
        />
      </Card>


    </div>
  );
}
