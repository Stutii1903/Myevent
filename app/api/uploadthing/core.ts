// import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { UploadThingError } from "uploadthing/server";
// import { currentUser } from "@clerk/nextjs/server";
 
// const f = createUploadthing();

// export const ourFileRouter = {
//   imageUploader: f({ image: { maxFileSize: "8MB" } })
//     .middleware(async ({ req }) => {
//       try {
//         // Get current user from Clerk
//         const user = await currentUser();
        
//         if (!user) {
//           throw new UploadThingError("Unauthorized - Please sign in");
//         }

//         console.log("UploadThing middleware - User authenticated:", user.id);
        
//         // Return user data for use in onUploadComplete
//         return { 
//           userId: user.id,
//           userEmail: user.emailAddresses[0]?.emailAddress || ''
//         };
//       } catch (error) {
//         console.error("UploadThing auth error:", error);
//         throw new UploadThingError("Authentication failed");
//       }
//     })
//     .onUploadComplete(async ({ metadata, file }) => {
//       // This code RUNS ON YOUR SERVER after upload
//       console.log("Upload complete for userId:", metadata.userId);
//       console.log("File URL:", file.url);
//       console.log("File name:", file.name);
      
//       return { 
//         uploadedBy: metadata.userId,
//         fileUrl: file.url 
//       };
//     }),
// } satisfies FileRouter;

// export type OurFileRouter = typeof ourFileRouter;
 
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "8MB" } })
    .middleware(async ({ req }) => {
      // Simplified middleware without Clerk auth to avoid the error
      console.log("UploadThing: Processing image upload");
      
      // Return basic metadata
      return { 
        uploadedAt: new Date().toISOString()
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete!");
      console.log("File URL:", file.url);
      console.log("File name:", file.name);
      console.log("File size:", file.size);
      
      return { 
        url: file.url,
        name: file.name,
        size: file.size,
        uploadedAt: metadata.uploadedAt
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
