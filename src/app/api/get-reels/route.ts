// This is a Next.js API route that handles GET requests to fetch a hardcoded list of video URLs.
// The videos are currently hardcoded due to the unavailability of Google Bucket Billing.
// On a successful request, it returns a JSON response with the video URLs and a success status.
// If an error occurs, it logs the error and returns a 500 status with the error details.

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Hardcoded list of videos for now because the Google Bucket Billing is not enabled
    let videos = [
      'https://drive.google.com/file/d/1q4QGLNS5ePGftlicFkkbh7durgu7Kkkp/view?usp=drive_link',
      'https://drive.google.com/file/d/1xL9Ys18socJT4BnORj2e2CmB9lcFv2t1/view?usp=drive_link',
      'https://drive.google.com/file/d/1CrfdqY9yzSpippTf99Sqzzbotbo7qJvz/view?usp=drive_link',
      'https://drive.google.com/file/d/1q_j0zx2sR47-jph-T9gxClOBArX-aa1n/view?usp=drive_link',
    ];

    return NextResponse.json({
      status: 200,
      data: {
        success: true,
        videos: videos,
      },
      errors: {},
    });
  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json({
      status: 500,
      data: {},
      errors: { error: error },
    });
  }
}
