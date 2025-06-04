import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update a goal
export const upsertGoal = mutation({
  args: {
    userId: v.string(),
    type: v.union(v.literal("calories"), v.literal("protein"), v.literal("carbs"), v.literal("fat")),
    target: v.number(),
    period: v.union(v.literal("daily"), v.literal("weekly")),
    _id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { _id, ...goalData } = args;
    
    const existing = await ctx.db
      .query("goals")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), args.type),
          q.eq(q.field("period"), args.period)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { target: args.target });
      return existing._id;
    }

    return await ctx.db.insert("goals", { ...goalData, createdAt: Date.now() });
  },
});

// Get user goals
export const getGoals = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("goals")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getGoalProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const dayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    const weekStart = now - 7 * 24 * 60 * 60 * 1000;

    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    const scans = await ctx.db
      .query("foodScans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    // Separate totals for daily and weekly periods
    const dailyTotals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    
    const weeklyTotals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    // Process each scan and its items only once
    for (const scan of scans) {
      const isToday = scan.timestamp >= dayStart;
      const isWeek = scan.timestamp >= weekStart;

      for (const item of scan.foodItems) {
        // Add to daily totals if the scan is from today
        if (isToday) {
          dailyTotals.calories += item.calories ?? 0;
          dailyTotals.protein += item.protein ?? 0;
          dailyTotals.carbs += item.carbs ?? 0;
          dailyTotals.fat += item.fat ?? 0;
        }
        
        // Add to weekly totals if the scan is from this week
        if (isWeek) {
          weeklyTotals.calories += item.calories ?? 0;
          weeklyTotals.protein += item.protein ?? 0;
          weeklyTotals.carbs += item.carbs ?? 0;
          weeklyTotals.fat += item.fat ?? 0;
        }
      }
    }

    // Map goals to their progress
    return goals.map((goal) => {
      const totals = goal.period === "daily" ? dailyTotals : weeklyTotals;
      return {
        _id: goal._id, // Include the goal ID for editing
        type: goal.type,
        period: goal.period,
        target: goal.target,
        current: totals[goal.type],
        percent: Math.min((totals[goal.type] / goal.target) * 100, 100),
      };
    });
  },
});
  