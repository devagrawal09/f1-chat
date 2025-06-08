import { Context } from "hono";
import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing({
  errorFormatter: (err) => {
    console.error("Upload error:", err);
    return { message: err.message };
  },
});

export const uploadRouter = {
  // Image uploads for attachments
  imageUploader: f({
    image: { 
      maxFileSize: "16MB", 
      maxFileCount: 1,
      minFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // TODO: Add Clerk authentication check here
      // For now, allow all uploads
      return { userId: "temp-user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      
      return { 
        uploadedBy: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size,
      };
    }),

  // Document uploads for attachments  
  documentUploader: f({
    "application/pdf": { maxFileSize: "32MB", maxFileCount: 1 },
    "text/plain": { maxFileSize: "16MB", maxFileCount: 1 },
    "application/msword": { maxFileSize: "32MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "32MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      // TODO: Add Clerk authentication check here
      return { userId: "temp-user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Document upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      
      return { 
        uploadedBy: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size,
      };
    }),

  // General file uploads
  fileUploader: f({
    "image/png": { maxFileSize: "16MB", maxFileCount: 1 },
    "image/jpeg": { maxFileSize: "16MB", maxFileCount: 1 },
    "image/gif": { maxFileSize: "16MB", maxFileCount: 1 },
    "image/webp": { maxFileSize: "16MB", maxFileCount: 1 },
    "application/pdf": { maxFileSize: "32MB", maxFileCount: 1 },
    "text/plain": { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      // TODO: Add Clerk authentication check here
      return { userId: "temp-user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("File upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      
      return { 
        uploadedBy: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;

// Alternative simple upload handler (if UploadThing doesn't work)
export async function handleSimpleUpload(c: Context) {
  try {
    // This is a placeholder for simple file upload handling
    // In production, you'd integrate with a storage service like:
    // - AWS S3
    // - Cloudinary  
    // - Supabase Storage
    // - etc.
    
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
      return c.json({ error: "File too large. Max size is 16MB" }, 400);
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "File type not allowed" }, 400);
    }

    // TODO: Upload to actual storage service
    // For now, return a mock response
    const mockUrl = `https://example.com/uploads/${Date.now()}-${file.name}`;
    
    return c.json({
      id: `upload_${Date.now()}`,
      url: mockUrl,
      filename: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: Date.now(),
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      500
    );
  }
}