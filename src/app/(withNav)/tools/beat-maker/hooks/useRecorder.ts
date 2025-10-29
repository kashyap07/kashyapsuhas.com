import { useCallback, useRef, useState } from "react";

export interface RecorderControls {
  isRecording: (soundId: string) => boolean;
  startRecording: (soundId: string) => Promise<void>;
  stopRecording: (soundId: string) => Promise<AudioBuffer | null>;
  hasPermission: boolean;
}

export function useRecorder(audioContext: AudioContext | null): RecorderControls {
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async (soundId: string) => {
    try {
      // request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      streamRef.current = stream;
      setHasPermission(true);

      // create media recorder with timeslice for better data capture
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      // use timeslice of 100ms to ensure data is captured
      mediaRecorder.start(100);
      setRecordingId(soundId);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setHasPermission(false);
    }
  }, []);

  const stopRecording = useCallback(async (soundId: string): Promise<AudioBuffer | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;

      if (!mediaRecorder || !audioContext || recordingId !== soundId) {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = async () => {
        setRecordingId(null);

        // stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // convert recorded chunks to audio buffer
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // detect start of actual sound (trim silence from beginning)
          const threshold = 0.02; // noise threshold
          let startSample = 0;

          // check all channels to find first significant sound
          for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
              if (Math.abs(channelData[i]) > threshold) {
                startSample = i;
                break;
              }
            }
            if (startSample > 0) break;
          }

          // at 200 BPM: 1 bar (4 beats) = 1.2 seconds
          // this matches the beat timing and gives enough time for a sound
          const barDuration = 1.2;
          const maxSamples = Math.floor(barDuration * audioBuffer.sampleRate);

          // calculate trimmed buffer length
          const availableSamples = audioBuffer.length - startSample;
          const trimmedLength = Math.min(availableSamples, maxSamples);

          const trimmedBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            trimmedLength,
            audioBuffer.sampleRate
          );

          // copy audio data starting from detected start point
          for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const sourceData = audioBuffer.getChannelData(channel);
            const targetData = trimmedBuffer.getChannelData(channel);
            for (let i = 0; i < trimmedLength; i++) {
              targetData[i] = sourceData[startSample + i];
            }
          }

          resolve(trimmedBuffer);
        } catch (error) {
          console.error("Failed to process recording:", error);
          resolve(null);
        }
      };

      mediaRecorder.stop();
    });
  }, [audioContext, recordingId]);

  const isRecording = useCallback((soundId: string) => {
    return recordingId === soundId;
  }, [recordingId]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    hasPermission,
  };
}
