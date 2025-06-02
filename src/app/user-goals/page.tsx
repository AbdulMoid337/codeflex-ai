"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import CornerElements from "@/components/CornerElements";
import { Loader } from "@/components/ui/loader";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Save } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function GoalsPage() {
  const { user } = useUser();
  const userId = user?.id;

  const [type, setType] = useState("calories");
  const [target, setTarget] = useState("");
  const [period, setPeriod] = useState("daily");
  const [editGoalId, setEditGoalId] = useState<string | null>(null);

  const goalsProgress = useQuery(api.goals.getGoalProgress, {
    userId: userId || "",
  });
  const chartData = goalsProgress?.map((goal) => ({
    ...goal,
    percent: parseFloat(goal.percent.toFixed(1)),
  }));

  // const goals = useQuery(api.goals.getGoals, { userId: userId || "" });
  const upsertGoal = useMutation(api.goals.upsertGoal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !target) return;
      await upsertGoal({
        userId,
        type: type as any,
        target: parseInt(target),
        period: period as any,
        ...(editGoalId ? { _id: editGoalId } : {}),
      });
      setTarget("");
      setEditGoalId(null);
      toast.success(editGoalId ? "Goal updated!" : "Goal saved!");
   
  };

  const handleEdit = (goal: any) => {
    setType(goal.type);
    setPeriod(goal.period);
    setTarget(goal.target);
    setEditGoalId(goal._id);
  };

  return (
    <div className="w-full min-h-screen px-4 py-8 md:px-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* GOAL FORM */}
        <div className="relative backdrop-blur-sm border border-border p-6 rounded-lg">
          <CornerElements />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <h2 className="text-xl font-bold tracking-tight">
              <span className="text-primary">
                {editGoalId ? "Edit" : "Set"}
              </span>{" "}
              <span className="text-foreground">Nutritional Goal</span>
            </h2>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-primary via-secondary to-primary opacity-50 my-4"></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-1/2 p-2 rounded border bg-background/80 border-border"
              >
                <option value="calories">Calories</option>
                <option value="protein">Protein</option>
                <option value="carbs">Carbs</option>
                <option value="fat">Fat</option>
              </select>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-1/2 p-2 rounded border bg-background/80 border-border"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <input
              type="number"
              min="0"
              placeholder="Target Value"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full p-2 rounded border bg-background/80 border-border"
              required
            />

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              disabled={!target}
            >
              {editGoalId ? (
                <>
                  Update Goal <Save className="w-4 h-4" />
                </>
              ) : (
                <>
                  Save Goal <Save className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* GOAL DISPLAY SECTION */}
        {!goalsProgress && (
          <div className="mt-8 flex justify-center gap-2">
            <p className="text-muted-foreground animate-pulse">
              Calculating your goal progress...
            </p>
            <Loader />
          </div>
        )}

        {goalsProgress && goalsProgress.length > 0 ? (
          <>
            <div className="relative backdrop-blur-sm border border-border p-6 rounded-lg">
              <CornerElements />
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <h2 className="text-xl font-bold tracking-tight">
                  <span className="text-primary">Your</span>{" "}
                  <span className="text-foreground">Goal Progress</span>
                </h2>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-primary via-secondary to-primary opacity-50 my-4"></div>
              <div className="space-y-4">
                {goalsProgress.map((goal, idx) => (
                  <div
                    key={idx}
                    className="border border-border rounded-lg p-4 bg-background/80 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold capitalize">
                        {goal.type} ({goal.period})
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-muted-foreground">
                          {Math.round(goal.current)}/{goal.target}
                          {goal.type === "calories" ? "" : "g"}
                        </span>
                        <button
                          onClick={() => handleEdit(goal)}
                          className="text-muted-foreground hover:text-primary transition"
                          title="Edit goal"
                        >
                          {!target ? (
                            <Pencil className="w-4 h-4" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${goal.percent}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.min(goal.percent, 100).toFixed(1)}% of your{" "}
                      {goal.period} {goal.type} goal reached
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RECHART VISUALIZATION */}
            <div className="relative backdrop-blur-sm border border-border p-6 rounded-lg">
              <CornerElements />
              <h2 className="text-xl font-bold mb-4 text-foreground">
                <span className="text-primary">Visual</span> Overview
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart className="text-black" data={chartData}>
                  <XAxis dataKey="type" className="font-mono font-bold" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="percent" fill="#4f46e5">
                    {goalsProgress.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.percent >= 100 ? "#10b981" : "#4f46e5"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="relative backdrop-blur-sm border border-border p-6 rounded-lg text-center">
            <CornerElements />
            <p className="text-muted-foreground py-8">
              No goals found. Set your first nutritional goal above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
