import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Plant, WaterRecord } from "@shared/api";
import { formatDistanceToNow } from "date-fns";
import { Droplet, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Dashboard() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [waterRecords, setWaterRecords] = useState<WaterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plantsRes, recordsRes] = await Promise.all([
          axios.get("/api/plants"),
          axios.get("/api/water-records"),
        ]);

        if (
          !Array.isArray(plantsRes.data?.plants) ||
          !Array.isArray(recordsRes.data?.records)
        ) {
          throw new Error("Unexpected API response shape");
        }

        setPlants(plantsRes.data.plants);
        setWaterRecords(recordsRes.data.records);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate plants needing water
  const today = new Date();
  const plantsNeedingWater = plants.filter((plant) => {
    const lastWatered = new Date(plant.lastWatered);
    const daysSinceWatered = Math.floor(
      (today.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceWatered >= plant.waterFrequency;
  });

  // Get last 7 days of water records
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const chartData = last7Days.map((date) => {
    const dayRecords = waterRecords.filter((r) => r.date === date);
    const total = dayRecords.reduce((sum, r) => sum + r.amount, 0);
    return {
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      amount: total,
    };
  });

  // Calculate weekly total
  const weeklyTotal = chartData.reduce((sum, d) => sum + d.amount, 0);

  // Get today's records
  const todayDate = today.toISOString().split("T")[0];
  const todayRecords = waterRecords.filter((r) => r.date === todayDate);
  const todayTotal = todayRecords.reduce((sum, r) => sum + r.amount, 0);
  const dailyGoal = 2000;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Watering */}
        <Card className="bg-white border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blue-500" />
              Today's Water Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{todayTotal}</div>
            <p className="text-xs text-gray-500 mt-2">
              of {dailyGoal}ml daily goal
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((todayTotal / dailyGoal) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Total */}
        <Card className="bg-white border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Weekly Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{weeklyTotal}</div>
            <p className="text-xs text-gray-500 mt-2">ml in last 7 days</p>
          </CardContent>
        </Card>

        {/* Plants Needing Water */}
        <Card className="bg-white border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Action Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {plantsNeedingWater.length}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              plant{plantsNeedingWater.length !== 1 ? "s" : ""} need watering
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plants Needing Water Alert */}
      {plantsNeedingWater.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {plantsNeedingWater.length} plant{plantsNeedingWater.length !== 1 ? "s" : ""} need{plantsNeedingWater.length === 1 ? "s" : ""} watering:{" "}
            {plantsNeedingWater.map((p) => p.name).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Water Intake Chart */}
        <Card className="bg-white border-purple-200">
          <CardHeader>
            <CardTitle>Water Intake (Last 7 Days)</CardTitle>
            <CardDescription>Daily water amount in ml</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="amount" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plant Summary */}
        <Card className="bg-white border-purple-200">
          <CardHeader>
            <CardTitle>Your Plants</CardTitle>
            <CardDescription>{plants.length} plant{plants.length !== 1 ? "s" : ""} in collection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plants.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No plants yet. Start by identifying a flower!
                </p>
              ) : (
                plants.slice(0, 5).map((plant) => {
                  const lastWatered = new Date(plant.lastWatered);
                  return (
                    <div
                      key={plant.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{plant.name}</p>
                        <p className="text-xs text-gray-500">
                          Watered {formatDistanceToNow(lastWatered, { addSuffix: true })}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        Every {plant.waterFrequency} days
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Water Records */}
      <Card className="bg-white border-purple-200">
        <CardHeader>
          <CardTitle>Recent Water Logs</CardTitle>
          <CardDescription>Last 5 watering records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {waterRecords.slice(-5).reverse().map((record) => {
              const plant = plants.find((p) => p.id === record.plantId);
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {plant?.name || "Unknown Plant"}
                    </p>
                    <p className="text-xs text-gray-500">{record.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{record.amount}ml</p>
                    {record.notes && (
                      <p className="text-xs text-gray-500">{record.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
