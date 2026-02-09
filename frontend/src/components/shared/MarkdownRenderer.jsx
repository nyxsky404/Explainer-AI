import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function MarkdownRenderer({ content, onExplainRequest }) {
    const [tooltipPos, setTooltipPos] = useState(null);
    const [selectedText, setSelectedText] = useState('');
    const containerRef = useRef(null);

    const handleMouseUp = useCallback(() => {
        if (!onExplainRequest) return;

        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (text && text.length > 5 && text.length < 500) {
            // Check if selection is within our container
            const range = selection.getRangeAt(0);
            if (containerRef.current?.contains(range.commonAncestorContainer)) {
                const rect = range.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                setTooltipPos({
                    top: rect.top - containerRect.top - 40,
                    left: rect.left - containerRect.left + rect.width / 2,
                });
                setSelectedText(text);
            }
        } else {
            setTooltipPos(null);
            setSelectedText('');
        }
    }, [onExplainRequest]);

    const handleMouseDown = useCallback(() => {
        setTooltipPos(null);
        setSelectedText('');
    }, []);

    // Dismiss on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!containerRef.current?.contains(e.target)) {
                setTooltipPos(null);
                setSelectedText('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExplain = () => {
        if (selectedText && onExplainRequest) {
            onExplainRequest(selectedText);
            setTooltipPos(null);
            setSelectedText('');
            window.getSelection()?.removeAllRanges();
        }
    };

    if (!content) return null;

    return (
        <div ref={containerRef} className="relative">
            {/* Floating Explain Tooltip */}
            {tooltipPos && (
                <div
                    className="absolute z-50 animate-in fade-in-0 zoom-in-95 duration-150"
                    style={{
                        top: `${tooltipPos.top}px`,
                        left: `${tooltipPos.left}px`,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <Button
                        size="sm"
                        variant="default"
                        className="gap-1.5 shadow-lg rounded-full text-xs h-8 px-3"
                        onClick={handleExplain}
                    >
                        <Sparkles className="size-3.5" />
                        Explain this
                    </Button>
                </div>
            )}

            <article
                className="prose prose-neutral dark:prose-invert max-w-none
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                    prose-h1:text-3xl prose-h1:border-b-2 prose-h1:border-border prose-h1:pb-4 prose-h1:mb-8 prose-h1:mt-0
                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/50
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:font-semibold
                    prose-p:text-base prose-p:leading-7 prose-p:mb-4 prose-p:text-foreground/90
                    prose-ul:my-4 prose-ul:ml-2
                    prose-li:my-2 prose-li:leading-7 prose-li:marker:text-muted-foreground
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-hr:my-10 prose-hr:border-border
                    [&>*:first-child]:mt-0
                "
                onMouseUp={handleMouseUp}
                onMouseDown={handleMouseDown}
            >
                <ReactMarkdown>{content}</ReactMarkdown>
            </article>
        </div>
    );
}
