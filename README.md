# Essentially Sports Reels

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [APIs](#apis)
- [Deploy on Vercel](#deploy-on-vercel)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Structure

The project is organized as follows:

```
essentially-sports-reels/src
├── app/                # Application pages and routing
├── public/             # Static assets (images, icons, etc.)
├── api/                # Backend API routes
├── README.md           # Project documentation
```

# Pages

### `app/page.tsx`

This is the main landing page of the application. It serves as the entry point for users and displays the primary content.

The `Reels` component is a React functional component responsible for rendering a vertical scrolling interface of video reels. It leverages React hooks (`useState`, `useEffect`, `useRef`, and `useCallback`) to manage state, handle video playback, and implement smooth scrolling behavior.

## Key Features

### 1. **Video Reels**

- The `hardcodedReelUrls` array contains the URLs of the video reels to be displayed.
- The `reels` state holds the list of video URLs, which can be dynamically updated in the future.
- Each video is rendered inside a `div` with a `video` element, styled to fill the screen.

### 2. **Video Playback**

- The `videoRefs` array stores references to each video element, allowing programmatic control of playback.
- When the component mounts, the first video starts playing automatically (`useEffect`).
- As the user scrolls, the `handleScroll` function determines which video is in view and plays it while pausing others.

### 3. **Infinite Looping**

- When the user scrolls past the last video, the first video starts playing again, creating a seamless loop.
- This is achieved by resetting the `currentIndex` to `0` and scrolling back to the top smoothly.

### 4. **Overlay Buttons**

Each video has a set of overlay buttons at the bottom, including:

- **Like**: Displays a thumbs-up icon.
- **Comment**: Displays a comment icon.
- **Share**: Displays a share icon.
- **Sound**: Toggles the mute/unmute state of the video.
- **Add**: A button that links to the `/create` page for adding new content.

These buttons are styled using Tailwind CSS and include hover effects.

### 5. **Scrolling Behavior**

- The `handleScroll` function calculates the current video index based on the scroll position.
- It ensures that only the video in view is playing, while others are paused.
- The `snap-y` and `touch-pan-y` classes enable smooth snapping behavior for vertical scrolling.

### 6. **Responsive Design**

- The layout is designed to be responsive, with videos filling the screen (`h-screen`) and maintaining aspect ratio (`object-cover`).
- The overlay buttons are positioned absolutely at the bottom of each video.

## Summary

The `Reels` component provides a smooth and interactive user experience for browsing video reels, with features like autoplay, infinite looping, and interactive controls.

## Create Component

This file defines the "Create" component, which is responsible for generating assets for sports reels using AI.

**Functionality:**

- Utilizes React's `useState` hook to manage the following state:

  - `selectedSport`: The currently chosen sport from the dropdown.
  - `loading`: A boolean indicating whether the asset generation process is in progress.
  - `data`: An object containing the generated asset URLs (script, voiceover, image, and video).

- The `onhandleGenerate` function is triggered when the "Generate" button is clicked.

  - It sends a POST request to the `/api/generate-video` endpoint.
  - The request body includes the `selectedSport`.
  - Upon a successful API call, the response data (containing URLs for script, voiceover, image, and video) is stored in the `data` state.

- The `generateVideo` function handles the API request.
  - It likely includes input validation for the `selectedSport` before sending the request.

**UI Elements:**

- A dropdown menu allows the user to select a sport.
- A "Generate" button initiates the asset generation process.
  - A loading spinner is displayed while the API request is being processed.
- A section displays the generated assets:
  - Script: Rendered within an `<iframe>`.
  - Voiceover: Presented as an `<audio>` player.
  - Image: Shown using an `<img>` tag.
  - Video: Displayed using a `<video>` tag.
- A "Notes" section provides supplementary information:
  - Details about the technologies employed in the component.
  - A link to the relevant GitHub repository.

**Styling:**

- Tailwind CSS is used to style the component.
- Styling encompasses layout, typography, and interactive elements such as hover effects.

# APIs

## Get Reels

This Next.js API route handles incoming GET requests to retrieve a predefined list of video URLs.

**Current Implementation:**

- Due to the current unavailability of Google Bucket Billing, the video URLs are **hardcoded** directly within the route handler.

**Successful Request:**

- Upon receiving a valid GET request, the route handler returns a JSON response with the following structure:

  ```json
  {
    "videos": [
      "URL_1_to_video",
      "URL_2_to_video"
      // ... more video URLs
    ],
    "success": true
  }
  ```

## API Logic for Generating Sports Highlight Reels

This file outlines the server-side API logic responsible for generating sports highlight reels by leveraging several external services:

- **Google's Gemini:** Used for generating the narrative script for the highlight reel.
- **Google Cloud Text-to-Speech:** Synthesizes a natural-sounding voiceover from the generated script.
- **RunwayML:** Transforms a provided image into a dynamic video clip.
- **Google Cloud Storage (GCP):** Serves as the central repository for storing all generated assets, including:
  - Generated scripts.
  - Audio files (voiceovers).
  - Image inputs for video generation.
  - Final video outputs.

**Workflow Integration:**

The API orchestrates the following steps to create a complete sports highlight reel:

1.  **Script Generation:** An initial request triggers Gemini to create an engaging script based on the provided sports context.
2.  **Voiceover Generation:** The generated script is then passed to Google Cloud Text-to-Speech to produce a corresponding audio voiceover.
3.  **Video Generation:** An input image (likely related to the sport or highlight) is sent to RunwayML, which processes it to generate a video sequence.
4.  **Asset Storage:** All the generated assets – the script, the voiceover audio, the input image (optionally), and the final video – are uploaded and stored securely in Google Cloud Storage.

**Deployment Environment:**

This API is specifically designed and intended to function seamlessly within a serverless environment, such as Vercel.

## Deploy on Vercel

This project has been deployed on Vercel.
LINK: https://essentially-sports-reels-git-master-sehbanalams-projects.vercel.app
