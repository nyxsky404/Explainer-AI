import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import api from '@/api/axios';
import { toast } from 'sonner';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, FileText, Link2, FileCheck, BookOpen, List, Workflow, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

const NOTE_STYLES = [
  {
    id: 'CORNELL',
    label: 'Cornell Method',
    icon: BookOpen,
    description: 'Two-column layout with cue column and summary',
  },
  {
    id: 'OUTLINE',
    label: 'Outline',
    icon: List,
    description: 'Hierarchical structure with clear indentation',
  },
  {
    id: 'FLOW',
    label: 'Flow Notes',
    icon: Workflow,
    description: 'Connected concepts with arrows and relationships',
  },
  {
    id: 'BULLET',
    label: 'Bullet Journal',
    icon: Sparkles,
    description: 'Clean bullet points with signifiers',
  },
];

export default function NotesGenerate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const summaryId = searchParams.get('summaryId');

  const [sourceType, setSourceType] = useState(summaryId ? 'summary' : 'text');
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('OUTLINE');
  const [pages, setPages] = useState([2]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (sourceType === 'text' && !textContent.trim()) {
      toast.error('Please enter some content to generate notes from');
      return;
    }

    if (sourceType === 'url' && !urlContent.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);

    try {
      let response;

      if (sourceType === 'summary' && summaryId) {
        // Generate from summary
        response = await api.post(`/notes/generate-from-summary/${summaryId}`, {
          style: selectedStyle,
          pages: pages[0],
        });
      } else {
        // Generate from text or URL
        response = await api.post('/notes/generate', {
          sourceType: sourceType.toUpperCase(),
          sourceContent: sourceType === 'text' ? textContent : urlContent,
          style: selectedStyle,
          pages: pages[0],
        });
      }

      toast.success('Note generated successfully!');
      navigate(`/dashboard/notes/${response.data.data.id}`);
    } catch (error) {
      console.error('Error generating note:', error);
      const message = error.response?.data?.message || getFriendlyErrorMessage(error.message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate Handwritten Notes</h1>
        <p className="text-muted-foreground">
          Create beautifully styled notes from any content with AI
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Source Selection */}
        {!summaryId && (
          <Card>
            <CardHeader>
              <CardTitle>Source Content</CardTitle>
              <CardDescription>Choose where to generate notes from</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={sourceType} onValueChange={setSourceType}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">
                    <FileText className="w-4 h-4 mr-2" />
                    Paste Text
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <Link2 className="w-4 h-4 mr-2" />
                    Enter URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-4">
                  <Textarea
                    placeholder="Paste your content here... (e.g., lecture notes, article text, study material)"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                </TabsContent>

                <TabsContent value="url" className="mt-4">
                  <Input
                    type="url"
                    placeholder="https://example.com/article"
                    value={urlContent}
                    onChange={(e) => setUrlContent(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Enter a URL to an article or webpage
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {summaryId && (
          <Card>
            <CardHeader>
              <CardTitle>Source Content</CardTitle>
              <CardDescription>Generating from existing summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileCheck className="w-4 h-4" />
                <span>Using content from your summary</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Style Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Note Style</CardTitle>
            <CardDescription>Choose your preferred note-taking style</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {NOTE_STYLES.map((style) => {
                const Icon = style.icon;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all hover:border-primary/50 ${
                      selectedStyle === style.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">{style.label}</h3>
                        <p className="text-sm text-muted-foreground">{style.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Page Count */}
        <Card>
          <CardHeader>
            <CardTitle>Note Length</CardTitle>
            <CardDescription>
              How many pages worth of notes? ({pages[0]} page{pages[0] > 1 ? 's' : ''})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Slider
                value={pages}
                onValueChange={setPages}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Brief (1 page)</span>
                <span>Standard (2-3 pages)</span>
                <span>Comprehensive (4-5 pages)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/notes')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Notes (2 credits)
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
