import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

const CATEGORY_COLORS = {
    concept: 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20',
    person: 'bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20',
    technology: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20',
    event: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20',
    organization: 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20',
    metric: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 hover:bg-cyan-500/20',
    theory: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20',
};

export default function ConceptTag({ term, definition, category = 'concept' }) {
    const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.concept;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Badge
                    variant="outline"
                    className={`cursor-pointer transition-colors text-xs font-medium px-2.5 py-1 ${colorClass}`}
                >
                    {term}
                </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-sm">{term}</h4>
                        <Badge variant="secondary" className="text-[10px] capitalize shrink-0">
                            {category}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {definition}
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
}
