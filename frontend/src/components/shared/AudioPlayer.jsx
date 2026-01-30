import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Volume2 } from 'lucide-react';

export default function AudioPlayer({ src, title = "Audio Player" }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (audioRef.current) audioRef.current.currentTime = percent * duration;
    };

    const formatTime = (seconds) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Reset state when src changes
    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [src]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Volume2 className="size-5" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <audio
                    ref={audioRef}
                    src={src}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                />
                <div 
                    className="h-2 bg-secondary rounded-full cursor-pointer relative overflow-hidden" 
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-primary transition-all duration-100 ease-out"
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground w-12">{formatTime(currentTime)}</span>
                    <Button size="icon" onClick={togglePlay} className="size-12 rounded-full shadow-md">
                        {isPlaying ? <Pause className="size-6" /> : <Play className="size-6 ml-1" />}
                    </Button>
                    <span className="text-sm text-muted-foreground w-12 text-right">{formatTime(duration)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
