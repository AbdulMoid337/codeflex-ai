"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "../convex/_generated/api"
import { ConvexHttpClient } from "convex/browser";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Scan food image and get nutritional information
export async function scanFoodImage(file: File) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this food image and extract the following information in JSON format:
      - Food items (list all visible food items)
      - Calories for each food item
      - Protein (in grams) for each food item
      - Carbs (in grams) for each food item
      - Fat (in grams) for each food item
      - Total calories for the entire meal
      
      Only respond with valid JSON in this exact format:
      {
        "foodItems": [
          {
            "name": "string",
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number,
          }
        ],
        "totalCalories": number
      }

      If it's not a food image, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response =  result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      
      // Store the scan result in Convex
      if (data.foodItems && data.foodItems.length > 0) {
        // Convert the image to a Base64 data URL instead of a blob URL
        const imageUrl = `data:${file.type};base64,${base64String}`;
        
        // Save to Convex database
        await convex.mutation(api.foodScans.createFoodScan, {
          userId,
          imageUrl,
          foodItems: data.foodItems,
          totalCalories: data.totalCalories,
        });
      }
      
      return {
        success: true,
        data: data,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error: any) {
    console.error("Error scanning food image:", error);
    throw new Error("Failed to scan food image");
  }
}