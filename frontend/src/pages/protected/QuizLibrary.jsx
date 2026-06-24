import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import QuizCard from '@/components/shared/QuizCard';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';

export default function QuizLibrary() {
  const [quizzes, setQuizzes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchQuizzes();
  }, [page]);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/quiz/list?page=${page}&limit=12`);
      if (res.data.success) {
        setQuizzes(res.data.data.quizzes);
        setPagination(res.data.data.pagination);
      } else {
        const errorMsg = res.data.message || 'Failed to load quizzes';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      const errorMsg = getFriendlyErrorMessage(error);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Quiz Library</h1>
          <p className="text-muted-foreground">Your generated quizzes</p>
        </div>
        <Link to="/dashboard/quiz/generate">
          <Button className="gap-2 shrink-0">
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Quiz</span>
          </Button>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No quizzes yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate your first quiz to start testing your knowledge
            </p>
            <Link to="/dashboard/quiz/generate">
              <Button className="gap-2">
                <Plus className="size-4" />
                Generate Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pagination.totalPages}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
