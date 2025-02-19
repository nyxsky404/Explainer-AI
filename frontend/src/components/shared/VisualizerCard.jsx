import React from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitGraph, Image as ImageIcon, Calendar } from 'lucide-react';

const VisualizerCard = ({ visualization }) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="cursor-pointer overflow-hidden transition-all hover:shadow-md dark:hover:bg-zinc-900/50"
      onClick={() => navigate(`/dashboard/visualizer/${visualization.id}`)}
    >
      <CardHeader className="p-0">
        <div className="flex h-32 w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">
          {visualization.type === 'MERMAID' ? (
            <GitGraph className="h-12 w-12 text-blue-500/50" />
          ) : (
            <div className="relative h-full w-full">
                <img 
                    src={visualization.content} 
                    alt={visualization.topic} 
                    className="h-full w-full object-cover opacity-80"
                    loading="lazy"
                />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <Badge variant={visualization.type === 'MERMAID' ? 'default' : 'secondary'} className="text-xs">
            {visualization.type === 'MERMAID' ? 'Diagram' : 'Image'}
          </Badge>
          <span className="flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            {new Date(visualization.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="line-clamp-2 font-medium leading-tight text-zinc-900 dark:text-zinc-100">
          {visualization.topic}
        </h3>
      </CardContent>
    </Card>
  );
};

export default VisualizerCard;
