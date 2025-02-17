import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '@/api/axios';
import { toast } from 'sonner';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NotesCard from '@/components/shared/NotesCard';
import {
  Loader2,
  Plus,
  Search,
  FileText,
  BookOpen,
  List,
  Workflow,
  Sparkles,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const STYLE_FILTERS = [
  { value: 'all', label: 'All Styles', icon: FileText },
  { value: 'CORNELL', label: 'Cornell', icon: BookOpen },
  { value: 'OUTLINE', label: 'Outline', icon: List },
  { value: 'FLOW', label: 'Flow', icon: Workflow },
  { value: 'BULLET', label: 'Bullet', icon: Sparkles },
];

export default function NotesLibrary() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes/list');
      setNotes(response.data.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error(getFriendlyErrorMessage(error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (noteId) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/notes/${noteToDelete}`);
      toast.success('Note deleted successfully');
      setNotes(notes.filter((note) => note.id !== noteToDelete));
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error(getFriendlyErrorMessage(error.message));
    } finally {
      setDeleting(false);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStyle = styleFilter === 'all' || note.style === styleFilter;
    return matchesSearch && matchesStyle;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Notes</h1>
            <p className="text-muted-foreground">
              {notes.length} note{notes.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard/notes/generate')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Note
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by style" />
            </SelectTrigger>
            <SelectContent>
              {STYLE_FILTERS.map((filter) => {
                const Icon = filter.icon;
                return (
                  <SelectItem key={filter.value} value={filter.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{filter.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery || styleFilter !== 'all' ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || styleFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first handwritten-style note'}
          </p>
          {!searchQuery && styleFilter === 'all' && (
            <Button onClick={() => navigate('/dashboard/notes/generate')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NotesCard key={note.id} note={note} onDelete={handleDeleteClick} />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting}>
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
  );
}
