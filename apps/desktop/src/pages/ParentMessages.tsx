import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, MessageSquare, Send, Paperclip, Archive, Star } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Original Desktop ParentMessages - No mobile components
export default function ParentMessages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("conv-1");
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageSearchTerm, setMessageSearchTerm] = useState('');

  // Mock data for desktop display
  const conversations = [
    {
      id: "conv-1",
      advocate: { name: "Sarah Johnson", avatar_url: null },
      subject: "IEP Meeting Preparation",
      last_message: { content: "I've reviewed the documents you sent.", timestamp: "2 hours ago" },
      unread_count: 2,
      priority: "normal" as const,
      archived: false
    },
    {
      id: "conv-2",
      advocate: { name: "Dr. Michael Chen", avatar_url: null },
      subject: "Assessment Results Discussion",
      last_message: { content: "The results show significant improvement in reading comprehension.", timestamp: "1 day ago" },
      unread_count: 0,
      priority: "urgent" as const,
      archived: false
    },
    {
      id: "conv-3",
      advocate: { name: "Lisa Rodriguez", avatar_url: null },
      subject: "Accommodation Updates",
      last_message: { content: "Thank you for the quick response!", timestamp: "3 days ago" },
      unread_count: 1,
      priority: "normal" as const,
      archived: false
    }
  ];

  const messages = [
    {
      id: "msg-1",
      sender: { id: "sarah", name: "Sarah Johnson" },
      content: "Hi! I've reviewed the IEP documents you submitted for your child. Overall, the goals look appropriate for their current level.",
      timestamp: "10:30 AM",
      attachments: []
    },
    {
      id: "msg-2",
      sender: { id: "parent", name: "You" },
      content: "Thank you for the review. I have some concerns about the math goals - they seem too basic for what my child is capable of.",
      timestamp: "10:35 AM",
      attachments: []
    },
    {
      id: "msg-3",
      sender: { id: "sarah", name: "Sarah Johnson" },
      content: "That's a great point. Based on the assessment data, your child is performing at grade level in math. We should definitely advocate for more challenging goals. I've prepared some alternative goal suggestions.",
      timestamp: "10:45 AM",
      attachments: [{ name: "Alternative_Math_Goals.pdf", size: "245 KB" }]
    },
    {
      id: "msg-4",
      sender: { id: "parent", name: "You" },
      content: "This looks much better! I especially like the problem-solving focus in goal #3. When can we schedule a meeting to discuss these changes?",
      timestamp: "11:15 AM",
      attachments: []
    }
  ];

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter(conv => 
      conv.advocate?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSendMessage = useCallback(() => {
    if (!messageText.trim()) return;
    
    // In real implementation, this would send the message to the API
    console.log("Sending message:", messageText);
    setMessageText('');
  }, [messageText]);

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Conversations Sidebar - Desktop optimized */}
        <div className="col-span-4">
          <Card className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Messages</h2>
                <Badge variant="secondary" className="text-xs">
                  Desktop
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Conversations List */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors border",
                      selectedConversation === conversation.id
                        ? "bg-primary/10 border-primary/20" 
                        : "hover:bg-muted/50 border-transparent"
                    )}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={conversation.advocate.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {conversation.advocate.name?.split(' ').map(n => n[0]).join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {conversation.advocate.name}
                          </h4>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            {conversation.priority === 'urgent' && (
                              <Star className="h-3 w-3 text-yellow-500" />
                            )}
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-[20px] text-xs px-1.5">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mb-1 truncate">
                          {conversation.subject}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.last_message?.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {conversation.last_message?.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Chat Area - Desktop optimized */}
        <div className="col-span-8">
          <Card className="h-full flex flex-col">
            {/* Chat Header */}
            {selectedConv && (
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConv.advocate.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedConv.advocate.name?.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedConv.advocate.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedConv.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input 
                        placeholder="Search messages..." 
                        className="pl-10 w-64" 
                        value={messageSearchTerm}
                        onChange={(e) => setMessageSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="ghost" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Area - Desktop traditional layout */}
            <ScrollArea className="flex-1 p-4">
              {selectedConv ? (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isFromUser = message.sender.id === 'parent';
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          isFromUser ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg p-3",
                            isFromUser 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          )}
                        >
                          {!isFromUser && (
                            <p className="text-xs font-medium mb-2 opacity-70">
                              {message.sender.name}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-white/20">
                              {message.attachments.map((attachment, idx) => (
                                <div key={idx} className="flex items-center space-x-2 text-xs">
                                  <Paperclip className="h-3 w-3" />
                                  <span>{attachment.name}</span>
                                  <span className="opacity-70">({attachment.size})</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-xs mt-2 opacity-70">
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                    <p>Select a conversation from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Message Composer - Desktop traditional */}
            {selectedConv && (
              <div className="p-4 border-t">
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder={`Reply to ${selectedConv.advocate.name}...`}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="min-h-[80px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4 mr-1" />
                        Attach
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {messageText.length}/2000 characters
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-muted-foreground">
                        Ctrl+Enter to send
                      </p>
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="px-6"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}