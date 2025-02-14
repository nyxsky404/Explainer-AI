import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ClipboardList, Trophy } from 'lucide-react';

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  HARD: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const sourceTypeLabels = {
  TEXT: 'Text',
  URL: 'URL',
  SUMMARY: 'Summary',
  PDF: 'PDF',
};

export default function QuizCard({ quiz }) {
  const attemptCount = quiz._count?.attempts || 0;

  return (
    <Link to={`/dashboard/quiz/${quiz.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-5 text-primary flex-shrink-0" />
              <CardTitle className="text-base line-clamp-1">{quiz.title}</CardTitle>
            </div>
          </div>
          {quiz.description && (
            <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className={difficultyColors[quiz.difficulty]}>
              {quiz.difficulty}
            </Badge>
            <Badge variant="outline">{quiz.questionCount} questions</Badge>
            <Badge variant="outline">{sourceTypeLabels[quiz.sourceType] || quiz.sourceType}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {attemptCount > 0 && (
                <>
                  <Trophy className="size-3" />
                  {attemptCount} attempt{attemptCount !== 1 ? 's' : ''}
                </>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(quiz.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="w-full gap-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
            Take Quiz <ArrowRight className="size-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
