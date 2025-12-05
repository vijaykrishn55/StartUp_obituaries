import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Send, 
  MoreVertical, 
  Edit, 
  Trash2, 
  X, 
  Check,
  AlertCircle 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";

interface MessagesProps {
  initialConversationId?: string | null;
}

export const Messages = ({ initialConversationId }: MessagesProps = {}) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [deleteChatDialogOpen, setDeleteChatDialogOpen] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    fetchConversations(true); // Pass true to select initial conversation

    // Setup socket listener for new messages
    const socket = getSocket();
    socket.on('new_message', handleIncomingMessage);

    return () => {
      socket.off('new_message', handleIncomingMessage);
    };
  }, [user]);

  // Watch for changes to initialConversationId
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const conv = conversations.find((c: any) => c._id === initialConversationId || c.id === initialConversationId);
      if (conv && (!selectedConversation || selectedConversation._id !== conv._id)) {
        setSelectedConversation(conv);
      }
    }
  }, [initialConversationId, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleIncomingMessage = (data: any) => {
    const { conversationId, message } = data;
    
    // If this message is for the currently selected conversation, add it
    if (selectedConversation && selectedConversation._id === conversationId) {
      setMessages(prev => [...prev, message]);
    }
    
    // Silently refresh conversations list (no loading state) to update last message
    fetchConversations(false, false);
  };

  const fetchConversations = async (selectInitial = false, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data: any = await api.getConversations();
      const convs = data.data || data.conversations || data || [];
      setConversations(convs);
      
      // Select initial conversation if provided and selectInitial is true
      if (selectInitial && initialConversationId && convs.length > 0) {
        const conv = convs.find((c: any) => c._id === initialConversationId || c.id === initialConversationId);
        if (conv) {
          setSelectedConversation(conv);
        } else if (!selectedConversation && convs.length > 0) {
          setSelectedConversation(convs[0]);
        }
      } else if (selectInitial && !selectedConversation && convs.length > 0) {
        setSelectedConversation(convs[0]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response: any = await api.getMessages(conversationId);
      const msgs = response.data || response.messages || response || [];
      setMessages(msgs);
      
      // Mark as read after loading
      await api.markConversationAsRead(conversationId).catch(() => {});
    } catch (error: any) {
      console.error("Failed to load messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Create optimistic message
    const optimisticMessage = {
      _id: tempId,
      content: messageText,
      sender: { _id: (user as any)?._id || (user as any)?.id, name: user?.name, avatar: user?.avatar },
      createdAt: new Date().toISOString(),
      pending: true
    };
    
    // Add message immediately (optimistic update)
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage(""); // Clear input immediately
    setSending(true);

    try {
      const response: any = await api.sendMessage(selectedConversation._id, messageText);
      const sentMessage = response.data || response;
      
      // Replace temp message with real one
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...sentMessage, pending: false } : msg
      ));
      
      // Update conversation list in background (silent, no loading state)
      fetchConversations(false, false);
    } catch (error: any) {
      // Remove failed message and restore input
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setNewMessage(messageText);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
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

  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim() || !selectedConversation) return;
    
    try {
      // Note: If backend doesn't support edit, we simulate locally
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, content: editContent, edited: true } : msg
      ));
      setEditingMessageId(null);
      setEditContent("");
      toast({
        title: "Message updated",
        description: "Your message has been edited.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to edit message",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete || !selectedConversation) return;
    
    try {
      await api.deleteMessage(selectedConversation._id, messageToDelete);
      setMessages(prev => prev.filter(msg => msg._id !== messageToDelete));
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
      toast({
        title: "Message deleted",
        description: "Your message has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedConversation) return;
    
    try {
      // Remove conversation from list
      setConversations(prev => prev.filter(c => c._id !== selectedConversation._id));
      setSelectedConversation(null);
      setMessages([]);
      setDeleteChatDialogOpen(false);
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const startEditing = (message: any) => {
    setEditingMessageId(message._id);
    setEditContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const getOtherParticipant = (conversation: any) => {
    // Backend formats conversations with 'participant' field (singular)
    if (conversation.participant) {
      return conversation.participant;
    }
    // Fallback to participants array
    if (conversation.participants && Array.isArray(conversation.participants)) {
      return conversation.participants.find((p: any) => p._id !== user?.id);
    }
    return null;
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
      <Card className="md:col-span-2 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b flex-shrink-0">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setDeleteChatDialogOpen(true)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '400px' }}>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((message) => {
                    const isMe = message.sender?._id === user?.id || message.sender === user?.id;
                    const isEditing = editingMessageId === message._id;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                      >
                        <div className={`flex items-start gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                          {/* Message Actions (only for own messages) */}
                          {isMe && !isEditing && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0"
                                onClick={() => startEditing(message)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-destructive"
                                onClick={() => {
                                  setMessageToDelete(message._id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          
                          <div
                            className={`rounded-lg p-3 ${
                              isMe
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="bg-background text-foreground"
                                  autoFocus
                                />
                                <div className="flex gap-1 justify-end">
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    className="h-6 px-2"
                                    onClick={cancelEditing}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={() => handleEditMessage(message._id)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
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
                                  {message.edited && " (edited)"}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <CardContent className="border-t pt-4 flex-shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={sending}
                  autoComplete="off"
                />
                <Button type="submit" onClick={handleSend} disabled={!newMessage.trim() || sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
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

      {/* Delete Message Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This message will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMessageToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Conversation Dialog */}
      <AlertDialog open={deleteChatDialogOpen} onOpenChange={setDeleteChatDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this entire conversation and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChat} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
