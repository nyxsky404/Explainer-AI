import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, Loader2, Volume2 } from 'lucide-react';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import AudioPlayer from '@/components/shared/AudioPlayer';
import { truncateUrl } from '@/lib/utils';

export default function SummaryDisplay({
    summary,
    onGenerateAudio,
    isGeneratingAudio,
    showGenerateAudioButton = true
}) {
    const audioStatus = summary?.audioStatus;
    const isGenerating = isGeneratingAudio || audioStatus === 'generating';

    return (
        <div className="space-y-6">
            {/* Audio Generation Progress Bar */}
            {isGenerating && (
                <Card className="border-primary/50 bg-primary/5">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                            <Loader2 className="size-5 animate-spin text-primary" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Generating Audio...</p>
                                <p className="text-xs text-muted-foreground">
                                    Converting your summary to speech. This may take a moment.
                                </p>
                                <Progress value={66} className="mt-2 h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Source URL with Audio Status/Button */}
            <Card className="bg-muted/30">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                            <span className="text-muted-foreground shrink-0">Source:</span>
                            <a
                                href={summary.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1 truncate"
                            >
                                {truncateUrl(summary.sourceUrl)}
                                <ExternalLink className="size-3 shrink-0" />
                            </a>
                        </div>
                        {summary.audioUrl ? (
                            <Badge variant="secondary" className="gap-1 shrink-0">
                                <Volume2 className="size-3" />
                                {showGenerateAudioButton ? "Audio Ready" : "Audio Available"}
                            </Badge>
                        ) : audioStatus === 'failed' ? (
                            showGenerateAudioButton && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onGenerateAudio}
                                    disabled={isGenerating}
                                    className="gap-2 shrink-0 text-destructive"
                                >
                                    <Volume2 className="size-4" />
                                    Retry Audio
                                </Button>
                            )
                        ) : (
                            showGenerateAudioButton && !isGenerating && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onGenerateAudio}
                                    disabled={isGenerating}
                                    className="gap-2 shrink-0"
                                >
                                    <Volume2 className="size-4" />
                                    Generate Audio
                                </Button>
                            )
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Audio Player */}
            {summary.audioUrl && (
                <AudioPlayer src={summary.audioUrl} title="Listen to Summary" />
            )}

            {/* Summary Content */}
            <Card>
                <CardContent className="py-6">
                    <MarkdownRenderer content={summary.content} />
                </CardContent>
            </Card>
        </div>
    );
}

