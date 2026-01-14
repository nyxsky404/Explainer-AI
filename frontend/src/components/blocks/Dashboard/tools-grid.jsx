import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function ToolsGrid({ tools }) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Tools</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => (
                    <Link key={tool.id} to={tool.link}>
                        <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <div className="w-12 h-12 flex items-center justify-center mb-2">
                                    {tool.icon}
                                </div>
                                <CardTitle className="text-lg">{tool.title}</CardTitle>
                                <CardDescription>{tool.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="gap-2 w-full">
                                    {tool.buttonText} <ArrowRight className="size-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
