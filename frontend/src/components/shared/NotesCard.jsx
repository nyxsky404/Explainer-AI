import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye, Trash2, BookOpen, List, Workflow, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const STYLE_ICONS = {
  CORNELL: BookOpen,
  OUTLINE: List,
  FLOW: Workflow,
  BULLET: Sparkles,
};

const STYLE_COLORS = {
  CORNELL: 'bg-blue-100 text-blue-700 border-blue-200',
  OUTLINE: 'bg-green-100 text-green-700 border-green-200',
  FLOW: 'bg-purple-100 text-purple-700 border-purple-200',
  BULLET: 'bg-orange-100 text-orange-700 border-orange-200',
};

export default function NotesCard({ note, onDelete }) {
  const navigate = useNavigate();
  const StyleIcon = STYLE_ICONS[note.style] || List;

  const getPreviewText = () => {
    if (note.sections && note.sections.length > 0) {
      const firstSection = note.sections[0];
      const content = firstSection.content || '';
      return content.substring(0, 150) + (content.length > 150 ? '...' : '');
    }
    return 'No content available';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-lg mb-2 truncate group-hover:text-primary transition-colors"
              onClick={() => navigate(`/dashboard/notes/${note.id}`)}
            >
              {note.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`${STYLE_COLORS[note.style]} flex items-center gap-1`}
              >
                <StyleIcon className="w-3 h-3" />
                <span>{note.style}</span>
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p
          className="text-sm text-muted-foreground mb-4 line-clamp-3"
          onClick={() => navigate(`/dashboard/notes/${note.id}`)}
        >
          {getPreviewText()}
        </p>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/dashboard/notes/${note.id}`)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
