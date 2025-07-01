import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Helper function to add CORS headers
function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export async function POST(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return addCorsHeaders(
      new NextResponse(null, { status: 200 })
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        )
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return addCorsHeaders(
        NextResponse.json(
          { 
            error: 'File type not allowed',
            allowedTypes: ALLOWED_FILE_TYPES 
          },
          { status: 400 }
        )
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return addCorsHeaders(
        NextResponse.json(
          { 
            error: 'File too large',
            maxSize: MAX_FILE_SIZE,
            currentSize: file.size
          },
          { status: 400 }
        )
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return success response
    const response = NextResponse.json({
      message: 'File uploaded successfully',
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: `/uploads/${fileName}`
    });

    return addCorsHeaders(response);

  } catch (error) {
    console.error('Upload error:', error);
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    );
  }
}

// Handle GET requests to show upload info
export async function GET() {
  const response = NextResponse.json({
    message: 'File upload endpoint',
    allowedTypes: ALLOWED_FILE_TYPES,
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024)
  });

  return addCorsHeaders(response);
}
