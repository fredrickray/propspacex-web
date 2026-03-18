"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImageIcon,
  Upload,
  Video,
  FileImage,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import AddPropertyStepHeader from "../components/AddPropertyStepHeader";

const AddPropertyMediaPage = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const previewUrls = useMemo(
    () => selectedFiles.map((file) => URL.createObjectURL(file)),
    [selectedFiles],
  );

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    setSelectedFiles((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  return (
    <div className="max-w-5xl space-y-6">
      <AddPropertyStepHeader
        title="Upload Media"
        description="Add photos, videos, and floor plans to showcase this property."
        step={5}
        totalSteps={6}
        stepLabel="Media Upload"
      />

      <Card>
        <CardContent className="p-6 space-y-5">
          <Tabs defaultValue="photos">
            <TabsList>
              <TabsTrigger value="photos" className="gap-1.5">
                <ImageIcon className="size-4" /> Photos
              </TabsTrigger>
              <TabsTrigger value="floorplans" className="gap-1.5">
                <FileImage className="size-4" /> Floor Plans
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-1.5">
                <Video className="size-4" /> Videos & Tours
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="rounded-xl border border-dashed border-border bg-muted/20 py-12 px-6 text-center space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              aria-label="Upload property media"
              title="Upload property media"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="mx-auto size-10 rounded-full bg-muted flex items-center justify-center">
              <Upload className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">Drag & Drop files here</p>
              <p className="text-xs text-muted-foreground">
                Support: JPG, PNG, MP4. Max size 20MB per file.
              </p>
            </div>
            <Button size="sm" type="button" onClick={handleBrowseClick}>
              Browse Files
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                Uploaded Media ({selectedFiles.length} file
                {selectedFiles.length === 1 ? "" : "s"})
              </p>
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox /> Apply PropSpace watermark
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {previewUrls.length === 0 ? (
                <div className="col-span-full h-20 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
                  No media uploaded yet
                </div>
              ) : (
                previewUrls.map((previewUrl, index) => (
                  <div
                    key={`${previewUrl}-${index}`}
                    className="h-20 rounded-lg border border-border overflow-hidden bg-muted/40"
                  >
                    <img
                      src={previewUrl}
                      alt={
                        selectedFiles[index]?.name ??
                        `Selected media ${index + 1}`
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/agent/add-property/amenities")}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline">Save Draft</Button>
          <Button
            onClick={() => router.push("/agent/add-property/verification")}
          >
            Next Step
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 flex items-center gap-2">
        <Info className="size-4" />
        High quality images improve listing engagement and lead conversion.
      </div>
    </div>
  );
};

export default AddPropertyMediaPage;
