import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import api from '@/api/axios';
import { toast } from 'sonner';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardList,
  Loader2,
  Settings,
  Sparkles,
  ListChecks,
  ToggleLeft,
  TextCursorInput,
  MessageSquare,
} from 'lucide-react';

const questionTypes = [
  { id: 'mcq', label: 'Multiple Choice', icon: ListChecks, description: '4 options, one correct' },
  { id: 'true_false', label: 'True / False', icon: ToggleLeft, description: 'Statement verification' },
  { id: 'fill_blank', label: 'Fill in the Blank', icon: TextCursorInput, description: 'Complete the sentence' },
  { id: 'short_answer', label: 'Short Answer', icon: MessageSquare, description: 'Brief written response' },
];

export default function QuizGenerate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const summaryId = searchParams.get('summaryId');

  const [content, setContent] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedTypes, setSelectedTypes] = useState(['mcq', 'true_false', 'fill_blank']);
  const [focusAreas, setFocusAreas] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleType = (typeId) => {
    setSelectedTypes((prev) => {
      if (prev.includes(typeId)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((t) => t !== typeId);
      }
      return [...prev, typeId];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!summaryId && !content.trim()) {
      toast.error('Please enter content to generate a quiz from');
      return;
    }

    if (!summaryId && content.trim().length < 50) {
      toast.error('Content is too short. Please provide at least 50 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        questionCount: parseInt(questionCount),
        types: selectedTypes,
        difficulty,
        focusAreas: focusAreas.trim() || undefined,
      };

      let res;
      if (summaryId) {
        res = await api.post(`/quiz/generate-from-summary/${summaryId}`, payload);
      } else {
        res = await api.post('/quiz/generate', {
          ...payload,
          content: content.trim(),
          sourceType: 'TEXT',
        });
      }

      if (res.data.success) {
        if (!res?.data?.data?.id) {
          console.error('Unexpected API response:', res);
          toast.error('Unexpected API response - quiz ID missing');
          return;
        }
        const credits = summaryId ? 1 : 2;
        toast.success(`Quiz generated successfully! (${credits} credit${credits > 1 ? 's' : ''} used)`);
        navigate(`/dashboard/quiz/${res.data.data.id}`);
      }
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Heading */}
        <div>
          <h1 className="text-3xl font-bold">AI Quiz Generator</h1>
          <p className="text-muted-foreground">
            Generate quizzes from any content to test your knowledge ({summaryId ? '1 credit' : '2 credits'})
          </p>
        </div>

        {/* Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-5" />
              {summaryId ? 'Generate Quiz from Summary' : 'Create a Quiz'}
            </CardTitle>
            <CardDescription>
              {summaryId
                ? 'A quiz will be generated from your existing summary content'
                : 'Paste text content to automatically generate quiz questions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Content input (only when not from summary) */}
              {!summaryId && (
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste the text you want to generate a quiz from... (minimum 50 characters)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px]"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {content.length} characters
                  </p>
                </div>
              )}

              {summaryId && (
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    Generating from summary: <span className="font-mono text-xs">{summaryId}</span>
                  </p>
                </div>
              )}

              {/* Question Types */}
              <div className="space-y-3">
                <Label>Question Types</Label>
                <div className="grid grid-cols-2 gap-3">
                  {questionTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedTypes.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleType(type.id)}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={isSelected} tabIndex={-1} className="pointer-events-none" />
                          <Icon className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty & Count */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 7, 10, 15, 20].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} questions
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Options */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground px-0"
                  >
                    <Settings className="size-4" />
                    Advanced Options
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="focusAreas">Focus Areas (Optional)</Label>
                    <Input
                      id="focusAreas"
                      placeholder="e.g., key definitions, formulas, historical dates"
                      value={focusAreas}
                      onChange={(e) => setFocusAreas(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Specify which aspects of the content to focus on
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-400">
                <Sparkles className="size-4" />
                Easy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-green-600 dark:text-green-500">
                Basic recall and definitions, perfect for review
              </p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Sparkles className="size-4" />
                Medium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-amber-600 dark:text-amber-500">
                Mix of recall and application, test understanding
              </p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
                <Sparkles className="size-4" />
                Hard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-red-600 dark:text-red-500">
                Analysis, synthesis, and critical thinking
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
