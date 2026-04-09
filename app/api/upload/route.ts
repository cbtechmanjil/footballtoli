import { NextResponse } from 'next/server';
import { r2, R2_BUCKET_NAME } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: Request) {
  try {
    const { fileName, contentType } = await request.json();

    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'Missing filename or content type' }, { status: 400 });
    }

    // Sanitize filename to avoid collisions and paths
    const timestamp = Date.now();
    const sanitizedFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: sanitizedFileName,
      ContentType: contentType,
    });

    // Generate pre-signed URL valid for 1 hour
    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

    return NextResponse.json({ 
      url: signedUrl,
      key: sanitizedFileName,
      publicUrl: process.env.R2_PUBLIC_DOMAIN 
        ? `${process.env.R2_PUBLIC_DOMAIN}/${sanitizedFileName}`
        : null
    });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
