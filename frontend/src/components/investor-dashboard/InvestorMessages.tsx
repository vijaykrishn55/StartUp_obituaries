import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MoreVertical, Paperclip } from "lucide-react";

const conversations = [
  {
    id: 1,
    name: "TechStart Inc",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=TechStart",
    lastMessage: "Thanks for the investment! Looking forward to Q4.",
    time: "5m ago",
    unread: 0,
    online: true,
    type: "Portfolio"
  },
  {
    id: 2,
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    lastMessage: "Could we schedule a call to discuss the terms?",
    time: "1h ago",
    unread: 2,
    online: true,
    type: "Pitch"
  },
  {
    id: 3,
    name: "AI Analytics Pro",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=AIAnalytics",
    lastMessage: "Sent over the updated pitch deck",
    time: "3h ago",
    unread: 1,
    online: false,
    type: "Deal Flow"
  },
  {
    id: 4,
    name: "Michael Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    lastMessage: "Great meeting today. Excited about next steps!",
    time: "1d ago",
    unread: 0,
    online: false,
    type: "Portfolio"
  }
];

const messages = [
  {
    id: 1,
    sender: "TechStart Inc",
    content: "Hi! We wanted to share our Q3 results with you.",
    time: "2:30 PM",
    isMe: false
  },
  {
    id: 2,
    sender: "You",
    content: "Great! I'd love to see the numbers. How's the growth trending?",
    time: "2:32 PM",
    isMe: true
  },
  {
    id: 3,
    sender: "TechStart Inc",
    content: "We hit $2.5M ARR, up 25% from last quarter. Customer retention is at 95%.",
    time: "2:35 PM",
    isMe: false
  },
  {
    id: 4,
    sender: "You",
    content: "Thanks for the investment! Looking forward to Q4.",
    time: "2:40 PM",
    isMe: true
  }
];

export const InvestorMessages = () => {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSend = () => {
    if (newMessage.trim()) {
      setNewMessage("");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Messages</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px]">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-muted transition-colors ${
                  selectedChat.id === conv.id ? "bg-muted" : ""
                }`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={conv.avatar} />
                    <AvatarFallback>{conv.name[0]}</AvatarFallback>
                  </Avatar>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm truncate">{conv.name}</h4>
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                  </div>
                  <Badge variant="outline" className="text-xs mb-1">{conv.type}</Badge>
                  <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <Badge variant="default" className="ml-2">
                    {conv.unread}
                  </Badge>
                )}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card className="md:col-span-2">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={selectedChat.avatar} />
                  <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                </Avatar>
                {selectedChat.online && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{selectedChat.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{selectedChat.type}</Badge>
                  <p className="text-xs text-muted-foreground">
                    {selectedChat.online ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <Button onClick={handleSend} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
