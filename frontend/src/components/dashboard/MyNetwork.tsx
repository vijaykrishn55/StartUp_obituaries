import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  UserPlus, 
  UserMinus, 
  MessageCircle, 
  UserCheck, 
  MapPin,
  Users,
  CheckCircle2,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Connection } from "@/lib/data";

export const MyNetwork = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("discover");
  const [connections, setConnections] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const [connectionsData, receivedData, suggestionsData] = await Promise.all([
        api.getConnections().catch(() => ({ data: [] })),
        api.getReceivedConnectionRequests().catch(() => ({ data: [] })),
        api.getConnectionSuggestions(20).catch(() => ({ data: [] }))
      ]);

      setConnections(connectionsData.data || connectionsData.connections || connectionsData || []);
      setReceivedRequests(receivedData.data || receivedData.requests || receivedData || []);
      setSentRequests([]); // Sent requests not implemented in backend yet
      setSuggestions(suggestionsData.data || suggestionsData.suggestions || suggestionsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load network data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId: string, name: string) => {
    try {
      await api.sendConnectionRequest(userId);
      toast({
        title: "Connection request sent",
        description: `Your request to connect with ${name} has been sent.`,
      });
      fetchNetworkData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  const handleAccept = async (requestId: string, name: string) => {
    try {
      await api.acceptConnectionRequest(requestId);
      toast({
        title: "Connection accepted",
        description: `You are now connected with ${name}.`,
      });
      fetchNetworkData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept connection",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string, name: string) => {
    try {
      await api.rejectConnectionRequest(requestId);
      toast({
        title: "Request rejected",
        description: `Connection request from ${name} has been rejected.`,
      });
      fetchNetworkData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject connection",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (connectionId: string, name: string) => {
    try {
      await api.removeConnection(connectionId);
      toast({
        title: "Connection removed",
        description: `${name} has been removed from your network.`,
        variant: "destructive",
      });
      fetchNetworkData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove connection",
        variant: "destructive",
      });
    }
  };

  const filterPeople = (people: any[]) => {
    if (!searchQuery) return people;
    return people.filter((person) => {
      const user = person.user || person.sender || person;
      return (
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const filteredConnections = filterPeople(connections);
  const filteredSuggestions = filterPeople(suggestions);
  const filteredReceivedRequests = filterPeople(receivedRequests);

  if (loading) {
    return <div className="text-center py-8">Loading network data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <Card>
        <CardHeader>
          <CardTitle>My Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{connections.length}</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{receivedRequests.length}</p>
              <p className="text-xs text-muted-foreground">Requests</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{filteredSuggestions.length}</p>
              <p className="text-xs text-muted-foreground">Suggestions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">
            Discover ({filteredSuggestions.length})
          </TabsTrigger>
          <TabsTrigger value="connections">
            Connections ({filteredConnections.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({filteredReceivedRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-4 mt-6">
          {filteredSuggestions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No suggestions available
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSuggestions.map((person) => {
              const user = person.user || person;
              return (
                <Card key={user._id} className="hover:border-primary transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {user.name}
                          {user.verified && (
                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground">{user.headline || user.role}</p>
                        {user.location && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {user.location}
                          </p>
                        )}
                        {person.mutualConnections && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {person.mutualConnections} mutual connections
                          </p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm"
                            onClick={() => handleConnect(user._id, user.name)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                          <Button size="sm" variant="outline">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-4 mt-6">
          {filteredConnections.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No connections found
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredConnections.map((connection) => {
              const user = connection.user || connection.connectedUser || connection;
              return (
                <Card key={connection._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              {user.name}
                              {user.verified && (
                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {user.headline || user.role}
                            </p>
                            {user.location && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                {user.location}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button size="sm" variant="ghost">
                            View Profile
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleRemove(connection._id, user.name)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4 mt-6">
          {filteredReceivedRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No pending requests
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReceivedRequests.map((request) => {
              const user = request.sender || request.user || request;
              return (
                <Card key={request._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {user.headline || user.role}
                        </p>
                        {user.location && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {user.location}
                          </p>
                        )}
                        {request.message && (
                          <p className="text-sm mt-2 p-3 bg-muted rounded-md italic border-l-4 border-primary">
                            "{request.message}"
                          </p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm"
                            onClick={() => handleAccept(request._id, user.name)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReject(request._id, user.name)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
