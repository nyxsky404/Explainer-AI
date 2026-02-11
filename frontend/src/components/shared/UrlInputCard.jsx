import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Settings } from 'lucide-react';

export default function UrlInputCard({
    pageTitle,
    pageDescription,
    title,
    description,
    label,
    placeholder,
    icon: Icon,
    buttonText,
    loadingText,
    value,
    onChange,
    onSubmit,
    isLoading,
    children,
}) {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Page Heading - Left aligned within the centered container */}
            <div>
                <h1 className="text-3xl font-bold">{pageTitle}</h1>
                <p className="text-muted-foreground">{pageDescription}</p>
            </div>

            {/* Card - Same width as heading */}
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="url">{label}</Label>
                            <div className="relative">
                                {Icon && (
                                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                )}
                                <Input
                                    id="url"
                                    type="url"
                                    placeholder={placeholder}
                                    value={value}
                                    onChange={onChange}
                                    className={Icon ? 'pl-10' : ''}
                                    required
                                />
                            </div>
                        </div>

                        {children && (
                            <Collapsible>
                                <CollapsibleTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2 text-muted-foreground hover:text-foreground px-0"
                                    >
                                        <Settings className="size-4" />
                                        Options
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-3">
                                    {children}
                                </CollapsibleContent>
                            </Collapsible>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? loadingText : buttonText}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
