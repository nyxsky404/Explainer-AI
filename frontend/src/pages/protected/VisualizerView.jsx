import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Loader2, Trash2, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import axiosInstance from '@/api/axios';
import MermaidRenderer from '@/components/shared/MermaidRenderer';
import ImageViewer from '@/components/shared/ImageViewer';

const VisualizerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visualization, setVisualization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchVisualization = async () => {
      try {
        const response = await axiosInstance.get(`/visualizer/${id}`);
        if (response.data.success) {
          setVisualization(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch visualization:', err);
        setError('Failed to load visualization.');
      } finally {
        setLoading(false);
      }
    };

    fetchVisualization();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this visualization?')) return;
    
    setDeleting(true);
    try {
      await axiosInstance.delete(`/visualizer/${id}`);
      navigate('/dashboard/visualizer/library');
    } catch (err) {
      console.error('Delete failed:', err);
      // Optional: show toast error
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !visualization) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Visualization not found'}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard/visualizer/library')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-[calc(100vh-100px)] py-4 flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/visualizer/library')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{visualization.topic}</h1>
            <p className="text-sm text-muted-foreground">
              Generated on {new Date(visualization.createdAt).toLocaleDateString()} • {visualization.type} Mode
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
           {/* Future: Edit/Regenerate button */}
           <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {visualization.type === 'MERMAID' ? (
          <MermaidRenderer chart={visualization.content} title={visualization.topic} />
        ) : (
          <ImageViewer src={visualization.content} title={visualization.topic} />
        )}
      </div>
    </div>
  );
};

export default VisualizerView;
