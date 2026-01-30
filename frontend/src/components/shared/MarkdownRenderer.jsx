import ReactMarkdown from 'react-markdown';

export default function MarkdownRenderer({ content }) {
    if (!content) return null;

    return (
        <article className="prose prose-neutral dark:prose-invert max-w-none
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
        ">
            <ReactMarkdown>{content}</ReactMarkdown>
        </article>
    );
}
