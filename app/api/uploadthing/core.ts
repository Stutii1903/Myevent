import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app
export const ourFileRouter = {
  imageUploader: f({ 
    image: { 
      maxFileSize: "4MB",
      maxFileCount: 1
    } 
  })
    .middleware(async ({ req }) => {
      try {
        console.log("UploadThing: Processing image upload");
        console.log("Environment check:", {
          hasSecret: !!process.env.UPLOADTHING_SECRET,
          hasAppId: !!process.env.UPLOADTHING_APP_ID,
          secretPrefix: process.env.UPLOADTHING_SECRET?.substring(0, 8) + "..."
        });
        
        // Return basic metadata
        return { 
          uploadedAt: new Date().toISOString(),
          uploadId: Math.random().toString(36).substring(7)
        };
      } catch (error) {
        console.error("UploadThing middleware error:", error);
        throw new UploadThingError("Failed to process upload");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("Upload complete!");
        console.log("File URL:", file.url);
        console.log("File name:", file.name);
        console.log("File size:", file.size);
        console.log("Upload ID:", metadata.uploadId);
        
        return { 
          url: file.appUrl,
          name: file.name,
          size: file.size,
          uploadedAt: metadata.uploadedAt,
          uploadId: metadata.uploadId
        };
      } catch (error) {
        console.error("UploadThing onUploadComplete error:", error);
        throw new UploadThingError("Failed to complete upload");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
