import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, MessageSquare } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const conversations = [
  {
    id: 1,
    name: "Jordan Peterson",
    student: "Ava (Grade 3)",
    lastMessage: "Thank you for the IEP review. When can we schedule the meeting?",
    time: "2 min ago",
    unread: 2,
    avatar: "JP"
  },
  {
    id: 2,
    name: "Morgan Kelly",
    student: "Liam (Grade 6)",
    lastMessage: "I've uploaded the latest evaluation reports.",
    time: "1 hour ago",
    unread: 0,
    avatar: "MK"
  },
  {
    id: 3,
    name: "Pat Rodriguez",
    student: "Noah (Grade 2)",
    lastMessage: "The accommodation letter looks perfect!",
    time: "3 hours ago",
    unread: 1,
    avatar: "PR"
  }
];

export default function AdvocateMessages() {
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [dynamicConversations, setDynamicConversations] = useState([]);
  
  // Check if we're coming from a match proposal
  useEffect(() => {
    if (location.state?.newMessage) {
      const { parentId, studentName, proposalId } = location.state.newMessage;
      
      // Create a new conversation for this parent
      const newConversation = {
        id: `new-${proposalId}`,
        name: `${studentName}'s Family`,
        student: studentName,
        lastMessage: "New conversation started",
        time: "now",
        unread: 0,
        avatar: studentName?.split(' ').map(n => n[0]).join('') || 'NF',
        isNew: true
      };
      
      setDynamicConversations([newConversation]);
      setSelectedConversation(newConversation);
      
      // Pre-populate the message input with a starter message
      setNewMessageText(`Hello! Thank you for considering me as an advocate for ${studentName}. I'd love to learn more about ${studentName}'s specific needs and how I can best support your family. Would you be available for a brief introductory call this week to discuss your goals and next steps?`);
    }
  }, [location.state]);

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
              {/* Show dynamic conversations first (new ones from match proposals) */}
              {dynamicConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/placeholder-new.jpg`} />
                      <AvatarFallback>{conversation.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversation.name}</p>
                        <span className="text-xs text-muted-foreground">{conversation.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{conversation.student}</p>
                      <p className="text-sm truncate">{conversation.lastMessage}</p>
                      {conversation.isNew && (
                        <Badge variant="default" className="mt-2 text-xs">
                          New Match Request
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Show existing conversations */}
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
                      <p className="text-sm text-muted-foreground mb-1">{conversation.student}</p>
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
                    {selectedConversation?.avatar || 'JP'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedConversation?.name || 'Jordan Peterson'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation?.student || 'Ava (Grade 3)'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Show empty state for new conversations */}
              {selectedConversation?.isNew ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-lg font-medium mb-2">New Conversation</p>
                    <p className="text-sm">Send your first message to start the conversation with {selectedConversation.name}</p>
                  </div>
                </div>
              ) : (
                /* Show existing conversation messages */
                <>
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg max-w-xs">
                      <p className="text-sm">Hello! I received your IEP review. Thank you so much for the detailed analysis.</p>
                      <span className="text-xs text-muted-foreground">10:30 AM</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-primary p-3 rounded-lg max-w-xs text-primary-foreground">
                      <p className="text-sm">You're welcome! I've identified several areas where we can strengthen Ava's supports. Would you like to schedule a call to discuss?</p>
                      <span className="text-xs opacity-80">10:32 AM</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg max-w-xs">
                      <p className="text-sm">Yes, that would be great. When are you available this week?</p>
                      <span className="text-xs text-muted-foreground">10:35 AM</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input 
                  placeholder="Type your message..." 
                  className="flex-1" 
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                />
                <Button size="icon">
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