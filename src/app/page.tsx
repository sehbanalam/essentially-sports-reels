// This file defines the `Reels` component, which is a React functional component
// responsible for rendering a vertical scrolling interface of video reels.
// The component uses React hooks (`useState`, `useEffect`, `useRef`, and `useCallback`)
// to manage state, handle video playback, and implement smooth scrolling behavior.
//
// Key Features:
// 1. **Video Reels**:
//    - The `hardcodedReelUrls` array contains the URLs of the video reels to be displayed.
//    - The `reels` state holds the list of video URLs, which can be dynamically updated in the future.
//    - Each video is rendered inside a `div` with a `video` element, styled to fill the screen.
//
// 2. **Video Playback**:
//    - The `videoRefs` array stores references to each video element, allowing programmatic control of playback.
//    - When the component mounts, the first video starts playing automatically (`useEffect`).
//    - As the user scrolls, the `handleScroll` function determines which video is in view and plays it while pausing others.
//
// 3. **Infinite Looping**:
//    - When the user scrolls past the last video, the first video starts playing again, creating a seamless loop.
//    - This is achieved by resetting the `currentIndex` to `0` and scrolling back to the top smoothly.
//
// 4. **Overlay Buttons**:
//    - Each video has a set of overlay buttons at the bottom, including:
//      - **Like**: Displays a thumbs-up icon.
//      - **Comment**: Displays a comment icon.
//      - **Share**: Displays a share icon.
//      - **Sound**: Toggles the mute/unmute state of the video.
//      - **Add**: A button that links to the `/create` page for adding new content.
//    - These buttons are styled using Tailwind CSS and include hover effects.
//
// 5. **Scrolling Behavior**:
//    - The `handleScroll` function calculates the current video index based on the scroll position.
//    - It ensures that only the video in view is playing, while others are paused.
//    - The `snap-y` and `touch-pan-y` classes enable smooth snapping behavior for vertical scrolling.
//
// 6. **Responsive Design**:
//    - The layout is designed to be responsive, with videos filling the screen (`h-screen`) and maintaining aspect ratio (`object-cover`).
//    - The overlay buttons are positioned absolutely at the bottom of each video.
//
// Overall, this component provides a smooth and interactive user experience for browsing video reels,
// with features like autoplay, infinite looping, and interactive controls.
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function Reels() {
  // Replace hardcodedReelUrls with dynamic data fetching
  const hardcodedReelUrls = [
    '/videos/0.mp4',
    '/videos/2.mp4',
    '/videos/3.mp4',
    '/videos/1.mp4',
  ];

  const [reels, setReels] = useState(hardcodedReelUrls);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reels.length > 0 && videoRefs.current[0]) {
      videoRefs.current[0]
        .play()
        .catch((error) => console.error('Playback failed:', error));
    }
  }, [reels]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const containerHeight = containerRef.current.offsetHeight;
    const scrollTop = containerRef.current.scrollTop;

    const newIndex = Math.round(scrollTop / containerHeight);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
      videoRefs.current.forEach((ref, index) => {
        if (ref) {
          if (index === newIndex) {
            ref
              .play()
              .catch((error) => console.error('Playback failed:', error));
          } else {
            ref.pause();
          }
        }
      });
    } else if (
      scrollTop + containerHeight >=
      containerRef.current.scrollHeight
    ) {
      setCurrentIndex(0);
      if (videoRefs.current[0]) {
        videoRefs.current.forEach((ref) => ref?.pause());
        videoRefs.current[0]
          .play()
          .catch((error) => console.error('Playback failed:', error));
      }
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIndex, reels.length]);

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y touch-pan-y"
      onScroll={handleScroll}
    >
      {reels.map((reelUrl, index) => (
        <div
          key={index}
          className="relative h-screen snap-start flex items-center justify-center bg-black"
        >
          <video
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            src={reelUrl}
            loop
            muted
            className="w-full h-full object-cover"
          />
          {/* Overlay Icons */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-6">
            <button className="flex flex-col items-center text-white hover:text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 9V5a3 3 0 00-3-3l-3 9v11a2 2 0 002 2h7.5a2.5 2.5 0 002.45-3.05l-1.38-6.9A2.5 2.5 0 0016.12 9H14z"
                />
              </svg>
              <span className="text-sm">Like</span>
            </button>
            <button className="flex flex-col items-center text-white hover:text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m-7 4h8a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">Comment</span>
            </button>
            <button className="flex flex-col items-center text-white hover:text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 12v.01M12 4v.01M20 12v.01M12 20v.01M8 8l8-4m0 16l-8-4m0-8v8m8-8v8"
                />
              </svg>
              <span className="text-sm">Share</span>
            </button>
            {/* Mute/Unmute Button */}
            <button
              onClick={() => {
                const video = videoRefs.current[index];
                if (video) {
                  video.muted = !video.muted;
                }
              }}
              className="flex flex-col items-center text-white hover:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5.882L6.825 9H4a1 1 0 00-1 1v4a1 1 0 001 1h2.825L11 18.118A1 1 0 0012 17.236V6.764a1 1 0 00-1-1.882zM16.5 8.5a5.5 5.5 0 010 7m2-9a8.5 8.5 0 010 11"
                />
              </svg>
              <span className="text-sm">Sound</span>
            </button>
            <a
              href="/create"
              className="flex flex-col items-center text-white hover:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm">Add</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
