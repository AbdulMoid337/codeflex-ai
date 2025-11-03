"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function scanFoodImage(file: File) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
    Analyze this food image and extract nutritional information in JSON format:
    - List all visible food items
    - Calories, Protein (g), Carbs (g), and Fat (g) for each
    - Total calories for the meal

    Respond ONLY with valid JSON in this structure:
    {
      "foodItems": [
        {
          "name": "string",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }
      ],
      "totalCalories": number
    }

    If the image is not of food, return {}.
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      { text: prompt },
    ]);

    const text = result.response.text() ?? "";
    const cleanedText = text.replace(/```(?:json)?\n?|```/g, "").trim();

    let data: any;
    try {
      data = JSON.parse(cleanedText);
    } catch {
      console.error("Gemini returned invalid JSON:", cleanedText);
      throw new Error("Invalid response format from Gemini");
    }

    if (data.foodItems && Array.isArray(data.foodItems) && data.foodItems.length > 0) {
      const imageUrl = `data:${file.type};base64,${base64String}`;

      await convex.mutation(api.foodScans.createFoodScan, {
        userId,
        imageUrl,
        foodItems: data.foodItems,
        totalCalories: data.totalCalories,
      });
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Error scanning food image:", error);
    throw new Error(error.message || "Failed to scan food image");
  }
}
