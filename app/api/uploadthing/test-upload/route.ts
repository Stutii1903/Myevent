import { NextResponse } from 'next/server';
import { createUploadthing } from "uploadthing/next";

export async function GET() {
  try {
    console.log("🧪 UploadThing test endpoint started");
    
    // Test 1: Check if createUploadthing can be called
    const f = createUploadthing();
    console.log("✅ createUploadthing() works");
    
    // Test 2: Check environment variables
    const envCheck = {
      UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID ? 'Set' : 'Not set',
      UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET ? 'Set (length: ' + process.env.UPLOADTHING_SECRET.length + ')' : 'Not set',
      NODE_ENV: process.env.NODE_ENV,
    };
    console.log("✅ Environment check:", envCheck);
    
    // Test 3: Try to create a simple router
    let testRouter;
    try {
      testRouter = {
        test: f({ image: { maxFileSize: "1MB" } })
          .onUploadComplete(async ({ file }) => {
            return { url: file.url };
          }),
      };
      console.log("✅ Router creation works");
    } catch (routerError) {
      console.error("❌ Router creation failed:", routerError);
      throw routerError;
    }
    
    // Test 4: Check if the router can be serialized
    try {
      const routerString = JSON.stringify(testRouter, null, 2);
      console.log("✅ Router serialization works");
    } catch (serializeError) {
      console.error("❌ Router serialization failed:", serializeError);
      throw serializeError;
    }
    
    return NextResponse.json({
      success: true,
      message: 'UploadThing configuration test passed',
      envCheck,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ UploadThing test failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
