import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Conversation, CallSession } from '@/types/chat';
import { callService } from '@/lib/callService';
import { useAuth } from '@/lib/auth';

interface CallDialogProps {
  conversation: Conversation;
  callType: 'audio' | 'video';
  onClose: () => void;
}

export function CallDialog({ conversation, callType, onClose }: CallDialogProps) {
  const { user } = useAuth();
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    initiateCall();
    
    return () => {
      endCall();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const initiateCall = async () => {
    try {
      // Get user media
      const stream = await callService.getUserMedia(callType);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create call session
      const session = await callService.initiateCall(conversation.id, callType);
      setCallSession(session);

      // Setup peer connection
      callService.createPeerConnection(
        (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setIsConnected(true);
          startDurationTimer();
        },
        (candidate) => {
          // Send ICE candidate to other peer via signaling server
          console.log('ICE candidate:', candidate);
        }
      );

      // Create and send offer
      const offer = await callService.createOffer();
      // Send offer to other peer via signaling server
      console.log('Offer created:', offer);

      toast.success('Calling...');
    } catch (error) {
      console.error('Call error:', error);
      toast.error('Failed to start call');
      onClose();
    }
  };

  const startDurationTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const endCall = async () => {
    try {
      await callService.endCall();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      onClose();
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    callService.toggleAudio(!newMuted);
  };

  const toggleVideo = () => {
    const newVideoOff = !isVideoOff;
    setIsVideoOff(newVideoOff);
    callService.toggleVideo(!newVideoOff);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallTitle = () => {
    if (conversation.type === 'group') {
      return conversation.name || 'Group Call';
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== user?._id
    );
    return otherParticipant?.userName || 'Call';
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px]">
        <DialogHeader>
          <DialogTitle>{getCallTitle()}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative bg-muted rounded-lg overflow-hidden">
          {/* Remote video */}
          {callType === 'video' && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {/* Audio-only placeholder */}
          {callType === 'audio' && (
            <div className="flex flex-col items-center justify-center h-full">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarFallback className="text-4xl">
                  {getCallTitle().slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-semibold mb-2">{getCallTitle()}</h3>
              <p className="text-muted-foreground">
                {isConnected ? formatDuration(callDuration) : 'Calling...'}
              </p>
            </div>
          )}

          {/* Local video (picture-in-picture) */}
          {callType === 'video' && (
            <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Call duration overlay */}
          {isConnected && callType === 'video' && (
            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
              {formatDuration(callDuration)}
            </div>
          )}
        </div>

        {/* Call controls */}
        <div className="flex items-center justify-center gap-4 py-4">
          <Button
            variant={isMuted ? 'destructive' : 'secondary'}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {callType === 'video' && (
            <Button
              variant={isVideoOff ? 'destructive' : 'secondary'}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
          )}

          <Button
            variant="destructive"
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={endCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
