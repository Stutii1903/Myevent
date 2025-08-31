# UploadThing Setup Guide

## Prerequisites
- Node.js 18+ 
- Next.js 14+
- An UploadThing account

## Setup Steps

### 1. Create UploadThing Account
1. Go to [https://uploadthing.com](https://uploadthing.com)
2. Sign up for a free account
3. Create a new project

### 2. Get API Keys
1. In your UploadThing dashboard, go to the API Keys section
2. Copy your `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`

### 3. Environment Variables
Create a `.env.local` file in your project root and add:

```bash
UPLOADTHING_SECRET=your_secret_here
UPLOADTHING_APP_ID=your_app_id_here
```

### 4. Install Dependencies
The required packages are already in your `package.json`:
- `uploadthing`
- `@uploadthing/react`
- `@uploadthing/shared`

### 5. Configuration Files
The following files are already configured:
- `app/api/uploadthing/core.ts` - File router configuration
- `app/api/uploadthing/route.ts` - API route handler
- `lib/uploadthing.ts` - Client-side helpers

### 6. Usage in Components
The `EventForm` component is already set up to use UploadThing for image uploads.

## Troubleshooting

### Common Issues:

1. **"UploadThing not configured" error**
   - Check that your environment variables are set correctly
   - Restart your development server after adding env vars

2. **Image upload fails**
   - Check browser console for errors
   - Verify file size is under 8MB
   - Ensure file is an image type

3. **CORS errors**
   - UploadThing handles CORS automatically
   - Check that your domain is allowed in UploadThing dashboard

4. **File not showing after upload**
   - Check that the `imageUrl` field is being updated
   - Verify the file URL is accessible

### Debug Mode
The configuration includes extensive logging. Check your browser console and server logs for detailed information about the upload process.

## File Size Limits
- Maximum file size: 8MB
- Supported formats: SVG, PNG, JPG, JPEG, GIF, WebP
- Maximum files per upload: 1

## Security
- Files are validated on both client and server
- File type checking prevents malicious uploads
- Size limits prevent abuse
