import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Lightbulb, Brain, GraduationCap } from 'lucide-react';

const modeOptions = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Simple language, analogies',
    icon: Lightbulb,
    color: 'text-green-500',
  },
  {
    value: 'intuitive',
    label: 'Intuitive',
    description: 'First principles, "why"',
    icon: Brain,
    color: 'text-blue-500',
  },
  {
    value: 'deep',
    label: 'Deep',
    description: 'Expert-level, comprehensive',
    icon: GraduationCap,
    color: 'text-purple-500',
  },
];

export default function ExplainModeSelector({ value = 'easy', onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Explanation Mode</p>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(val) => {
          if (val) onChange(val);
        }}
        variant="outline"
        className="w-full grid grid-cols-3 gap-1"
      >
        {modeOptions.map((option) => {
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
              <Icon className={`size-4 ${isSelected ? option.color : ''}`} />
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
