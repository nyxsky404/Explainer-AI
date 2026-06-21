import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

// Normalize LaTeX delimiters that AI sometimes outputs incorrectly
function preprocessMath(content) {
    if (!content) return content;
    // \[ ... \] → $$ ... $$
    content = content.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `$$\n${math.trim()}\n$$`);
    // \( ... \) → $ ... $
    content = content.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math.trim()}$`);
    // [ math ] on its own line (no backslashes, but contains LaTeX chars like \, {, ^, _)
    content = content.replace(/^[ \t]*\[([^\[\]\n]*(?:\\[^\[\]\n]*|[_^{}][^\[\]\n]*))\][ \t]*$/gm,
        (_, math) => `$$\n${math.trim()}\n$$`
    );
    return content;
}

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
                className="
                    prose prose-neutral dark:prose-invert max-w-none
                    prose-headings:tracking-tight prose-headings:text-foreground
                    prose-h1:text-[2rem] prose-h1:font-extrabold prose-h1:leading-tight
                        prose-h1:border-b-2 prose-h1:border-border prose-h1:pb-4 prose-h1:mb-8 prose-h1:mt-0
                    prose-h2:text-[1.5rem] prose-h2:font-bold prose-h2:leading-snug
                        prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2
                        prose-h2:border-b prose-h2:border-border/40
                    prose-h3:text-[1.2rem] prose-h3:font-semibold prose-h3:leading-snug
                        prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-foreground/90
                    prose-h4:text-base prose-h4:font-semibold prose-h4:uppercase
                        prose-h4:tracking-widest prose-h4:text-muted-foreground
                        prose-h4:mt-6 prose-h4:mb-2
                    prose-p:text-[0.975rem] prose-p:leading-[1.8] prose-p:mb-5 prose-p:text-foreground/85
                    prose-ul:my-4 prose-ul:ml-1 prose-ul:space-y-1
                    prose-ol:my-4 prose-ol:ml-1 prose-ol:space-y-1
                    prose-li:text-[0.975rem] prose-li:leading-[1.8] prose-li:text-foreground/85
                    prose-li:marker:text-muted-foreground/60
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-em:text-foreground/80
                    prose-blockquote:border-l-4 prose-blockquote:border-primary/40
                        prose-blockquote:bg-muted/40 prose-blockquote:rounded-r-md
                        prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:my-6
                        prose-blockquote:text-foreground/80 prose-blockquote:not-italic
                    prose-hr:my-10 prose-hr:border-border/40
                    prose-table:border-collapse prose-table:my-6
                    prose-th:border prose-th:border-border prose-th:bg-muted/60 prose-th:px-4 prose-th:py-2
                    prose-td:border prose-td:border-border/60 prose-td:px-4 prose-td:py-2
                    prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                        prose-code:text-[0.85em] prose-code:font-mono prose-code:text-foreground/90
                    prose-pre:bg-muted/70 prose-pre:rounded-xl prose-pre:overflow-x-auto
                        prose-pre:border prose-pre:border-border/40 prose-pre:my-6
                    [&_.katex-display]:my-6 [&_.katex-display]:overflow-x-auto
                    [&_.katex-display>.katex]:text-[1.1em]
                    [&>*:first-child]:mt-0
                "
                onMouseUp={handleMouseUp}
                onMouseDown={handleMouseDown}
            >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                        h1: ({ children }) => (
                            <h1 className="text-[2rem] font-extrabold tracking-tight border-b-2 border-border pb-4 mb-8 mt-0">{children}</h1>
                        ),
                        h2: ({ children }) => (
                            <h2 className="text-[1.5rem] font-bold tracking-tight mt-12 mb-4 pb-2 border-b border-border/40">{children}</h2>
                        ),
                        h3: ({ children }) => (
                            <h3 className="text-[1.2rem] font-semibold tracking-tight mt-8 mb-3 text-foreground/90">{children}</h3>
                        ),
                        h4: ({ children }) => (
                            <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mt-6 mb-2">{children}</h4>
                        ),
                        table: ({ children }) => (
                            <div className="overflow-x-auto my-6 rounded-lg border border-border/60">
                                <table className="w-full border-collapse">{children}</table>
                            </div>
                        ),
                        th: ({ children }) => (
                            <th className="border-b border-border bg-muted/60 px-4 py-2.5 text-left font-semibold text-sm">{children}</th>
                        ),
                        td: ({ children }) => (
                            <td className="border-b border-border/40 px-4 py-2.5 text-sm last:border-b-0">{children}</td>
                        ),
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary/50 bg-muted/40 rounded-r-lg px-5 py-3 my-6 text-foreground/80 not-italic">{children}</blockquote>
                        ),
                    }}
                >{preprocessMath(content)}</ReactMarkdown>
            </article>
        </div>
    );
}
