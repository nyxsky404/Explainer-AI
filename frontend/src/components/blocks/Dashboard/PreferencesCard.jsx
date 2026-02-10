import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Settings, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

const readingLevelOptions = [
  { value: 'beginner', label: 'Beginner', description: 'Simple language, everyday analogies' },
  { value: 'intermediate', label: 'Intermediate', description: 'Clear and accessible' },
  { value: 'expert', label: 'Expert', description: 'Domain-specific, dense insights' },
];

const toneOptions = [
  { value: 'casual', label: 'Casual', description: 'Relaxed and friendly' },
  { value: 'conversational', label: 'Conversational', description: 'Warm and natural' },
  { value: 'professional', label: 'Professional', description: 'Clear and polished' },
  { value: 'academic', label: 'Academic', description: 'Structured and analytical' },
];

const depthOptions = [
  { value: 'quick', label: 'Quick Take', description: '~30 sec read' },
  { value: 'standard', label: 'Standard', description: '~2 min read' },
  { value: 'detailed', label: 'Deep Dive', description: '~5 min read' },
];

export default function PreferencesCard() {
  const { preferences, updatePreferences } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localPrefs, setLocalPrefs] = useState({
    readingLevel: 'intermediate',
    tone: 'conversational',
    defaultDepth: 'standard',
  });

  // Sync local state when preferences load from context
  useEffect(() => {
    if (preferences) {
      setLocalPrefs({
        readingLevel: preferences.readingLevel || 'intermediate',
        tone: preferences.tone || 'conversational',
        defaultDepth: preferences.defaultDepth || 'standard',
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updatePreferences(localPrefs);
      setSaved(true);
      toast.success('Preferences saved successfully');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    localPrefs.readingLevel !== (preferences?.readingLevel || 'intermediate') ||
    localPrefs.tone !== (preferences?.tone || 'conversational') ||
    localPrefs.defaultDepth !== (preferences?.defaultDepth || 'standard');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="size-5 text-muted-foreground" />
          <div>
            <CardTitle>Content Preferences</CardTitle>
            <CardDescription>
              Customize how AI adapts content for you
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Reading Level */}
        <div className="space-y-1.5">
          <Label htmlFor="readingLevel">Reading Level</Label>
          <Select
            value={localPrefs.readingLevel}
            onValueChange={(val) =>
              setLocalPrefs((prev) => ({ ...prev, readingLevel: val }))
            }
          >
            <SelectTrigger id="readingLevel" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {readingLevelOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    — {opt.description}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tone */}
        <div className="space-y-1.5">
          <Label htmlFor="tone">Tone</Label>
          <Select
            value={localPrefs.tone}
            onValueChange={(val) =>
              setLocalPrefs((prev) => ({ ...prev, tone: val }))
            }
          >
            <SelectTrigger id="tone" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    — {opt.description}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Default Depth */}
        <div className="space-y-1.5">
          <Label htmlFor="defaultDepth">Default Output Depth</Label>
          <Select
            value={localPrefs.defaultDepth}
            onValueChange={(val) =>
              setLocalPrefs((prev) => ({ ...prev, defaultDepth: val }))
            }
          >
            <SelectTrigger id="defaultDepth" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {depthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    — {opt.description}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="w-full gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving...
            </>
          ) : saved ? (
            <>
              <Check className="size-4" /> Saved
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
