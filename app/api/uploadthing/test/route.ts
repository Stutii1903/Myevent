import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const config = {
      appId: process.env.UPLOADTHING_APP_ID,
      secret: process.env.UPLOADTHING_SECRET ? 'Set (length: ' + process.env.UPLOADTHING_SECRET.length + ')' : 'Not set',
      nodeEnv: process.env.NODE_ENV,
      uploadthingVersion: '7.7.4'
    };

    console.log('UploadThing Test Config:', config);

    return NextResponse.json({
      success: true,
      config,
      message: 'UploadThing configuration check'
    });
  } catch (error) {
    console.error('UploadThing test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
