import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "../features/Dashboard";
import IdentifyFlower from "../features/IdentifyFlower";
import TrackWater from "../features/TrackWater";
import { Leaf } from "lucide-react";
import FlowerUpload from "@/components/FlowerUpload";  // ← ADDED THIS IMPORT

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#2E6F40" }}>
      {/* Header */}
      <header className="border-b pmborder-green-700 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-700 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-green-700">
              LeafKeeper
            </h1>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            Track your plants and water intake with ease
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-md rounded-lg p-1 border border-green-200">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="identify">Identify Flower</TabsTrigger>
            <TabsTrigger value="track">Track Water</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-8">
            <Dashboard />
          </TabsContent>

          <TabsContent value="identify" className="mt-8">
            <FlowerUpload />  {/* ← ADDED THIS COMPONENT */}
            <IdentifyFlower />
          </TabsContent>

          <TabsContent value="track" className="mt-8">
            <TrackWater />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-green-700 bg-white/80 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 text-sm">
            LeafKeeper - Keep your plants happy and hydrated
          </p>
        </div>
      </footer>
    </div>
  );
}