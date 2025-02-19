import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { Loader2, Wand2, Image as ImageIcon, GitGraph, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import axiosInstance from '@/api/axios';

const VisualizerGenerate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('auto'); // auto, mermaid, image

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        topic: data.topic,
        forceMode: mode === 'auto' ? null : mode.toUpperCase(),
      };

      const response = await axiosInstance.post('/visualizer/generate', payload);

      if (response.data.success) {
        navigate(`/dashboard/visualizer/${response.data.data.id}`);
      }
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err.response?.data?.message || 'Failed to generate visualization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">AI Topic Visualizer</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Turn complex concepts into clear diagrams or professional illustrations instantly.
        </p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Create New Visualization</CardTitle>
          <CardDescription>
            Describe what you want to visualize. The AI will choose the best format or you can select one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic or Description</Label>
              <Textarea
                id="topic"
                placeholder="E.g., 'Flowchart of user authentication process', 'Anatomy of the human heart', 'Class diagram for a library system'..."
                className="min-h-[100px] resize-none"
                {...register('topic', { 
                  required: 'Topic is required',
                  minLength: { value: 3, message: 'Topic must be at least 3 characters' }
                })}
              />
              {errors.topic && (
                <p className="text-sm text-destructive">{errors.topic.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Visualization Mode</Label>
              <RadioGroup defaultValue="auto" value={mode} onValueChange={setMode} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                
                {/* Auto Mode */}
                <div className={`relative flex cursor-pointer flex-col rounded-lg border p-4 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 ${mode === 'auto' ? 'border-primary ring-1 ring-primary' : 'border-zinc-200 dark:border-zinc-800'}`}>
                  <RadioGroupItem value="auto" id="auto" className="sr-only" />
                  <Label htmlFor="auto" className="cursor-pointer">
                    <div className="flex items-center gap-2 font-semibold">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      Auto-Detect
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Let AI decide the best format based on your topic.
                    </p>
                  </Label>
                </div>

                {/* Diagram Mode */}
                <div className={`relative flex cursor-pointer flex-col rounded-lg border p-4 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 ${mode === 'mermaid' ? 'border-primary ring-1 ring-primary' : 'border-zinc-200 dark:border-zinc-800'}`}>
                  <RadioGroupItem value="mermaid" id="mermaid" className="sr-only" />
                  <Label htmlFor="mermaid" className="cursor-pointer">
                    <div className="flex items-center gap-2 font-semibold">
                      <GitGraph className="h-4 w-4 text-blue-500" />
                      Diagram
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Flowcharts, sequences, mindmaps. Best for processes.
                      <span className="block mt-1 font-medium text-emerald-600 dark:text-emerald-400">1 Credit</span>
                    </p>
                  </Label>
                </div>

                {/* Image Mode */}
                <div className={`relative flex cursor-pointer flex-col rounded-lg border p-4 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 ${mode === 'image' ? 'border-primary ring-1 ring-primary' : 'border-zinc-200 dark:border-zinc-800'}`}>
                  <RadioGroupItem value="image" id="image" className="sr-only" />
                  <Label htmlFor="image" className="cursor-pointer">
                    <div className="flex items-center gap-2 font-semibold">
                      <ImageIcon className="h-4 w-4 text-purple-500" />
                      Illustration
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      High-quality AI images. Best for anatomy, nature, objects.
                      <span className="block mt-1 font-medium text-amber-600 dark:text-amber-400">5 Credits</span>
                    </p>
                  </Label>
                </div>

              </RadioGroup>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Visualization...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Visualization
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualizerGenerate;
