import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Messages as MessagesComponent } from "@/components/dashboard/Messages";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Check for 'user' or 'userId' param first (to start conversation with a user)
    const userIdParam = searchParams.get("user") || searchParams.get("userId");
    const conversationParam = searchParams.get("conversation");
    
    if (!userIdParam && !conversationParam) {
      setLoading(false);
      return;
    }

    // If we have a user ID, create/get conversation with that user
    if (userIdParam) {
      setLoading(true);
      api.createConversation(userIdParam)
        .then((res: any) => {
          const convId = res.data?._id || res._id || res.id;
          if (convId) {
            setConversationId(convId);
            // Update URL with actual conversation ID
            setSearchParams({ conversation: convId }, { replace: true });
          }
        })
        .catch((err: any) => {
          console.error("Failed to create conversation:", err);
          toast({
            title: "Error",
            description: err.message || "Failed to start conversation",
            variant: "destructive"
          });
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    // Otherwise, use the conversation ID directly
    if (conversationParam) {
      setConversationId(conversationParam);
      setLoading(false);
    }
  }, [user, searchParams, toast, setSearchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-20 pb-8">
          <div className="text-center py-8">Loading conversation...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-20 pb-8">
        <MessagesComponent initialConversationId={conversationId} />
      </main>
    </div>
  );
};

export default Messages;
