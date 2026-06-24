import { cn } from '@/lib/utils';

/**
 * Shared shell for generate/summarize pages: a responsive page heading plus a
 * centered content container. Pass `center` for short single-card forms so they
 * sit vertically centered on mobile (reverts to top-aligned on md+); leave it
 * off for tall multi-section forms that scroll.
 */
export default function FormPageLayout({
    title,
    description,
    center = false,
    className,
    children,
}) {
    return (
        <div
            className={cn(
                'mx-auto max-w-2xl space-y-6',
                center &&
                    'flex min-h-[calc(100dvh-8rem)] flex-col justify-center md:block md:min-h-0',
                className
            )}
        >
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
                {description && (
                    <p className="text-sm md:text-base text-muted-foreground">{description}</p>
                )}
            </div>
            {children}
        </div>
    );
}
