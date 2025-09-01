import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip } from "lucide-react";
import { useState } from "react";

// Mock conversations from advocates
const conversations = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    title: "Special Education Advocate",
    lastMessage: "Hello! Thank you for considering me as an advocate for Sofia Rodriguez. I'd love to learn more about Sofia Rodriguez's specific needs and how I can best support your family. Would you be available for a brief introductory call this week to discuss your goals and next steps?",
    time: "2 min ago",
    unread: 1,
    avatar: "SC",
    student: "Sofia Rodriguez"
  },
  {
    id: 2,
    name: "Michael Torres",
    title: "IEP Specialist",
    lastMessage: "I've reviewed your case and would be happy to help with the upcoming IEP meeting.",
    time: "1 hour ago", 
    unread: 0,
    avatar: "MT",
    student: "Alex Rodriguez"
  }
];

export default function ParentMessages() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessageText, setNewMessageText] = useState('');

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search conversations..." className="pl-10" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/placeholder-${conversation.id}.jpg`} />
                      <AvatarFallback>{conversation.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversation.name}</p>
                        <span className="text-xs text-muted-foreground">{conversation.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{conversation.title}</p>
                      <p className="text-sm truncate">{conversation.lastMessage}</p>
                      {conversation.unread > 0 && (
                        <Badge variant="default" className="mt-2 text-xs">
                          {conversation.unread} new
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder-1.jpg" />
                  <AvatarFallback>
                    {selectedConversation?.avatar || 'SC'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedConversation?.name || 'Dr. Sarah Chen'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation?.title || 'Special Education Advocate'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Show the advocate's message from Sofia Rodriguez case */}
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg max-w-lg">
                  <p className="text-sm">
                    {selectedConversation?.lastMessage || "Hello! Thank you for considering me as an advocate for Sofia Rodriguez. I'd love to learn more about Sofia Rodriguez's specific needs and how I can best support your family. Would you be available for a brief introductory call this week to discuss your goals and next steps?"}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {selectedConversation?.time || "2 min ago"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input 
                  placeholder="Type your reply..." 
                  className="flex-1" 
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                />
                <Button size="icon" onClick={() => {
                  if (newMessageText.trim()) {
                    // For now, just clear the message to simulate sending
                    setNewMessageText('');
                  }
                }}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}