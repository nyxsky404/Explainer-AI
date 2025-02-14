import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Trash2,
  Loader2,
  Play,
  CheckCircle2,
  Clock,
  Trophy,
  RotateCcw,
  ClipboardList,
} from 'lucide-react';
import QuestionRenderer from '@/components/shared/QuestionRenderer';
import DeleteDialog from '@/components/blocks/DetailsDialogs/delete-dialog';

const difficultyColors = {
  EASY: 'bg-green-500',
  MEDIUM: 'bg-amber-500',
  HARD: 'bg-red-500',
};

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Quiz attempt state
  const [mode, setMode] = useState('preview'); // preview, attempt, results
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState(null);

  // Timer
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quiz/${id}`);
      setQuiz(res.data.data);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setMode('attempt');
    setAnswers({});
    setResults(null);
    setStartTime(Date.now());
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    // Check if all questions answered
    const unanswered = quiz.questions.filter(
      (q) => answers[q.id] === undefined || answers[q.id] === ''
    );
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);

    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const res = await api.post(`/quiz/${id}/submit`, { answers, timeTaken });

      if (res.data.success) {
        setResults(res.data.data);
        setMode('results');
        toast.success(`Quiz completed! Score: ${res.data.data.score}%`);
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerate = async (questionId) => {
    setRegeneratingId(questionId);
    try {
      const res = await api.post(`/quiz/${id}/regenerate`, { questionId });
      if (res.data.success) {
        setQuiz(res.data.data);
        toast.success('Question regenerated');
      }
    } catch (error) {
      console.error('Failed to regenerate question:', error);
      toast.error('Failed to regenerate question');
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/quiz/${id}`);
      toast.success('Quiz deleted successfully');
      navigate('/dashboard/quiz');
    } catch (error) {
      toast.error('Failed to delete quiz');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const resetQuiz = () => {
    setMode('preview');
    setAnswers({});
    setResults(null);
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== ''
  ).length;

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Quiz not found</p>
        <Link to="/dashboard/quiz">
          <Button variant="outline" className="mt-4">
            Back to Quizzes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/quiz')}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to Quizzes
        </Button>
        <div className="flex items-center gap-2">
          {mode === 'attempt' && (
            <Badge variant="outline" className="gap-1.5 text-sm">
              <Clock className="size-3" />
              {formatTime(elapsed)}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleting}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Quiz Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-5 text-primary" />
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              </div>
              {quiz.description && (
                <CardDescription>{quiz.description}</CardDescription>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={difficultyColors[quiz.difficulty]}>
                  {quiz.difficulty}
                </Badge>
                <Badge variant="outline">{quiz.questionCount} questions</Badge>
                <Badge variant="secondary">
                  {new Date(quiz.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {mode === 'preview' && (
            <Button onClick={startQuiz} className="w-full gap-2" size="lg">
              <Play className="size-4" />
              Start Quiz
            </Button>
          )}
          {mode === 'attempt' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {answeredCount} of {quiz.questions.length} answered
                </span>
                <span className="font-medium">
                  {quiz.questions.length === 0 ? 0 : Math.round((answeredCount / quiz.questions.length) * 100)}%
                </span>
              </div>
              <Progress 
                value={quiz.questions.length === 0 ? 0 : (answeredCount / quiz.questions.length) * 100} 
                className="h-2" 
              />
            </div>
          )}
          {mode === 'results' && results && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted/50">
                  <Trophy className="size-6 mx-auto mb-1 text-amber-500" />
                  <p className="text-2xl font-bold">{results.score}%</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="size-6 mx-auto mb-1 text-green-500" />
                  <p className="text-2xl font-bold">
                    {results.correctCount}/{results.totalQuestions}
                  </p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <Clock className="size-6 mx-auto mb-1 text-blue-500" />
                  <p className="text-2xl font-bold">{formatTime(results.attempt?.timeTaken || elapsed)}</p>
                  <p className="text-xs text-muted-foreground">Time</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={resetQuiz} variant="outline" className="flex-1 gap-2">
                  <RotateCcw className="size-4" />
                  Try Again
                </Button>
                <Button
                  onClick={() => navigate('/dashboard/quiz/generate')}
                  className="flex-1 gap-2"
                >
                  New Quiz
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Attempts (preview mode) */}
      {mode === 'preview' && quiz.attempts && quiz.attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Previous Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quiz.attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Trophy
                      className={`size-4 ${
                        attempt.score >= 80
                          ? 'text-amber-500'
                          : attempt.score >= 50
                            ? 'text-blue-500'
                            : 'text-muted-foreground'
                      }`}
                    />
                    <span className="font-semibold">{attempt.score}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {attempt.timeTaken && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatTime(attempt.timeTaken)}
                      </span>
                    )}
                    <span>
                      {new Date(attempt.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      {(mode === 'preview' || mode === 'attempt' || mode === 'results') && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {mode === 'preview' && 'Questions Preview'}
            {mode === 'attempt' && 'Questions'}
            {mode === 'results' && 'Review'}
          </h2>
          {quiz.questions.map((question, index) => {
            const resultData = results?.results?.find((r) => r.questionId === question.id);
            return (
              <QuestionRenderer
                key={question.id}
                question={question}
                index={index}
                value={answers[question.id]}
                onChange={(val) => handleAnswerChange(question.id, val)}
                result={mode === 'results' ? resultData : undefined}
                disabled={mode === 'preview'}
                onRegenerate={mode === 'preview' ? handleRegenerate : undefined}
                isRegenerating={regeneratingId === question.id}
              />
            );
          })}
        </div>
      )}

      {/* Submit button (attempt mode) */}
      {mode === 'attempt' && (
        <div className="sticky bottom-6">
          <Card className="shadow-lg">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {answeredCount}/{quiz.questions.length} answered &bull;{' '}
                  <Clock className="size-3 inline" /> {formatTime(elapsed)}
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="gap-2"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Submit Quiz
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        isDeleting={deleting}
      />
    </div>
  );
}
