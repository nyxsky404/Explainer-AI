import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Zap, FileText, BookOpen } from 'lucide-react';

const depthOptions = [
  {
    value: 'quick',
    label: 'Quick Take',
    description: '~30 sec read, just the essentials',
    icon: Zap,
  },
  {
    value: 'standard',
    label: 'Standard',
    description: '~2 min read, key ideas explained',
    icon: FileText,
  },
  {
    value: 'detailed',
    label: 'Deep Dive',
    description: '~5 min read, comprehensive analysis',
    icon: BookOpen,
  },
];

export default function DepthSelector({ value = 'standard', onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Output Depth</p>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(val) => {
          if (val) onChange(val);
        }}
        variant="outline"
        className="w-full grid grid-cols-3 gap-1"
      >
        {depthOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          return (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              aria-label={option.label}
              className={`flex flex-col items-center gap-1 py-3 px-2 h-auto rounded-md transition-all ${
                isSelected
                  ? 'bg-primary/10 text-primary border-primary'
                  : 'hover:bg-muted'
              }`}
            >
              <Icon className="size-4" />
              <span className="text-xs font-medium">{option.label}</span>
              <span className="text-[10px] text-muted-foreground leading-tight text-center hidden sm:block">
                {option.description}
              </span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
