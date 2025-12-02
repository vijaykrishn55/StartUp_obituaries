import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UnifiedFeed } from "@/components/dashboard/UnifiedFeed";
import { MyNetwork } from "@/components/dashboard/MyNetwork";
import { Messages } from "@/components/dashboard/Messages";
import { SuggestedConnections } from "@/components/dashboard/SuggestedConnections";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");

  const handleHomeClick = () => {
    setActiveTab("feed");
    setSearchQuery("");
  };

  const handleNetworkClick = () => {
    setActiveTab("network");
    setSearchQuery("");
  };

  const handleMessageClick = () => {
    setActiveTab("messages");
    setSearchQuery("");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onHomeClick={handleHomeClick}
        onNetworkClick={handleNetworkClick}
        onMessageClick={handleMessageClick}
        activeView={activeTab}
        onSearch={handleSearch}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {activeTab === "feed" && (
              <>
                <UnifiedFeed searchQuery={searchQuery} />
              </>
            )}
            {activeTab === "network" && <MyNetwork />}
            {activeTab === "messages" && <Messages />}
          </div>

          {/* Right Sidebar - Suggestions */}
          <div className="lg:col-span-4">
            <SuggestedConnections />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
