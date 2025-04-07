import { NextResponse } from 'next/server';
import RunwayML from '@runwayml/sdk';
import https from 'https';
import textToSpeech from '@google-cloud/text-to-speech';
import fetch from 'node-fetch';
import { Storage } from '@google-cloud/storage';
import { GoogleGenAI } from '@google/genai';

/**
 * This file contains the API logic for generating sports highlight reels using various services:
 * - Google's Gemini to generate script.
 * - Google Cloud Text-to-Speech for generating voiceovers.
 * - RunwayML for generating video from image.
 * - Google Cloud Storage (GCP) for storing generated assets (scripts, audio, images, and videos).
 *
 * The API integrates multiple services to create a complete sports highlight reel workflow:
 * 1. Generate a script using Gemini.
 * 2. Generate a voiceover from the script using Google Text-to-Speech.
 * 3. Generate a video using RunwayML.
 * 4. Upload all generated assets to Google Cloud Storage.
 *
 * The API is designed to work in a serverless environment like Vercel.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sports, photo } = body;

    if (!sports || !photo) {
      return NextResponse.json({ error: 'issue in params' }, { status: 400 });
    }

    let randomId = `${Date.now()}`;
    let tempScriptName = `script-${randomId}.txt`;
    let tempVideoName = `video-${randomId}.mp4`;
    let tempAudioName = `audio-${randomId}.mp3`;

    let scriptURL = await generateVideoScriptUsingGemini(
      sports,
      tempScriptName
    );
    let voiceoverURL = await generateVoiceoverUsingGoogleTTS(
      scriptURL,
      tempAudioName
    );
    let videoURL = await generateVideoFromRunwayML(
      sports,
      photo,
      tempVideoName
    );

    // TODO: Merge audio and video

    return NextResponse.json({
      status: 200,
      data: {
        success: true,
        scriptURL,
        voiceoverURL,
        videoURL,
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

//---------------------GOOGLE TEXT TO SPEECH------------------------------------------//

/**
 * Generates a voiceover using Google Cloud Text-to-Speech and saves it as an MP3 file locally.
 * @param text - The text to convert to speech.
 * @param outputFileName - The name of the output audio file (without extension).
 * @returns A promise that resolves with the path to the saved audio file.
 */
async function generateVoiceoverUsingGoogleTTS(
  scriptURL: string,
  outputFileName: string
): Promise<string> {
  const serviceAccount = {
    type: 'service_account',
    project_id: 'sehban-workspace',
    private_key_id: 'd400a5ccd7fb5ed681886950ffb354657a5af041',
    private_key:
      '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCVkU5fh4gAsEHV\nmCGpJpke/YEqYe6z+s/oHNYqLb0z5VUrxtd41WEmfgpIrmRX2DiI+4jAiMPSLyK1\nn8WBwvQHTO/zuVUPAhGae4Hivxji6nNBVTYF7VltyNySrfjStxPfW3oOgBhLJsWB\no+TD7uQxfxtB9ech0/ORkIbAK5mWhvgNvjiovPinHG6LXmUJLk053+TrkxCD8ZQM\njk5yiDGzxL+EHYeaHCavGGzp8usMTchAm9WBFZOk7qrzfPwWEh1eLQG3CILnpoqE\n2PvB1bf4+lMa1hox3YYxg0tHcC5pGEhuHgFtBvWlhj/ZDuDYUBAYnUnBQVZc+hf3\nPniy3bl7AgMBAAECggEAAngFoGAyjnDsqLO3qfPDgpHNq8ztCPtd8+dkPMC2YpeO\nJdqgUy9bEdFfyxUx2YrJOB2hp+NenUJaENIkZq6UEMMR/y/XnoVNAc0B9uzYvfWS\nDHdjHK+BgHeh0Zdv/qnbr8KpAnmM9kAJOwAX7RstKz+0ObGTyA1hYc1gbS99V3Wl\n/dV4Jt8Ja+FxjW0a1/UqomtOR/Ne3fjctKwB5jr/MBC3OJ1YvakQUq9wT6cGE0Bx\nwfcpJz2xE15dnv36sETY9402kq27+j/GU/7hMe60FcffxHqiFB035RwnVp1G183y\nZZ+dvO6UcGaRa9hIoFZy5zs9UwzV8ucalUIqMh1QtQKBgQDIxDgSX0VYbsLXmJzL\nKecqRYXvelEvtwVav/y/9oOKuwPt1zUUisLVOrbdKV2r3otEs1SMxXWMARtHMioi\nLEkLzQ5bqx+8Suhz4oCPzycClTgHj22mXYusGR7ozM6AsRS0kY1RYrR3ewvCMM9B\n8w3U/cd2n8/ZMc8KO6yhbJgeFQKBgQC+tzOhlVXRU6WaQiFt8VQDDf2rlQFzwstO\nDFpztD8BOG8Kdbg94W9l1Ovdawpzbd6JikFSrap3/6QqFMBXdnIlmq2amETYQ2ID\n0w/piHPY4+mMysj03HKTExcDhUmFb53FsVLSFsoL3uKoOS3pspTy/JQTIB7qrd5i\nP3DoQ4ftTwKBgQCvtsTYl5eq2W4gogqA6hDPd3/M5EJQP6ApGCVPoaLpddrvfE6R\nxwzU8QmBMaYxOZqsq0PR3TSPL5y/SFGGDTp1YKgzZOdmti0S1+frdcPPx+f8/fRb\nCj6nhmj+GdqW2eWkUEveMkR+2iulb3DGaMLvapn74c1Za/WoIChsNA5DLQKBgQC9\nh0DXPponSbJUR44DPYYY9wl2P8FOsnHqYVpui9zlMJkhUvXDAUr8bwnrZBnhtnkm\nRHBAYvf7AuG5NCAliz9K4ZnO/a3FIcnBNTomAgXmsDCES25D8OQoBxui0w3Kfq7T\nLTK6OA2YmGq1dQWMrn1ZsOrSyuQOorVS++sP1zS4/wKBgGJEs/2nQmstw1areqCk\nG6zqSRqZXrZ47KVWEOZ19dYkSimpsAFegZx83lBZxRB5fF7Gv52Y/Efb3rO/h67T\n6Hdrayf8BQVJoURPHwW7jQQoVpMEfoadCVi4N+p4kn60JWX6q/vI3VjpT5DZ/zKc\n6VnkcVuaVc/dm7xJ+qyGwNL3\n-----END PRIVATE KEY-----\n',
    client_email: 'text-to-speech@sehban-workspace.iam.gserviceaccount.com',
    client_id: '116698671482045658777',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
      'https://www.googleapis.com/robot/v1/metadata/x509/text-to-speech%40sehban-workspace.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com',
  };

  const client = new textToSpeech.TextToSpeechClient({
    credentials: serviceAccount,
  });

  const response = await fetch(scriptURL);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch script. Status: ${response.status}, Error: ${response.statusText}`
    );
  }
  const text = await response.text();
  if (!text) {
    throw new Error('Failed to fetch script. The response is empty.');
  }
  console.log('Script fetched successfully.');
  console.log('Script content:', text);

  const request: any = {
    input: { text },
    voice: {
      languageCode: 'en-US',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      pitch: 0,
      speakingRate: 1.2,
    },
  };

  try {
    const [response]: any = await client.synthesizeSpeech(request);
    const audioContent = response[0]?.audioContent;

    if (!response.audioContent) {
      throw new Error('Audio content is empty.');
    }

    let audioURL = await uploadToGCPStorage(
      outputFileName,
      'audio/mpeg',
      response.audioContent,
      'temp'
    );
    console.log(`Voiceover saved as MP3: ${audioURL}`);

    return audioURL;
  } catch (error) {
    console.error('Error generating voiceover using Google TTS:', error);
    throw error;
  }
}

//---------------------GOOGLE GEMINI------------------------------------------//

/**
 * Generates a video script using Google's Gemini API.
 * @param sports - The sports topic for which the script will be generated.
 * @returns A promise that resolves with the generated script as a string.
 */
async function generateVideoScriptUsingGemini(
  sports: string,
  tempScriptName: string
): Promise<any> {
  try {
    const apiKey = 'AIzaSyAKIQ-DQrcHyHtk1-igeTf7h94QHE2NUiU';
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = `Write a creative and engaging short paragraph about ${sports} history in 100 characters. 
      The tone should be energetic and fast-paced, suitable for a sports highlight reel. Do not use any special characters. Write a few lines only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    let script = response.text;

    if (!script) {
      throw new Error('Failed to generate a script. The response is empty.');
    }

    const uploadedURL = await uploadToGCPStorage(
      tempScriptName,
      'text/plain',
      script,
      'temp'
    );

    return uploadedURL;
  } catch (error) {
    console.error(
      'Error while generating video script using Gemini API:',
      error
    );
    throw error;
  }
}

//---------------------RUNWAY ML------------------------------------------//

async function generateVideoFromRunwayML(
  sports: string,
  photo: string,
  tempVideoName: string
) {
  const client = new RunwayML({
    apiKey:
      'key_e529ac63672f6ab86c12cb71e08e6cfdb53439a910636349cfdb46371eceae18fabf04f01014a998a0347afd0acd2e27aa8746c449693ca97aef0749eca8e683',
  });
  const imageToVideo = await client.imageToVideo.create({
    model: 'gen3a_turbo',
    duration: 5, // Duration in seconds
    ratio: '768:1280', // Portrait mode
    watermark: false, // No watermark
    promptImage: `${photo}`,
    promptText: `Kinetic, energetic, fast-paced`,
  });

  const taskId = imageToVideo.id;

  let task: Awaited<ReturnType<typeof client.tasks.retrieve>>;
  do {
    await new Promise((resolve) => setTimeout(resolve, 10000));

    task = await client.tasks.retrieve(taskId);
  } while (!['SUCCEEDED', 'FAILED'].includes(task.status));
  console.log('Task complete:', task);

  if (task.status === 'SUCCEEDED') {
    const videoUrl = task.output ? task.output[0] : null;
    if (!videoUrl) {
      throw new Error('Task output is undefined or empty.');
    }

    const videoBuffer = await fetchVideoAsBuffer(videoUrl);

    let videoURL = await uploadToGCPStorage(
      tempVideoName,
      'video/mp4',
      videoBuffer,
      'temp'
    );

    console.log('Video saved successfully at: ', videoURL);

    return videoURL;
  } else {
    throw new Error('Video generation failed.');
  }
}

/**
 * Fetches a video from the given URL and stores it in memory as a Buffer.
 * @param videoUrl - The URL of the video to fetch.
 * @returns A promise that resolves with the video data as a Buffer.
 */
async function fetchVideoAsBuffer(videoUrl: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(videoUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(
          new Error(
            `Failed to fetch video. Status code: ${response.statusCode}`
          )
        );
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        const videoBuffer = Buffer.concat(chunks);
        console.log('Video fetched successfully.');
        resolve(videoBuffer);
      });

      response.on('error', (err) => {
        console.error('Error while fetching video:', err);
        reject(err);
      });
    });
  });
}

//---------------------GOOGLE CLOUD STORAGE------------------------------------------//

/**
 * Uploads a file to Google Cloud Storage and returns the uploaded file's URL.
 * @param fileName - The name of the file to upload.
 * @param fileType - The MIME type of the file (e.g., "text/plain", "image/png").
 * @param generatedFilePath - The local path of the file to upload.
 * @returns A promise that resolves with the URL of the uploaded file.
 */
async function uploadToGCPStorage(
  fileName: string,
  fileType: string,
  fileContent: any,
  generatedFileType: 'temp' | 'reel'
): Promise<string> {
  try {
    const serviceAccount = {
      type: 'service_account',
      project_id: 'sehban-workspace',
      private_key_id: 'd400a5ccd7fb5ed681886950ffb354657a5af041',
      private_key:
        '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCVkU5fh4gAsEHV\nmCGpJpke/YEqYe6z+s/oHNYqLb0z5VUrxtd41WEmfgpIrmRX2DiI+4jAiMPSLyK1\nn8WBwvQHTO/zuVUPAhGae4Hivxji6nNBVTYF7VltyNySrfjStxPfW3oOgBhLJsWB\no+TD7uQxfxtB9ech0/ORkIbAK5mWhvgNvjiovPinHG6LXmUJLk053+TrkxCD8ZQM\njk5yiDGzxL+EHYeaHCavGGzp8usMTchAm9WBFZOk7qrzfPwWEh1eLQG3CILnpoqE\n2PvB1bf4+lMa1hox3YYxg0tHcC5pGEhuHgFtBvWlhj/ZDuDYUBAYnUnBQVZc+hf3\nPniy3bl7AgMBAAECggEAAngFoGAyjnDsqLO3qfPDgpHNq8ztCPtd8+dkPMC2YpeO\nJdqgUy9bEdFfyxUx2YrJOB2hp+NenUJaENIkZq6UEMMR/y/XnoVNAc0B9uzYvfWS\nDHdjHK+BgHeh0Zdv/qnbr8KpAnmM9kAJOwAX7RstKz+0ObGTyA1hYc1gbS99V3Wl\n/dV4Jt8Ja+FxjW0a1/UqomtOR/Ne3fjctKwB5jr/MBC3OJ1YvakQUq9wT6cGE0Bx\nwfcpJz2xE15dnv36sETY9402kq27+j/GU/7hMe60FcffxHqiFB035RwnVp1G183y\nZZ+dvO6UcGaRa9hIoFZy5zs9UwzV8ucalUIqMh1QtQKBgQDIxDgSX0VYbsLXmJzL\nKecqRYXvelEvtwVav/y/9oOKuwPt1zUUisLVOrbdKV2r3otEs1SMxXWMARtHMioi\nLEkLzQ5bqx+8Suhz4oCPzycClTgHj22mXYusGR7ozM6AsRS0kY1RYrR3ewvCMM9B\n8w3U/cd2n8/ZMc8KO6yhbJgeFQKBgQC+tzOhlVXRU6WaQiFt8VQDDf2rlQFzwstO\nDFpztD8BOG8Kdbg94W9l1Ovdawpzbd6JikFSrap3/6QqFMBXdnIlmq2amETYQ2ID\n0w/piHPY4+mMysj03HKTExcDhUmFb53FsVLSFsoL3uKoOS3pspTy/JQTIB7qrd5i\nP3DoQ4ftTwKBgQCvtsTYl5eq2W4gogqA6hDPd3/M5EJQP6ApGCVPoaLpddrvfE6R\nxwzU8QmBMaYxOZqsq0PR3TSPL5y/SFGGDTp1YKgzZOdmti0S1+frdcPPx+f8/fRb\nCj6nhmj+GdqW2eWkUEveMkR+2iulb3DGaMLvapn74c1Za/WoIChsNA5DLQKBgQC9\nh0DXPponSbJUR44DPYYY9wl2P8FOsnHqYVpui9zlMJkhUvXDAUr8bwnrZBnhtnkm\nRHBAYvf7AuG5NCAliz9K4ZnO/a3FIcnBNTomAgXmsDCES25D8OQoBxui0w3Kfq7T\nLTK6OA2YmGq1dQWMrn1ZsOrSyuQOorVS++sP1zS4/wKBgGJEs/2nQmstw1areqCk\nG6zqSRqZXrZ47KVWEOZ19dYkSimpsAFegZx83lBZxRB5fF7Gv52Y/Efb3rO/h67T\n6Hdrayf8BQVJoURPHwW7jQQoVpMEfoadCVi4N+p4kn60JWX6q/vI3VjpT5DZ/zKc\n6VnkcVuaVc/dm7xJ+qyGwNL3\n-----END PRIVATE KEY-----\n',
      client_email: 'text-to-speech@sehban-workspace.iam.gserviceaccount.com',
      client_id: '116698671482045658777',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url:
        'https://www.googleapis.com/robot/v1/metadata/x509/text-to-speech%40sehban-workspace.iam.gserviceaccount.com',
      universe_domain: 'googleapis.com',
    };

    const storage = new Storage({
      projectId: serviceAccount.project_id,
      credentials: serviceAccount,
    });

    const bucketName = 'sehban';
    if (!bucketName) {
      throw new Error('GCP_BUCKET_NAME environment variable is not set.');
    }

    const directory = generatedFileType === 'temp' ? 'temp' : 'reel';
    const filePath = `${directory}/${fileName}`;
    const bucket = storage.bucket(bucketName);
    const gcpFile = bucket.file(filePath);

    await gcpFile.save(fileContent, {
      metadata: {
        contentType: fileType,
      },
    });
    await gcpFile.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
    console.log(`File uploaded to GCP Storage: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to GCP Storage:', error);
    throw error;
  }
}
