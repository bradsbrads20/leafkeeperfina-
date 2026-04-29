import { useEffect, useState } from "react";
import axios from "axios";
import { Plant, WaterRecord } from "@shared/api";
import { Trash2, Plus, AlertCircle, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TrackWater() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [waterRecords, setWaterRecords] = useState<WaterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [selectedPlantId, setSelectedPlantId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlantId || !amount) {
      setError("Please select a plant and enter an amount");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const today = new Date().toISOString().split("T")[0];

      const response = await axios.post("/api/water-records", {
        plantId: selectedPlantId,
        date: today,
        amount: parseInt(amount),
        notes: notes.trim(),
      });

      // Update records list
      setWaterRecords([...waterRecords, response.data.record]);

      // Update plant's last watered date
      setPlants(
        plants.map((p) =>
          p.id === selectedPlantId
            ? { ...p, lastWatered: new Date().toISOString() }
            : p
        )
      );

      // Reset form
      setSelectedPlantId("");
      setAmount("");
      setNotes("");
      setSuccess(`Added ${amount}ml of water!`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to log water. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Delete this water log?")) return;

    try {
      await axios.delete(`/api/water-records/${recordId}`);
      setWaterRecords(waterRecords.filter((r) => r.id !== recordId));
      setSuccess("Water log deleted");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete record");
      console.error(err);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const todayRecords = waterRecords.filter((r) => r.date === today);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water Logging Form */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">Log Water</CardTitle>
              <CardDescription>Record watering activity</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Plant Selection */}
                <div className="space-y-2">
                  <Label htmlFor="plant" className="font-semibold">
                    Select Plant
                  </Label>
                  {plants.length === 0 ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      No plants yet. Identify a flower first!
                    </div>
                  ) : (
                    <Select value={selectedPlantId} onValueChange={setSelectedPlantId}>
                      <SelectTrigger className="border-purple-200">
                        <SelectValue placeholder="Choose a plant..." />
                      </SelectTrigger>
                      <SelectContent>
                        {plants.map((plant) => (
                          <SelectItem key={plant.id} value={plant.id}>
                            {plant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="font-semibold">
                    Amount (ml)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="e.g., 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    min="1"
                    max="10000"
                  />
                </div>

                {/* Notes Input */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-semibold">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g., Morning watering, soil was dry"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-20 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting || plants.length === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Logging...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Log Water
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Today's Summary and History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Progress */}
          <Card className="bg-white border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-blue-500" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-900">{todayTotal}ml</span>
                  <span className="text-sm text-gray-600">{dailyGoal}ml goal</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((todayTotal / dailyGoal) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {todayTotal >= dailyGoal
                  ? "Goal reached! Great job staying hydrated. 🎉"
                  : `${dailyGoal - todayTotal}ml to reach daily goal`}
              </p>
            </CardContent>
          </Card>

          {/* Today's Water Logs */}
          <Card className="bg-white border-purple-200">
            <CardHeader>
              <CardTitle>Today's Water Logs</CardTitle>
              <CardDescription>
                {todayRecords.length} log{todayRecords.length !== 1 ? "s" : ""} today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Droplet className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No water logs yet today</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayRecords.map((record) => {
                    const plant = plants.find((p) => p.id === record.plantId);
                    return (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {plant?.name || "Unknown Plant"}
                          </p>
                          {record.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              {record.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
                            {record.amount}ml
                          </span>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly History */}
      <Card className="bg-white border-purple-200">
        <CardHeader>
          <CardTitle>Water Log History</CardTitle>
          <CardDescription>All water tracking records</CardDescription>
        </CardHeader>
        <CardContent>
          {waterRecords.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No water logs yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {waterRecords
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((record) => {
                  const plant = plants.find((p) => p.id === record.plantId);
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {plant?.name || "Unknown Plant"}
                        </p>
                        <p className="text-xs text-gray-500">{record.date}</p>
                        {record.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            {record.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-blue-600">
                          {record.amount}ml
                        </span>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
