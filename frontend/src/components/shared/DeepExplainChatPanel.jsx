import { useState, useRef, useEffect } from 'react';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MessageCircle, Send, Loader2, ChevronDown, Coins, Sparkles } from 'lucide-react';
import { getFriendlyErrorMessage } from '@/utils/errorMessages';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';

export default function DeepExplainChatPanel({ explanationId, initialFollowUps = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Convert follow-ups to flat chat messages on mount / when initialFollowUps changes
    useEffect(() => {
        const converted = initialFollowUps.flatMap((fup, i) => [
            { id: `fup-q-${i}`, role: 'user', content: fup.question },
            { id: `fup-a-${i}`, role: 'assistant', content: fup.answer },
        ]);
        setMessages(converted);
    }, [initialFollowUps]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e?.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        const tempId = `temp-${Date.now()}`;
        setMessages(prev => [...prev, { id: tempId, role: 'user', content: text }]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post(`/deep-explain/${explanationId}/follow-up`, { question: text });
            if (res.data.success) {
                const { followUp } = res.data.data;
                setMessages(prev => [
                    ...prev.filter(m => m.id !== tempId),
                    { id: `new-q-${Date.now()}`, role: 'user', content: followUp.question },
                    { id: `new-a-${Date.now()}`, role: 'assistant', content: followUp.answer },
                ]);
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setMessages(prev => [
                ...prev,
                { id: `err-${Date.now()}`, role: 'error', content: getFriendlyErrorMessage(err) },
            ]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const messageCount = messages.filter(m => m.role === 'user').length;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card className="border-dashed">
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="size-5 text-primary" />
                                <CardTitle className="text-base">Chat with this content</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                {messageCount > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                        {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="gap-1 text-xs">
                                    <Coins className="size-3" />
                                    1 credit/msg
                                </Badge>
                                <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <CardContent className="pt-0">
                        <div className="space-y-3 max-h-96 overflow-y-auto mb-4 pr-1">
                            {messages.length === 0 && !loading && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Sparkles className="size-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Ask questions about this explanation</p>
                                    <p className="text-xs mt-1">Drill deeper or clarify any part of the content</p>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                            msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                                : msg.role === 'error'
                                                ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-bl-md'
                                                : 'bg-muted rounded-bl-md'
                                        }`}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                                <MarkdownRenderer content={msg.content} />
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="size-4 animate-spin" />
                                            <span>Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={sendMessage} className="flex items-center gap-2">
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question about this explanation..."
                                disabled={loading}
                                className="flex-1"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                aria-label="Send message"
                                disabled={!input.trim() || loading}
                                className="shrink-0"
                            >
                                <Send className="size-4" />
                            </Button>
                        </form>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
