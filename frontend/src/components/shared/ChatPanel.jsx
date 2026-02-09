import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MessageCircle, Send, Loader2, ChevronDown, Coins, Sparkles } from 'lucide-react';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';

const ChatPanel = forwardRef(function ChatPanel({ summaryId }, ref) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Load chat history when panel is first opened
    useEffect(() => {
        if (isOpen && !historyLoaded) {
            loadHistory();
        }
    }, [isOpen]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadHistory = async () => {
        try {
            const res = await api.get(`/chat/${summaryId}/history`);
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load chat history:', err);
        } finally {
            setHistoryLoaded(true);
        }
    };

    const sendMessage = async (e) => {
        e?.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        // Optimistic UI — add user message immediately
        const tempUserMsg = { id: `temp-${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, tempUserMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post(`/chat/${summaryId}`, { message: text });
            if (res.data.success) {
                // Replace temp message with real one and add assistant response
                setMessages(prev => [
                    ...prev.filter(m => m.id !== tempUserMsg.id),
                    res.data.data.userMessage,
                    res.data.data.assistantMessage,
                ]);
            }
        } catch (err) {
            console.error('Chat error:', err);
            // Remove temp message on error
            setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
            const errorMsg = err.response?.data?.message || 'Failed to send message';
            setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'error', content: errorMsg }]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    /**
     * External method to add an explain request as a chat message.
     * Called by the parent when a user highlights text and clicks "Explain".
     */
    const addExplainMessage = (selectedText, explanation) => {
        setIsOpen(true);
        setMessages(prev => [
            ...prev,
            { id: `explain-q-${Date.now()}`, role: 'user', content: `Explain: "${selectedText}"`, createdAt: new Date().toISOString() },
            { id: `explain-a-${Date.now()}`, role: 'assistant', content: explanation, createdAt: new Date().toISOString() },
        ]);
    };

    // Expose addExplainMessage to parent via ref
    useImperativeHandle(ref, () => ({ addExplainMessage }), []);

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
                        {/* Messages */}
                        <div className="space-y-3 max-h-96 overflow-y-auto mb-4 pr-1">
                            {messages.length === 0 && !loading && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Sparkles className="size-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Ask questions about this content</p>
                                    <p className="text-xs mt-1">The AI will use the original source material to answer</p>
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

                        {/* Input */}
                        <form onSubmit={sendMessage} className="flex items-center gap-2">
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question about this content..."
                                disabled={loading}
                                className="flex-1"
                            />
                            <Button
                                type="submit"
                                size="icon"
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
});

export default ChatPanel;
