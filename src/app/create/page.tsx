// This file defines the "Create" component for generating assets for sports reels using AI.
// It uses React's useState hook to manage the state of selected sport, loading status, and generated data (script, voiceover, image, and video URLs).
// The "onhandleGenerate" function is triggered when the "Generate" button is clicked. It sends a POST request to the "/api/generate-video" endpoint with the selected sport.
// If the API call is successful, the response data (URLs for script, voiceover, image, and video) is stored in the "data" state.
// The "generateVideo" function handles the API request and validates the input before sending the request.
// The UI includes:
// - A dropdown to select a sport.
// - A "Generate" button that triggers the asset generation process and shows a loading spinner while the request is in progress.
// - A section to display the generated assets (script in an iframe, voiceover as an audio player, image as an <img>, and video as a <video>).
// - A "Notes" section providing additional information about the technologies used and a link to the GitHub repository.
// Tailwind CSS is used for styling the component, including layout, typography, and hover effects.

'use client';

import { useState } from 'react';

interface Data {
  scriptURL: string;
  voiceoverURL: string;
  videoURL: string;
}

export default function Create() {
  const [selectedSport, setSelectedSport] = useState<string>('cricket');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [data, setData] = useState<Data>({
    scriptURL: '',
    voiceoverURL: '',
    videoURL: '',
  });

  const onhandleGenerate = async () => {
    try {
      setLoading(true);
      console.log('Selected Sport:', selectedSport);
      console.log('Selected Image:', selectedImage);

      let apiResponse: any = await generateVideo(selectedSport, selectedImage);
      if (apiResponse.status == 200) {
        setData({
          scriptURL: apiResponse.data.scriptURL,
          voiceoverURL: apiResponse.data.voiceoverURL,
          videoURL: apiResponse.data.videoURL,
        });
      } else {
        console.error('Error in generating video:');
        alert('Error in generating video');
      }
    } catch (error) {
      console.error('Error during generation:', error);
    } finally {
      setLoading(false);
    }
  };

  async function generateVideo(
    sports: string,
    image: File | null
  ): Promise<void> {
    try {
      // Validate inputs
      if (!sports) {
        console.error('Sports is required.');
        alert('Please enter a Sports name.');
        return;
      }
      if (!image) {
        console.error('Image is required.');
        alert('Please upload an image.');
        return;
      }

      let base64Image: string = await convertImageToBase64(image);

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sports: sports,
          photo: base64Image,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('Error while generating video:', error);
      alert('An error occurred while generating the video. Please try again.');
    }
  }

  function convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result.toString());
        } else {
          reject('Failed to convert file to Base64.');
        }
      };
      reader.onerror = () => {
        reject('Error reading file.');
      };
      reader.readAsDataURL(file);
    });
  }

  //------------------------------------VIEW------------------------------------------//

  return (
    <div className="max-w-screen-sm flex justify-center items-center m-2">
      <div className="aspect-w-9 aspect-h-16 border border-gray-400 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Generate Assets
        </h2>
        <p className="text-sm text-gray-600">
          Generate assets for your reels using the power of AI.
        </p>

        <div className="mt-4">
          <label
            htmlFor="sports"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Choose Sports
          </label>
          <div className="relative">
            <select
              id="sports"
              name="sports"
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 px-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="cricket">Cricket</option>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="tennis">Tennis</option>
              <option value="hockey">Hockey</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 17a1 1 0 01-.707-.293l-5-5a1 1 0 011.414-1.414L10 14.586l4.293-4.293a1 1 0 011.414 1.414l-5 5A1 1 0 0110 17z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
        {/* File Picker for Images */}
        <div className="mt-6">
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload Image (PNG or JPG)
          </label>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            DO NOT USE COPYRIGHTED IMAGES OTHERWISE VIDEO GENERATION WILL FAIL
          </span>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  aria-hidden="true"
                  className="w-10 h-10 mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16V8m0 0l4-4m-4 4l-4-4m13 8h-3m0 0a4 4 0 01-4 4m4-4a4 4 0 014-4m0 0h3"
                  ></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG (Max 5MB)</p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".png, .jpg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedImage(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
        {/* Preview Selected File */}
        {selectedImage && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected File
            </h3>
            <div className="flex items-center justify-center border border-gray-300 rounded-lg p-4 bg-gray-50">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected Preview"
                className="max-w-full max-h-48 object-contain"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 text-center">
              {selectedImage.name} ({(selectedImage.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={onhandleGenerate}
          className={`mt-6 w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm ${
            loading ? 'cursor-not-allowed opacity-70' : ''
          }`}
          disabled={loading}
        >
          {loading ? (
            <div className="flex justify-center items-center">
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Loading...
            </div>
          ) : (
            'Generate'
          )}
        </button>
        {/* Generated Assets */}
        {data.scriptURL || data.voiceoverURL || data.videoURL ? (
          <div className="mt-6 flex justify-center items-center flex-wrap">
            <div className="flex justify-center items-center flex-wrap border border-gray-300 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Script
              </label>
              {data.scriptURL ? (
                <iframe
                  src={data.scriptURL}
                  title="Script"
                  className="w-full h-32"
                ></iframe>
              ) : (
                'Script'
              )}
            </div>
            <div className="flex justify-center items-center flex-wrap border border-gray-300 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Over
              </label>
              {data.voiceoverURL ? (
                <audio controls>
                  <source src={data.voiceoverURL} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                'Voice Over'
              )}
            </div>

            <div className="flex justify-center items-center flex-wrap border border-gray-300 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video
              </label>
              {data.videoURL ? (
                <video controls className="w-full h-auto">
                  <source src={data.videoURL} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                'Video'
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-center items-center flex-wrap">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Notes</h2>
          <ul className="list-disc pl-5">
            <li>
              <p>
                All the assets are generated using AI and are stored in Google
                Cloud Bucket.
              </p>
            </li>
            <li>
              <p>
                Google Gemini, Google Cloud Text To Speech API and RunwayML are
                used here.
              </p>
            </li>
            <li>
              <p>
                Next step is to merge these assets using AWS Elemental
                MediaConvert cloud service.
              </p>
            </li>
            <li>
              <p>
                I do not have money to buy API keys. All of these are paid
                services. However, I have coded all of them and they can be
                found at GitHub Repo{' '}
                <a
                  className="text-indigo-600 hover:underline font-medium"
                  href="https://github.com/sehbanalam/essentially-sports-reels/blob/main/src/app/api/generate-video/route.ts"
                >
                  HERE.
                </a>
              </p>
            </li>
          </ul>
          <a
            href="/"
            className="mt-6 w-full bg-red-600 text-white font-medium py-2 px-4 rounded-md shadow-md text-center hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
