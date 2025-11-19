import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music,
  List,
  X,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AudioLesson {
  _id: string;
  title: string;
  description?: string;
  audioUrl: string;
  coverArt?: string;
  user_name?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  created_at: string;
}

export default function AudioPlayer() {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [playlist, setPlaylist] = useState<AudioLesson[]>([]);
  const [currentTrack, setCurrentTrack] = useState<AudioLesson | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEQ, setShowEQ] = useState(false);

  // EQ state
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [eqPreset, setEqPreset] = useState('flat');
  const [eqBands, setEqBands] = useState({
    bass: 0,
    lowMid: 0,
    mid: 0,
    highMid: 0,
    treble: 0,
  });

  // Visualizer state
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(64).fill(0));
  const [coverColors, setCoverColors] = useState({
    primary: '#ec4899',
    secondary: '#8b5cf6',
  });

  // Touch gesture state
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  useEffect(() => {
    fetchAudioLessons();
    
    // Show swipe hint on first visit (mobile only)
    const hasSeenHint = localStorage.getItem('audio_player_swipe_hint_seen');
    if (!hasSeenHint && window.innerWidth < 1024) {
      setTimeout(() => {
        setShowSwipeHint(true);
        setTimeout(() => {
          setShowSwipeHint(false);
          localStorage.setItem('audio_player_swipe_hint_seen', 'true');
        }, 4000);
      }, 1000);
    }
  }, []);

  // Update visualizer
  const updateVisualizer = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    setVisualizerData(Array.from(dataArray));
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  }, []);

  // Initialize Web Audio API for EQ
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || audioContextRef.current) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaElementSource(audio);

      // Create 5-band EQ
      const frequencies = [60, 250, 1000, 4000, 8000];
      const filters = frequencies.map((freq) => {
        const filter = audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;
        return filter;
      });

      // Create analyser for visualizer
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;

      // Connect filters in series
      source.connect(filters[0]);
      for (let i = 0; i < filters.length - 1; i++) {
        filters[i].connect(filters[i + 1]);
      }
      filters[filters.length - 1].connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      sourceNodeRef.current = source;
      filtersRef.current = filters;
      analyserRef.current = analyser;

      // Start visualizer animation (will be called in separate effect)
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Extract colors from cover art
  useEffect(() => {
    if (!currentTrack?.coverArt) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = currentTrack.coverArt;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Sample colors from the image
        const colors: { r: number; g: number; b: number; count: number }[] = [];
        const step = 10;
        
        for (let i = 0; i < data.length; i += step * 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          if (a > 128) { // Only consider non-transparent pixels
            colors.push({ r, g, b, count: 1 });
          }
        }

        // Find dominant colors
        if (colors.length > 0) {
          colors.sort((a, b) => {
            const aLum = 0.299 * a.r + 0.587 * a.g + 0.114 * a.b;
            const bLum = 0.299 * b.r + 0.587 * b.g + 0.114 * b.b;
            return bLum - aLum;
          });

          const primary = colors[Math.floor(colors.length * 0.3)];
          const secondary = colors[Math.floor(colors.length * 0.7)];

          setCoverColors({
            primary: `rgb(${primary.r}, ${primary.g}, ${primary.b})`,
            secondary: `rgb(${secondary.r}, ${secondary.g}, ${secondary.b})`,
          });
        }
      } catch (error) {
        console.error('Error extracting colors:', error);
      }
    };
  }, [currentTrack?.coverArt]);

  // Start visualizer when analyser is ready
  useEffect(() => {
    if (analyserRef.current && isPlaying) {
      updateVisualizer();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updateVisualizer]);

  // Handle swipe gestures for main area
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 80;

    // Swipe left from right edge to open queue
    if (
      !showPlaylist &&
      touchStartX.current > window.innerWidth - 80 &&
      swipeDistance < -minSwipeDistance
    ) {
      setShowPlaylist(true);
    }
  };

  // Handle swipe gestures for queue sidebar
  const handleQueueTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleQueueTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleQueueTouchEnd = () => {
    const swipeDistance = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 80;

    // Swipe right to close queue
    if (showPlaylist && swipeDistance > minSwipeDistance) {
      setShowPlaylist(false);
    }
  };

  // Handle audio ID from navigation state
  useEffect(() => {
    const state = location.state as { audioId?: string } | null;
    if (state?.audioId && playlist.length > 0) {
      const index = playlist.findIndex((track) => track._id === state.audioId);
      if (index !== -1) {
        setCurrentIndex(index);
        setCurrentTrack(playlist[index]);
        setIsPlaying(true);
      }
    }
  }, [location.state, playlist]);

  const handleNext = useCallback(() => {
    if (playlist.length === 0) return;

    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    setCurrentIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  }, [playlist, currentIndex, isShuffle]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat, handleNext]);

  const fetchAudioLessons = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/audio`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch audio');

      const data = await response.json();
      setPlaylist(data);
      if (data.length > 0) {
        setCurrentTrack(data[0]);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching audio:', error);
      toast.error('Failed to load audio lessons');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      audioRef.current!.currentTime = 0;
    } else {
      const prevIndex =
        currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(playlist[prevIndex]);
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectTrack = (track: AudioLesson, index: number) => {
    setCurrentTrack(track);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  // EQ Presets
  const eqPresets = {
    flat: { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0 },
    bass_boost: { bass: 6, lowMid: 3, mid: 0, highMid: 0, treble: 0 },
    treble_boost: { bass: 0, lowMid: 0, mid: 0, highMid: 3, treble: 6 },
    vocal: { bass: -2, lowMid: -1, mid: 3, highMid: 4, treble: 2 },
    rock: { bass: 5, lowMid: 2, mid: -1, highMid: 2, treble: 4 },
    pop: { bass: 3, lowMid: 1, mid: 0, highMid: 2, treble: 3 },
    classical: { bass: 2, lowMid: 1, mid: 0, highMid: 1, treble: 3 },
    jazz: { bass: 3, lowMid: 2, mid: -1, highMid: 1, treble: 3 },
  };

  const applyEQPreset = (preset: string) => {
    setEqPreset(preset);
    const values = eqPresets[preset as keyof typeof eqPresets];
    setEqBands(values);
    updateEQFilters(values);
  };

  const updateEQFilters = (bands: typeof eqBands) => {
    if (filtersRef.current.length === 0) return;

    const bandValues = [
      bands.bass,
      bands.lowMid,
      bands.mid,
      bands.highMid,
      bands.treble,
    ];
    filtersRef.current.forEach((filter, index) => {
      filter.gain.value = bandValues[index];
    });
  };

  const handleEQChange = (band: keyof typeof eqBands, value: number) => {
    const newBands = { ...eqBands, [band]: value };
    setEqBands(newBands);
    setEqPreset('custom');
    updateEQFilters(newBands);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div 
        className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${coverColors.primary}15 0%, ${coverColors.secondary}15 100%)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Enhanced Animated Background Visualizer */}
        <div className="absolute inset-0 opacity-60 pointer-events-none">
          <div className="h-full flex items-end justify-center gap-0.5 md:gap-1">
            {visualizerData.slice(0, 64).map((value, index) => (
              <div
                key={index}
                className="flex-1 rounded-t-sm transition-all duration-100"
                style={{
                  height: `${Math.max((value / 255) * 100, 2)}%`,
                  background: `linear-gradient(to top, ${coverColors.primary}dd, ${coverColors.secondary}dd)`,
                  boxShadow: `0 0 10px ${coverColors.primary}66`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex relative z-10 overflow-hidden">
          {/* Center: Now Playing Info & Cover Art */}
          <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 overflow-y-auto">
            <div className="w-full max-w-lg space-y-4 md:space-y-6">
              {/* Cover Art */}
              <div className="w-full aspect-square max-w-[280px] md:max-w-sm mx-auto">
                <div 
                  className="w-full h-full rounded-lg shadow-2xl p-3 md:p-4 flex items-center justify-center backdrop-blur-sm"
                  style={{
                    background: `linear-gradient(135deg, ${coverColors.primary}25, ${coverColors.secondary}25)`,
                    boxShadow: `0 8px 32px ${coverColors.primary}40`,
                  }}
                >
                  {currentTrack?.coverArt ? (
                    <img
                      src={currentTrack.coverArt}
                      alt={currentTrack.title}
                      className="w-full h-full object-contain rounded"
                    />
                  ) : (
                    <Music className="h-20 w-20 md:h-32 md:w-32 text-primary/50" />
                  )}
                </div>
              </div>

              {/* Track Info */}
              <div className="text-center space-y-1 px-4">
                <h1 className="text-lg md:text-2xl lg:text-3xl font-bold truncate">
                  {currentTrack?.title || 'No track selected'}
                </h1>
                <p className="text-xs md:text-base text-muted-foreground truncate">
                  {currentTrack?.user_name || 'Unknown Artist'}
                </p>
              </div>
            </div>
          </div>

        {/* Right Sidebar: Queue (Off by default, swipe from right to open) */}
        <div
          className={cn(
            'fixed lg:relative top-0 right-0 h-full border-l bg-card/95 backdrop-blur-lg transition-transform duration-300 z-40 shadow-2xl',
            showPlaylist ? 'translate-x-0 w-80 md:w-96' : 'translate-x-full lg:translate-x-0 w-80 md:w-96 lg:w-0'
          )}
          onTouchStart={handleQueueTouchStart}
          onTouchMove={handleQueueTouchMove}
          onTouchEnd={handleQueueTouchEnd}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-card/50">
              <h2 className="font-semibold flex items-center gap-2">
                <List className="h-5 w-5" />
                Queue ({playlist.length})
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPlaylist(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {playlist.map((track, index) => (
                <button
                  key={track._id}
                  onClick={() => selectTrack(track, index)}
                  className={cn(
                    'w-full p-3 text-left hover:bg-muted/50 transition-colors border-b',
                    currentIndex === index && 'bg-primary/10'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {track.coverArt ? (
                      <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={track.coverArt}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'h-10 w-10 rounded flex items-center justify-center flex-shrink-0',
                          currentIndex === index
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <Music className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {track.user_name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Backdrop for mobile queue */}
        {showPlaylist && (
          <div
            className="fixed inset-0 bg-black/50 z-35 lg:hidden"
            onClick={() => setShowPlaylist(false)}
          />
        )}

        {/* Swipe Hint Notification */}
        {showSwipeHint && (
          <div className="fixed top-20 right-4 z-60 lg:hidden animate-in slide-in-from-right duration-300">
            <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-xs">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-sm font-medium">Swipe from right edge to open queue</p>
            </div>
          </div>
        )}
        </div>

        {/* Bottom: Spotify-Style Player Controls */}
        <div className="border-t bg-card/95 backdrop-blur-lg relative z-30">
          <div className="px-3 md:px-4 py-2 md:py-3 space-y-2">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-8 md:w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1 cursor-pointer"
              />
              <span className="text-xs text-muted-foreground w-8 md:w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Controls Row - Reordered: EQ → Queue | Shuffle → Previous → Play/Pause → Next → Repeat → | → Volume → Volume Slider */}
            <div className="flex items-center justify-center gap-2 md:gap-3">
              {/* EQ */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-9 md:w-9"
                onClick={() => setShowEQ(!showEQ)}
              >
                <Sliders
                  className={cn('h-4 w-4', showEQ && 'text-primary')}
                />
              </Button>

              {/* Queue */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-9 md:w-9"
                onClick={() => setShowPlaylist(!showPlaylist)}
              >
                <List className="h-4 w-4" />
              </Button>

              {/* Divider */}
              <div className="h-6 w-px bg-border mx-1" />

              {/* Shuffle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-9 md:w-9"
                onClick={() => setIsShuffle(!isShuffle)}
              >
                <Shuffle
                  className={cn('h-4 w-4', isShuffle && 'text-primary')}
                />
              </Button>

              {/* Previous */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-9 md:w-9"
                onClick={handlePrevious}
                disabled={playlist.length === 0}
              >
                <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
              </Button>

              {/* Play/Pause */}
              <Button
                size="icon"
                className="h-10 w-10 md:h-12 md:w-12 rounded-full"
                onClick={togglePlay}
                disabled={!currentTrack}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <Play className="h-5 w-5 md:h-6 md:w-6 ml-0.5" />
                )}
              </Button>

              {/* Next */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-9 md:w-9"
                onClick={handleNext}
                disabled={playlist.length === 0}
              >
                <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
              </Button>

              {/* Repeat */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-9 md:w-9"
                onClick={() => setIsRepeat(!isRepeat)}
              >
                <Repeat
                  className={cn('h-4 w-4', isRepeat && 'text-primary')}
                />
              </Button>

              {/* Divider */}
              <div className="h-6 w-px bg-border mx-1" />

              {/* Volume */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-9 md:w-9"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-16 md:w-24 hidden sm:block"
              />
            </div>
          </div>
        </div>

        {/* EQ Modal */}
        {showEQ && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setShowEQ(false)}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div
                className="bg-card border rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Sliders className="h-5 w-5" />
                    Equalizer
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEQ(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* EQ Presets */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Presets</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(eqPresets).map((preset) => (
                        <Button
                          key={preset}
                          variant={eqPreset === preset ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => applyEQPreset(preset)}
                          className="text-xs"
                        >
                          {preset.replace('_', ' ').toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* EQ Sliders */}
                  <div>
                    <h3 className="text-sm font-medium mb-4">Custom Adjustment</h3>
                    <div className="grid grid-cols-5 gap-4 md:gap-6">
                      {[
                        { key: 'bass', label: 'Bass', freq: '60Hz' },
                        { key: 'lowMid', label: 'Low Mid', freq: '250Hz' },
                        { key: 'mid', label: 'Mid', freq: '1kHz' },
                        { key: 'highMid', label: 'High Mid', freq: '4kHz' },
                        { key: 'treble', label: 'Treble', freq: '8kHz' },
                      ].map(({ key, label, freq }) => (
                        <div key={key} className="flex flex-col items-center gap-3">
                          <div className="h-32 md:h-40 flex items-center">
                            <Slider
                              value={[eqBands[key as keyof typeof eqBands]]}
                              min={-12}
                              max={12}
                              step={1}
                              onValueChange={(value) =>
                                handleEQChange(key as keyof typeof eqBands, value[0])
                              }
                              orientation="vertical"
                              className="h-full"
                            />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-xs font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">{freq}</p>
                            <p className="text-xs font-mono font-semibold">
                              {eqBands[key as keyof typeof eqBands] > 0 ? '+' : ''}
                              {eqBands[key as keyof typeof eqBands]}dB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      onClick={() => applyEQPreset('flat')}
                    >
                      Reset to Flat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hidden Audio Element */}
        {currentTrack && (
          <audio
            ref={audioRef}
            src={currentTrack.audioUrl}
            autoPlay={isPlaying}
            onError={(e) => {
              console.error('Audio error:', e);
              toast.error('Failed to load audio file');
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
