import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new food scan entry
export const createFoodScan = mutation({
  args: {
    userId: v.string(),
    imageUrl: v.string(),
    foodItems: v.array(
      v.object({
        name: v.string(),
        calories: v.number(),
        protein: v.optional(v.number()),
        carbs: v.optional(v.number()),
        fat: v.optional(v.number()),
      })
    ),
    totalCalories: v.number(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    const scanId = await ctx.db.insert("foodScans", {
      ...args,
      timestamp,
    });

    return scanId;
  },
});

// Get all food scans for a user
export const getUserFoodScans = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const scans = await ctx.db
      .query("foodScans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return scans;
  },
});

// Get a specific food scan by ID
export const getFoodScanById = query({
  args: { scanId: v.id("foodScans") },
  handler: async (ctx, args) => {
    const scan = await ctx.db.get(args.scanId);
    return scan;
  },
});

// Get recent food scans for a user (last 7 days)
export const getRecentFoodScans = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    const scans = await ctx.db
      .query("foodScans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("timestamp"), oneWeekAgo))
      .order("desc")
      .collect();

    return scans;
  },
});

// Delete a food scan
export const deleteFoodScan = mutation({
  args: { scanId: v.id("foodScans") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.scanId);
    return true;
  },
});