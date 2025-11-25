import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export const Messages = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data: any = await api.getConversations();
      const convs = data.data || data.conversations || data || [];
      setConversations(convs);
      if (convs.length > 0) {
        setSelectedConversation(convs[0]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const data: any = await api.getMessages(conversationId);
      setMessages(data.data || data.messages || data || []);
      await api.markConversationAsRead(conversationId).catch(() => {}); // Ignore errors for marking as read
    } catch (error: any) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const sentMessage = await api.sendMessage(selectedConversation._id, newMessage);
      setMessages([...messages, sentMessage]);
      setNewMessage("");
      fetchConversations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString();
  };

  const getOtherParticipant = (conversation: any) => {
    if (!conversation.participants) return null;
    return conversation.participants.find((p: any) => p._id !== user?.id);
  };

  const filteredConversations = conversations.filter((conv) => {
    const other = getOtherParticipant(conv);
    if (!other) return false;
    return other.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

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
        <ScrollArea className="h-[500px]">
          <CardContent className="space-y-2">
            {filteredConversations.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                {searchQuery ? "No conversations found" : "No messages yet"}
              </p>
            ) : (
              filteredConversations.map((conversation) => {
                const other = getOtherParticipant(conversation);
                if (!other) return null;

                const isSelected = selectedConversation?._id === conversation._id;
                const hasUnread = conversation.unreadCount > 0;

                return (
                  <div
                    key={conversation._id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={other.avatar} />
                      <AvatarFallback>{other.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="font-semibold text-sm truncate">{other.name}</p>
                        {hasUnread && (
                          <Badge variant="destructive" className="ml-2 h-5 px-2">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage?.content || "No messages yet"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conversation.lastMessage?.createdAt
                          ? formatTime(conversation.lastMessage.createdAt)
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={getOtherParticipant(selectedConversation)?.avatar}
                    />
                    <AvatarFallback>
                      {getOtherParticipant(selectedConversation)?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {getOtherParticipant(selectedConversation)?.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {getOtherParticipant(selectedConversation)?.headline}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((message) => {
                    const isMe = message.sender?._id === user?.id || message.sender === user?.id;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isMe
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <CardContent className="border-t pt-4">
              <div className="flex gap-2">
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
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Select a conversation to start messaging
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
