import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axiosInstance from '@/api/axios';
import VisualizerCard from '@/components/shared/VisualizerCard';

const VisualizerLibrary = () => {
    const navigate = useNavigate();
    const [visualizations, setVisualizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchVisualizations();
    }, [page]);

    const fetchVisualizations = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/visualizer/list?page=${page}&limit=12`);
            if (response.data.success) {
                setVisualizations(response.data.data.visualizations);
                setTotalPages(response.data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching visualizations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVisualizations = visualizations.filter(viz => 
        viz.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Visualizer Library</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your generated diagrams and illustrations.</p>
                </div>
                <Button onClick={() => navigate('/dashboard/visualizer/generate')}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Visualization
                </Button>
            </div>

            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search visualizations..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading && page === 1 ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredVisualizations.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredVisualizations.map((viz) => (
                        <VisualizerCard key={viz.id} visualization={viz} />
                    ))}
                </div>
            ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                    <p className="text-lg font-medium text-muted-foreground">No visualizations found</p>
                    <p className="text-sm text-muted-foreground">Create your first diagram to get started.</p>
                    <Button variant="link" onClick={() => navigate('/dashboard/visualizer/generate')}>
                        Create New
                    </Button>
                </div>
            )}
            
            {/* Pagination could go here */}
        </div>
    );
};

export default VisualizerLibrary;
