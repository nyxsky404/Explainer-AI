import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, Loader2, Volume2, Tags, FileText, Type } from 'lucide-react';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import AudioPlayer from '@/components/shared/AudioPlayer';
import ConceptTag from '@/components/shared/ConceptTag';
import { truncateUrl } from '@/lib/utils';

export default function SummaryDisplay({
    summary,
    onGenerateAudio,
    isGeneratingAudio,
    showGenerateAudioButton = true,
    onExplainRequest,
}) {
    const audioStatus = summary?.audioStatus;
    const isGenerating = isGeneratingAudio || audioStatus === 'generating';
    const concepts = summary?.concepts;
    const hasConcepts = Array.isArray(concepts) && concepts.length > 0;

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
                            {summary.type === 'text' ? (
                                <div className="text-primary inline-flex items-center gap-1 truncate cursor-default">
                                    <Type className="size-4" />
                                    Pasted Text
                                </div>
                            ) : summary.type === 'pdf' ? (
                                <a
                                    href={summary.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline inline-flex items-center gap-1 truncate"
                                >
                                    <FileText className="size-4" />
                                    View Original PDF
                                    <ExternalLink className="size-3 shrink-0" />
                                </a>
                            ) : (
                                <a
                                    href={summary.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline inline-flex items-center gap-1 truncate"
                                >
                                    {truncateUrl(summary.sourceUrl)}
                                    <ExternalLink className="size-3 shrink-0" />
                                </a>
                            )}
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

            {/* Key Concepts */}
            {hasConcepts && (
                <Card className="bg-muted/20">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Tags className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Key Concepts</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {concepts.map((concept, index) => (
                                <ConceptTag
                                    key={`${concept.term}-${index}`}
                                    term={concept.term}
                                    definition={concept.definition}
                                    category={concept.category}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary Content */}
            <Card>
                <CardContent className="py-6">
                    <MarkdownRenderer
                        content={summary.content}
                        onExplainRequest={onExplainRequest}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
