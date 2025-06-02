import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  plans: defineTable({
    userId: v.string(),
    name: v.string(),
    workoutPlan: v.object({
      schedule: v.array(v.string()),
      exercises: v.array(
        v.object({
          day: v.string(),
          routines: v.array(
            v.object({
              name: v.string(),
              sets: v.optional(v.number()),
              reps: v.optional(v.number()),
              duration: v.optional(v.string()),
              description: v.optional(v.string()),
              exercises: v.optional(v.array(v.string())),
            })
          ),
        })
      ),
    }),
    dietPlan: v.object({
      dailyCalories: v.number(),
      meals: v.array(
        v.object({
          name: v.string(),
          foods: v.array(v.string()),
        })
      ),
    }),
    isActive: v.boolean(),
  })
    .index("by_user_id", ["userId"])
    .index("by_active", ["isActive"]),

  foodScans: defineTable({
    userId: v.string(),
    imageUrl: v.string(),
    timestamp: v.number(),
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
  })
    .index("by_user_id", ["userId"])
    .index("by_timestamp", ["timestamp"]),

    goals: defineTable({
      userId: v.string(),
      type: v.union(v.literal("calories"), v.literal("protein"), v.literal("carbs"), v.literal("fat")),
      target: v.number(),
      period: v.union(v.literal("daily"), v.literal("weekly")),
      createdAt: v.number()
    }).index("by_user_id", ["userId"]),
    
});