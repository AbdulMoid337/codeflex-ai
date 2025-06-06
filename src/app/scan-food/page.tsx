"use client";

import { useState } from "react";
import { scanFoodImage } from "../../../actions/food-scan";
import { useUser } from "@clerk/nextjs";
import CornerElements from "@/components/CornerElements";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader } from "@/components/ui/loader";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, Trash2, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [deletingScanId, setDeletingScanId] = useState<string | null>(null);

  const deleteFoodScan = useMutation(api.foodScans.deleteFoodScan);

  const handleDelete = async (scanId: string) => {
    setDeletingScanId(scanId);
    await deleteFoodScan({ scanId: scanId as any });
    setDeletingScanId(null);
    toast.success("Scan deleted successfully");
  };

  const { user } = useUser();
  const userId = user?.id;

  const recentScans = useQuery(api.foodScans.getRecentFoodScans, {
    userId: userId || "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image");
      return;
    }

    try {
      setLoading(true);
      const scanResult = await scanFoodImage(file);
      setResult(scanResult.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to scan food image");
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen px-4 py-8 md:px-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center">
          Food Scanner
        </h1>
        <Link href="/user-goals">
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform animate-pulse"
          >
            Goals and Stats
            <Sparkles className=" h-5 w-5" />
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4 ">
        <div className="border-2 border-dashed  border-gray-300 rounded-lg p-4 text-center">
          {preview ? (
            <div className="relative max-w-xs mx-auto">
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-xl object-cover border-4 border-primary/30 shadow-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute w-8 top-2 right-9 bg-red-400  font-extrabold text-black p-1 rounded-full"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="py-8">
              <p className="text-gray-500 mb-5">Upload a photo of your food</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="food-image"
              />
              <label
                htmlFor="food-image"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer"
              >
                Select Image
              </label>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-green-500 text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Scanning Your Food . . ." : "Scan Food"}
        </button>
      </form>

      {loading && !result && (
        <div className="mt-8 flex justify-center">
          <Loader />
        </div>
      )}

      {recentScans === undefined && (
        <div className="mt-8 flex justify-center gap-2">
          <p className="text-muted-foreground animate-pulse">
            Loading Recently scanned foods...
          </p>
          <Loader />
        </div>
      )}

      {recentScans && recentScans.length > 0 ? (
        <div className="w-full max-w-4xl px-4 pt-8">
          <div className="relative backdrop-blur-sm border border-border p-6 rounded-lg mb-8">
            <CornerElements />
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <h2 className="text-xl font-bold tracking-tight">
                <span className="text-primary">Your</span>{" "}
                <span className="text-foreground">Recently Scanned Foods</span>
              </h2>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary rounded-full my-6 animate-pulse"></div>
            <Accordion type="multiple" className="space-y-4">
              {recentScans.map((scan) => (
                <div key={scan._id} className="flex flex-col ">
                  <AccordionItem
                    key={scan._id}
                    value={scan._id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/10 ">
                      <div className="flex justify-between w-full items-center">
                        {/* Left side: Date */}
                        <span className="text-primary">
                          {new Date(scan.timestamp).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>

                        {/* Right side: Calories + Trash */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground font-mono font-extrabold">
                            {scan.totalCalories} CAL
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(scan._id)
                            }}
                            className="text-red-500 hover:text-red-600"
                            disabled={deletingScanId === scan._id}
                          >
                            {deletingScanId === scan._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-4 px-4">
                      <div className="flex items-center gap-2 mb-2">
                        {scan.imageUrl && (
                          <img
                            src={scan.imageUrl}
                            alt="Food"
                            className="w-12 h-12 object-cover rounded-md border border-border cursor-pointer"
                            onClick={() => setModalImageUrl(scan.imageUrl)}
                          />
                        )}
                      </div>
                      <div className="space-y-2 mt-2">
                        {scan.foodItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="border-b border-border pb-2 last:border-b-0"
                          >
                            <div className="flex justify-between">
                              <span className="font-bold text-xl text-primary font-mono">
                                {item.name}
                              </span>
                              <span className="font-normal text-xl text-primary font-mono">
                                {item.calories} cal
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                              <span className="text-foreground text-xs font-mono font-semibold">
                                Protein:{" "}
                                {item.protein !== undefined
                                  ? `${item.protein}g`
                                  : "N/A"}
                              </span>
                              <span className="text-foreground font-mono font-semibold">
                                Carbs:{" "}
                                {item.carbs !== undefined
                                  ? `${item.carbs}g`
                                  : "N/A"}
                              </span>
                              <span className="text-foreground font-mono font-semibold">
                                Fat:{" "}
                                {item.fat !== undefined
                                  ? `${item.fat}g`
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </div>
              ))}
            </Accordion>
          </div>
        </div>
      ) : (
        <div className="text-center mt-8 text-muted-foreground text-sm">
          No foods scanned.
        </div>
      )}

      {/* Image Preview Modal */}
      {modalImageUrl && (
        <Dialog
          open={!!modalImageUrl}
          onOpenChange={() => setModalImageUrl(null)}
        >
          <DialogContent className="p-4 max-w-lg w-full">
            <img
              src={modalImageUrl}
              alt="Preview"
              className="w-full h-auto rounded-md object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
