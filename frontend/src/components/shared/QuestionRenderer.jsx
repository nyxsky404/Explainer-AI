import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, RefreshCw, HelpCircle } from 'lucide-react';

const typeLabels = {
  mcq: 'Multiple Choice',
  true_false: 'True / False',
  fill_blank: 'Fill in the Blank',
  short_answer: 'Short Answer',
};

const typeColors = {
  mcq: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  true_false: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  fill_blank: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  short_answer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

/**
 * Renders a single quiz question in attempt mode (answerable) or review mode (showing results)
 */
export default function QuestionRenderer({
  question,
  index,
  value,
  onChange,
  result, // { isCorrect, correctAnswer, explanation } — only in review mode
  disabled = false,
  onRegenerate, // optional — only in preview/edit mode
  isRegenerating = false,
}) {
  const isReview = !!result;

  return (
    <Card
      className={cn(
        'transition-colors',
        isReview && result.isCorrect && 'border-green-300 dark:border-green-800',
        isReview && !result.isCorrect && 'border-red-300 dark:border-red-800'
      )}
    >
      <CardContent className="pt-5 space-y-4">
        {/* Question header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {index + 1}
            </span>
            <div className="space-y-2 flex-1">
              <p className="font-medium leading-relaxed">{question.question}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={cn('text-xs', typeColors[question.type])}>
                  {typeLabels[question.type] || question.type}
                </Badge>
                {question.concept && (
                  <Badge variant="outline" className="text-xs">
                    {question.concept}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {onRegenerate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRegenerate(question.id)}
              disabled={isRegenerating}
              title="Regenerate this question"
            >
              <RefreshCw className={cn('size-4', isRegenerating && 'animate-spin')} />
            </Button>
          )}
          {isReview && (
            <div className="flex-shrink-0">
              {result.isCorrect ? (
                <CheckCircle2 className="size-6 text-green-500" />
              ) : (
                <XCircle className="size-6 text-red-500" />
              )}
            </div>
          )}
        </div>

        {/* Answer input */}
        <div className="pl-10">
          {question.type === 'mcq' && (
            <MCQInput
              options={question.options}
              value={value}
              onChange={onChange}
              disabled={disabled || isReview}
              result={result}
              correctAnswer={question.correctAnswer}
            />
          )}
          {question.type === 'true_false' && (
            <TrueFalseInput
              value={value}
              onChange={onChange}
              disabled={disabled || isReview}
              result={result}
              correctAnswer={question.correctAnswer}
            />
          )}
          {question.type === 'fill_blank' && (
            <FillBlankInput
              value={value}
              onChange={onChange}
              disabled={disabled || isReview}
              result={result}
            />
          )}
          {question.type === 'short_answer' && (
            <ShortAnswerInput
              value={value}
              onChange={onChange}
              disabled={disabled || isReview}
              result={result}
            />
          )}

          {/* Review: show explanation */}
          {isReview && result.explanation && (
            <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-start gap-2">
                <HelpCircle className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  {!result.isCorrect && (
                    <p className="font-medium text-sm mb-1">
                      Correct answer:{' '}
                      <span className="text-green-600 dark:text-green-400">
                        {typeof result.correctAnswer === 'boolean'
                          ? result.correctAnswer
                            ? 'True'
                            : 'False'
                          : result.correctAnswer}
                      </span>
                    </p>
                  )}
                  <p className="text-muted-foreground">{result.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MCQInput({ options, value, onChange, disabled, result, correctAnswer }) {
  return (
    <div className="space-y-2">
      {options.map((option, i) => {
        const letter = option.charAt(0);
        const isSelected = value === letter;
        const isCorrect = result && correctAnswer === letter;
        const isWrong = result && isSelected && !result.isCorrect;

        return (
          <button
            key={i}
            type="button"
            onClick={() => !disabled && onChange(letter)}
            disabled={disabled}
            className={cn(
              'w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm',
              !result && !isSelected && 'border-border hover:border-primary/50 hover:bg-accent',
              !result && isSelected && 'border-primary bg-primary/10',
              isCorrect && 'border-green-500 bg-green-50 dark:bg-green-950/20',
              isWrong && 'border-red-500 bg-red-50 dark:bg-red-950/20',
              disabled && 'cursor-default'
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function TrueFalseInput({ value, onChange, disabled, result, correctAnswer }) {
  return (
    <div className="flex gap-3">
      {[true, false].map((opt) => {
        const isSelected = value === opt;
        const isCorrect = result && correctAnswer === opt;
        const isWrong = result && isSelected && !result.isCorrect;

        return (
          <button
            key={String(opt)}
            type="button"
            onClick={() => !disabled && onChange(opt)}
            disabled={disabled}
            className={cn(
              'flex-1 px-4 py-3 rounded-lg border transition-colors text-sm font-medium',
              !result && !isSelected && 'border-border hover:border-primary/50 hover:bg-accent',
              !result && isSelected && 'border-primary bg-primary/10',
              isCorrect && 'border-green-500 bg-green-50 dark:bg-green-950/20',
              isWrong && 'border-red-500 bg-red-50 dark:bg-red-950/20',
              disabled && 'cursor-default'
            )}
          >
            {opt ? 'True' : 'False'}
          </button>
        );
      })}
    </div>
  );
}

function FillBlankInput({ value, onChange, disabled, result }) {
  return (
    <div>
      <Input
        type="text"
        placeholder="Type your answer..."
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          result && result.isCorrect && 'border-green-500',
          result && !result.isCorrect && 'border-red-500'
        )}
      />
    </div>
  );
}

function ShortAnswerInput({ value, onChange, disabled, result }) {
  return (
    <div>
      <Textarea
        placeholder="Write your answer..."
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'min-h-[80px]',
          result && result.isCorrect && 'border-green-500',
          result && !result.isCorrect && 'border-red-500'
        )}
      />
    </div>
  );
}
