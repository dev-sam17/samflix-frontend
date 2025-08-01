"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
  ArrowLeft,
  Settings,
  Languages,
  Subtitles,
} from "lucide-react";
interface AudioTrack {
  kind: string;
  label: string;
  language: string;
  default?: boolean;
  id?: number;
  groupId?: string;
}

interface SubtitleTrack {
  kind: string;
  label: string;
  language: string;
  default?: boolean;
  id?: number;
  groupId?: string;
}

interface QualityLevel {
  height: number;
  width: number;
  bitrate: number;
  level: number;
  name: string;
}

interface HLSPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  onBack?: () => void;
  autoPlay?: boolean;
  audioTracks?: AudioTrack[];
  subtitleTracks?: SubtitleTrack[];
  tmdbId?: string;
  clerkId?: string;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
}

export function HLSPlayer({
  src,
  title,
  poster,
  onBack,
  autoPlay = false,
  tmdbId,
  clerkId,
  initialTime = 0,
  onTimeUpdate,
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<string>("");
  const [selectedSubtitleTrack, setSelectedSubtitleTrack] =
    useState<string>("");
  const [isSubtitlesEnabled, setIsSubtitlesEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [videoScale, setVideoScale] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  // HLS-specific state
  const [availableAudioTracks, setAvailableAudioTracks] = useState<
    AudioTrack[]
  >([]);
  const [availableSubtitleTracks, setAvailableSubtitleTracks] = useState<
    SubtitleTrack[]
  >([]);
  const [availableQualityLevels, setAvailableQualityLevels] = useState<
    QualityLevel[]
  >([]);
  const [currentQualityLevel, setCurrentQualityLevel] = useState<number>(-1); // -1 for auto

  // Detect mobile and orientation
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        window.innerWidth <= 768 ||
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const portrait = window.innerHeight > window.innerWidth;
      setIsMobile(mobile);
      setIsPortrait(portrait);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log("Manifest parsed", data);

        // Extract quality levels
        const levels = hls.levels.map((level, index) => ({
          height: level.height,
          width: level.width,
          bitrate: level.bitrate,
          level: index,
          name: `${level.height}p (${Math.round(level.bitrate / 1000)}k)`,
        }));
        setAvailableQualityLevels(levels);
        
        // Set initial time if provided (for resume playback)
        if (initialTime > 0) {
          video.currentTime = initialTime;
        }

        if (autoPlay) {
          video.play().catch(console.error);
        }
      });

      // Handle audio tracks
      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (event, data) => {
        console.log("Audio tracks updated", data);
        const tracks = data.audioTracks.map((track: any, index: number) => ({
          kind: "audio",
          label: track.name || track.lang || `Audio ${index + 1}`,
          language: track.lang || "unknown",
          default: track.default,
          id: track.id,
          groupId: track.groupId,
        }));
        setAvailableAudioTracks(tracks);

        // Set default audio track
        const defaultTrack = tracks.find((track: AudioTrack) => track.default);
        if (defaultTrack) {
          setSelectedAudioTrack(defaultTrack.language);
        }
      });

      // Handle subtitle tracks
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => {
        console.log("Subtitle tracks updated", data);
        const tracks = data.subtitleTracks.map((track: any, index: number) => ({
          kind: "subtitles",
          label: track.name || track.lang || `Subtitle ${index + 1}`,
          language: track.lang || "unknown",
          default: track.default,
          id: track.id,
          groupId: track.groupId,
        }));
        setAvailableSubtitleTracks(tracks);

        // Set default subtitle track
        const defaultTrack = tracks.find(
          (track: SubtitleTrack) => track.default
        );
        if (defaultTrack) {
          setSelectedSubtitleTrack(defaultTrack.language);
        }
      });

      // Handle level switching
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        console.log("Level switched to", data.level);
        setCurrentQualityLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.log("HLS Error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              console.log("Unrecoverable error");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      if (autoPlay) {
        video.play().catch(console.error);
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src, autoPlay]);

  // Add a CSS class to the document when in fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.classList.add("hls-fullscreen-active");

      // When in fullscreen mode, add a style tag to handle z-index for dialogs
      const styleTag = document.createElement("style");
      styleTag.id = "fullscreen-dialog-styles";
      styleTag.innerHTML = `
        [data-radix-popper-content-wrapper] {
          z-index: 10000 !important;
        }
      `;
      document.head.appendChild(styleTag);
    } else {
      document.documentElement.classList.remove("hls-fullscreen-active");

      // Remove the style tag when exiting fullscreen
      const existingStyle = document.getElementById("fullscreen-dialog-styles");
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [isFullscreen]);

  // Progress saving interval reference
  const saveProgress = useCallback(
    (time: number) => {
      if (!tmdbId || !clerkId) return;
      
      // Call the onTimeUpdate callback if provided
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }
      
      // We don't need to save progress for very short watches (less than 10 seconds)
      // or if we're near the end of the video (last 30 seconds)
      if (time < 10 || (duration > 0 && time > duration - 30)) return;
      
      console.log(`Saving progress: ${time} seconds for ${tmdbId}`);
      // Progress saving is handled by the parent component through onTimeUpdate
    },
    [tmdbId, clerkId, onTimeUpdate, duration]
  );

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      const newTime = video.currentTime;
      setCurrentTime(newTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      
      // Start periodic progress saving when playing
      if (tmdbId && clerkId && !progressSaveIntervalRef.current) {
        progressSaveIntervalRef.current = setInterval(() => {
          if (video.currentTime > 0) {
            saveProgress(video.currentTime);
          }
        }, 30000); // Save every 30 seconds while playing
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      
      // Save progress when paused
      if (video.currentTime > 0) {
        saveProgress(video.currentTime);
      }
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    
    // Handle beforeunload to save progress when leaving the page
    const handleBeforeUnload = () => {
      if (video.currentTime > 0) {
        saveProgress(video.currentTime);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("volumechange", handleVolumeChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Clear interval when component unmounts
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
      }
      
      // Save progress one last time when unmounting
      if (video.currentTime > 0) {
        saveProgress(video.currentTime);
      }
      
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("volumechange", handleVolumeChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveProgress, tmdbId, clerkId]);

  // Fullscreen handling with mobile optimization
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  // Controls visibility with mobile-specific timeout
  const showControls = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(
      () => {
        setIsControlsVisible(false);
      },
      isMobile ? 4000 : 3000
    ); // Longer timeout on mobile
  }, [isMobile]);

  const hideControls = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setIsControlsVisible(false);
  }, []);

  // Mouse/touch event handlers
  const handleContainerInteraction = useCallback(() => {
    showControls();
  }, [showControls]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(10);
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "Escape":
          if (isFullscreen) {
            exitFullscreen();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  };

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(
      0,
      Math.min(video.currentTime + seconds, duration)
    );
  };

  const handleProgressChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        // On mobile, request fullscreen and try to rotate to landscape
        await container.requestFullscreen();
        if (isMobile && "screen" in window && "orientation" in window.screen) {
          try {
            await (window.screen.orientation as any).lock("landscape");
          } catch (e) {
            // Orientation lock might not be supported or allowed
            console.log("Orientation lock not supported");
          }
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const exitFullscreen = async () => {
    try {
      await document.exitFullscreen();
    } catch (error) {
      console.error("Exit fullscreen error:", error);
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const toggleSubtitles = () => {
    const newState = !isSubtitlesEnabled;
    setIsSubtitlesEnabled(newState);

    const hls = hlsRef.current;
    if (hls) {
      if (newState) {
        // If we have a previously selected subtitle track, restore it
        if (selectedSubtitleTrack && availableSubtitleTracks.length > 0) {
          const track = availableSubtitleTracks.find(
            (t) => t.language === selectedSubtitleTrack
          );
          if (track && track.id !== undefined) {
            hls.subtitleTrack = track.id;
          }
        }
      } else {
        // Disable subtitles by setting to -1 (off)
        hls.subtitleTrack = -1;
      }
    }

    console.log("Subtitles toggled:", newState);
  };

  const toggleZoom = () => {
    if (isMobile) {
      const newScale = isZoomed ? 1 : 1.4;
      setVideoScale(newScale);
      setIsZoomed(!isZoomed);
    }
  };

  const handleAudioTrackSelect = (track: AudioTrack) => {
    const hls = hlsRef.current;
    if (hls && track.id !== undefined) {
      hls.audioTrack = track.id;
      setSelectedAudioTrack(track.language);
      console.log("Selected audio track:", track);
    }
  };

  const handleSubtitleTrackSelect = (track: SubtitleTrack) => {
    const hls = hlsRef.current;
    if (hls && track.id !== undefined) {
      hls.subtitleTrack = track.id;
      setSelectedSubtitleTrack(track.language);
      setIsSubtitlesEnabled(true);
      console.log("Selected subtitle track:", track);
    }
  };

  const handleQualityLevelSelect = (level: number) => {
    const hls = hlsRef.current;
    if (hls) {
      if (level === -1) {
        // Auto quality
        hls.currentLevel = -1;
        setCurrentQualityLevel(-1);
      } else {
        hls.currentLevel = level;
        setCurrentQualityLevel(level);
      }
      console.log("Selected quality level:", level);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black overflow-hidden group",
        isFullscreen
          ? "w-screen h-screen fixed inset-0 z-[9999]"
          : "w-full aspect-video",
        isMobile && !isFullscreen ? "aspect-video" : ""
      )}
      onMouseMove={handleContainerInteraction}
      onMouseLeave={hideControls}
      onTouchStart={handleContainerInteraction}
      onClick={handleContainerInteraction}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className={cn(
          "w-full h-full bg-black transition-all duration-300",
          isMobile && !isFullscreen && !isZoomed
            ? "object-cover"
            : "object-contain",
          isZoomed && isMobile ? "object-cover" : ""
        )}
        style={{
          transform: isMobile && isZoomed ? `scale(${videoScale})` : undefined,
          transformOrigin: "center center",
        }}
        poster={poster}
        playsInline
      />

      {/* Back Button */}
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-4 left-4 z-50 rounded-full bg-black/30 hover:bg-black/50 text-white transition-opacity duration-300",
            isMobile ? "w-12 h-12" : "w-10 h-10",
            isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onBack}
        >
          <ArrowLeft className={cn("h-6 w-6", isMobile ? "h-7 w-7" : "")} />
        </Button>
      )}

      {/* Title */}
      {title && (
        <div
          className={cn(
            "absolute top-4 z-50 transition-opacity duration-300",
            isMobile ? "left-20 right-4" : "left-16",
            isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <h2
            className={cn(
              "text-white font-semibold drop-shadow-lg truncate",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            {title}
          </h2>
        </div>
      )}

      {/* Loading Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            className={cn(
              "border-4 border-gray-300 border-t-red-600 rounded-full animate-spin",
              isMobile ? "w-12 h-12" : "w-16 h-16"
            )}
          ></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 transition-opacity duration-300",
          isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Center Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full bg-white/10 hover:bg-white/20 text-white",
              isMobile ? "w-16 h-16" : "w-20 h-20"
            )}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className={cn("h-8 w-8", isMobile ? "h-6 w-6" : "")} />
            ) : (
              <Play className={cn("h-8 w-8", isMobile ? "h-6 w-6" : "")} />
            )}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-4 space-y-4",
            isMobile ? "pb-safe-area-inset-bottom" : ""
          )}
        >
          {/* Progress Bar */}
          <div className="space-y-2">
            {/* Time Display - Above progress bar */}
            {!(isMobile && isPortrait) && (
              <div className="flex justify-between text-white text-sm px-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            )}

            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleProgressChange}
              className="w-full"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-white hover:bg-white/20",
                  isMobile ? "w-12 h-12" : "w-10 h-10"
                )}
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className={cn("h-5 w-5", isMobile ? "h-6 w-6" : "")} />
                ) : (
                  <Play className={cn("h-5 w-5", isMobile ? "h-6 w-6" : "")} />
                )}
              </Button>

              {/* Skip Back */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-white hover:bg-white/20",
                  isMobile ? "w-12 h-12" : "w-10 h-10"
                )}
                onClick={() => seek(-10)}
              >
                <SkipBack
                  className={cn("h-5 w-5", isMobile ? "h-6 w-6" : "")}
                />
              </Button>

              {/* Skip Forward */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-white hover:bg-white/20",
                  isMobile ? "w-12 h-12" : "w-10 h-10"
                )}
                onClick={() => seek(10)}
              >
                <SkipForward
                  className={cn("h-5 w-5", isMobile ? "h-6 w-6" : "")}
                />
              </Button>

              {/* Volume Control - Hidden on mobile */}
              {!isMobile && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 w-10 h-10"
                    onClick={toggleMute}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  <div className="w-24">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Zoom Control - Mobile only */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 w-12 h-12"
                  onClick={toggleZoom}
                >
                  <div className="relative">
                    <div className="w-5 h-5 border-2 border-white rounded"></div>
                    <div
                      className={cn(
                        "absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full transition-opacity",
                        isZoomed ? "opacity-100" : "opacity-60"
                      )}
                    ></div>
                  </div>
                </Button>
              )}

              {/* Audio Track Selection */}
              {availableAudioTracks.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "text-white hover:bg-white/20",
                        isMobile ? "w-12 h-12" : "w-10 h-10"
                      )}
                    >
                      <Languages
                        className={cn("h-5 w-5", isMobile ? "h-6 w-6" : "")}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-700">
                    <div className="p-2">
                      <h3 className="text-white font-semibold mb-2">
                        Audio Tracks
                      </h3>
                      {availableAudioTracks.map((track, index) => (
                        <DropdownMenuItem
                          key={index}
                          className="text-white hover:bg-white/10"
                          onClick={() => handleAudioTrackSelect(track)}
                        >
                          <div className="flex items-center space-x-2">
                            <span>{track.label}</span>
                            {track.default && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Subtitle Controls */}
              {availableSubtitleTracks.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "text-white hover:bg-white/20",
                        isMobile ? "w-12 h-12" : "w-10 h-10"
                      )}
                    >
                      <Subtitles
                        className={cn("h-5 w-5", isMobile ? "h-6 w-6" : "")}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-700">
                    <div className="p-2">
                      <h3 className="text-white font-semibold mb-2">
                        Subtitles
                      </h3>
                      <DropdownMenuItem
                        className="text-white hover:bg-white/10"
                        onClick={toggleSubtitles}
                      >
                        {isSubtitlesEnabled
                          ? "Hide Subtitles"
                          : "Show Subtitles"}
                      </DropdownMenuItem>
                      {availableSubtitleTracks.map((track, index) => (
                        <DropdownMenuItem
                          key={index}
                          className="text-white hover:bg-white/10"
                          onClick={() => handleSubtitleTrackSelect(track)}
                        >
                          {track.label}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Quality Level Selection */}
              {availableQualityLevels.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "text-white hover:bg-white/20",
                        isMobile ? "w-12 h-12" : "w-10 h-10"
                      )}
                    >
                      <Settings
                        className={cn("h-5 w-5", isMobile ? "h-6 w-6" : "")}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-700">
                    <div className="p-2">
                      <h3 className="text-white font-semibold mb-2">
                        Quality Levels
                      </h3>
                      {availableQualityLevels.map((level, index) => (
                        <DropdownMenuItem
                          key={index}
                          className="text-white hover:bg-white/10"
                          onClick={() => handleQualityLevelSelect(level.level)}
                        >
                          <div className="flex items-center space-x-2">
                            <span>{level.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        className="text-white hover:bg-white/10"
                        onClick={() => handleQualityLevelSelect(-1)}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Auto</span>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-white hover:bg-white/20",
                  isMobile ? "w-12 h-12" : "w-10 h-10"
                )}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize
                    className={cn("h-5 w-5", isMobile ? "h-6 w-6" : "")}
                  />
                ) : (
                  <Maximize
                    className={cn("h-5 w-5", isMobile ? "h-6 w-6" : "")}
                  />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
