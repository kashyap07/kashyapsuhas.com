"use client";

import { useCallback, useEffect, useState } from "react";

import { Wrapper } from "@components/ui";

import { Display } from "./components/Display";
import { Grid } from "./components/Grid";
import { SoundList } from "./components/SoundList";
import { useAudioEngine } from "./hooks/useAudioEngine";
import { useRecorder } from "./hooks/useRecorder";
import { useSequencer } from "./hooks/useSequencer";

// reduced to 9 core sounds
const SOUND_TYPES = [
  { id: "kick", label: "Kick" },
  { id: "snare", label: "Snare" },
  { id: "hihat", label: "Hi-Hat" },
  { id: "clap", label: "Clap" },
  { id: "bass1", label: "Bass" },
  { id: "pluck", label: "Pluck" },
  { id: "vocal1", label: "Vocal" },
  { id: "fx1", label: "FX" },
  { id: "sweep", label: "Sweep" },
];

const NUM_BEATS = 16; // 4 bars at 4/4 time

export default function BeatMaker() {
  // audio engine
  const {
    playSound,
    setPitch,
    setFilterCutoff,
    setReverbMix,
    setDrive,
    setCustomBuffer,
    clearCustomBuffer,
    audioContext,
    isLoaded,
  } = useAudioEngine();

  // recorder
  const recorder = useRecorder(audioContext);

  // sequencer
  const sequencer = useSequencer(NUM_BEATS, playSound);

  // control values
  const [filter, setFilterState] = useState(1);
  const [reverb, setReverbState] = useState(0);
  const [pitch, setPitchState] = useState(0);
  const [drive, setDriveState] = useState(0);

  // recording state
  const [customRecordings, setCustomRecordings] = useState<
    Record<string, boolean>
  >({});
  const [recordingsLoaded, setRecordingsLoaded] = useState(false);

  // pattern text - automatically updates
  const [patternText, setPatternText] = useState("");

  // load saved recordings from localStorage on mount
  useEffect(() => {
    if (!audioContext || recordingsLoaded) return;

    const loadRecordings = async () => {
      try {
        const saved = localStorage.getItem("beatmaker-recordings");
        if (!saved) {
          setRecordingsLoaded(true);
          return;
        }

        const recordings = JSON.parse(saved) as Record<
          string,
          {
            channels: number;
            sampleRate: number;
            length: number;
            data: number[][];
          }
        >;

        for (const [soundId, bufferData] of Object.entries(recordings)) {
          const buffer = audioContext.createBuffer(
            bufferData.channels,
            bufferData.length,
            bufferData.sampleRate,
          );

          for (let channel = 0; channel < bufferData.channels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < bufferData.length; i++) {
              channelData[i] = bufferData.data[channel][i];
            }
          }

          setCustomBuffer(soundId, buffer);
          setCustomRecordings((prev) => ({ ...prev, [soundId]: true }));
        }

        setRecordingsLoaded(true);
      } catch (error) {
        console.error("Failed to load recordings:", error);
        setRecordingsLoaded(true);
      }
    };

    loadRecordings();
  }, [audioContext, recordingsLoaded, setCustomBuffer]);

  // auto-export: update pattern text whenever pattern changes
  useEffect(() => {
    const exported = sequencer.exportPattern();
    setPatternText(exported);
  }, [sequencer.pattern, sequencer]);

  // handle control changes
  const handleFilterChange = (value: number) => {
    setFilterState(value);
    setFilterCutoff(value);
  };

  const handleReverbChange = (value: number) => {
    setReverbState(value);
    setReverbMix(value);
  };

  const handlePitchChange = (value: number) => {
    setPitchState(value);
    setPitch(value);
  };

  const handleDriveChange = (value: number) => {
    setDriveState(value);
    setDrive(value);
  };

  // save recordings to localStorage
  const saveRecordingsToStorage = useCallback(
    (soundId: string, buffer: AudioBuffer | null) => {
      try {
        const saved = localStorage.getItem("beatmaker-recordings");
        const recordings = saved ? JSON.parse(saved) : {};

        if (buffer) {
          // serialize buffer
          const data: number[][] = [];
          for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            data.push(Array.from(buffer.getChannelData(channel)));
          }

          recordings[soundId] = {
            channels: buffer.numberOfChannels,
            sampleRate: buffer.sampleRate,
            length: buffer.length,
            data,
          };
        } else {
          // remove recording
          delete recordings[soundId];
        }

        localStorage.setItem(
          "beatmaker-recordings",
          JSON.stringify(recordings),
        );
      } catch (error) {
        console.error("Failed to save recordings:", error);
      }
    },
    [],
  );

  // recording handlers
  const handleRecord = async (soundId: string) => {
    const isCurrentlyRecording = recorder.isRecording(soundId);

    if (isCurrentlyRecording) {
      // stop recording
      const buffer = await recorder.stopRecording(soundId);
      if (buffer) {
        setCustomBuffer(soundId, buffer);
        setCustomRecordings((prev) => ({ ...prev, [soundId]: true }));
        saveRecordingsToStorage(soundId, buffer);
      }
    } else {
      // start recording
      await recorder.startRecording(soundId);
    }
  };

  const handleClearRecording = (soundId: string) => {
    clearCustomBuffer(soundId);
    setCustomRecordings((prev) => {
      const newRecordings = { ...prev };
      delete newRecordings[soundId];
      return newRecordings;
    });
    saveRecordingsToStorage(soundId, null);
  };

  // import pattern from text
  const handleImport = () => {
    sequencer.importPattern(patternText);
  };

  return (
    <Wrapper className="mb-12 w-full md:mb-20">
      <h1 className="mb-2 text-5xl font-medium md:text-8xl">Beat Maker</h1>
      <p className="mb-8 text-xl text-gray-500">
        click cells to add sounds - fixed at 200 bpm
      </p>

      {!isLoaded && (
        <div className="mb-4 rounded-lg border-2 border-orange-300 bg-orange-50 p-4 text-center text-orange-700">
          loading sounds...
        </div>
      )}

      {/* transport controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <button
          onClick={sequencer.togglePlayback}
          className={
            sequencer.isPlaying
              ? "flex items-center gap-2 rounded-lg border-2 border-orange-500 bg-orange-500 px-6 py-3 font-medium text-white transition-all hover:bg-orange-600"
              : "flex items-center gap-2 rounded-lg border-2 border-green-500 bg-green-500 px-6 py-3 font-medium text-white transition-all hover:bg-green-600"
          }
        >
          {sequencer.isPlaying ? (
            <>
              <div className="flex gap-1">
                <div className="h-4 w-1.5 bg-white" />
                <div className="h-4 w-1.5 bg-white" />
              </div>
              Pause
            </>
          ) : (
            <>
              <div className="h-0 w-0 border-y-[8px] border-l-[12px] border-r-0 border-solid border-y-transparent border-l-white" />
              Play
            </>
          )}
        </button>

        <button
          onClick={sequencer.clearPattern}
          className="rounded-lg border-2 border-gray-400 bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-200"
        >
          Clear
        </button>
      </div>

      {/* display with knobs */}
      <div className="mb-6">
        <Display
          bpm={200}
          isRecording={false}
          isPlaying={sequencer.isPlaying}
          currentBeat={sequencer.currentBeat}
          filter={filter}
          reverb={reverb}
          pitch={pitch}
          drive={drive}
          onFilterChange={handleFilterChange}
          onReverbChange={handleReverbChange}
          onPitchChange={handlePitchChange}
          onDriveChange={handleDriveChange}
        />
      </div>

      {/* sound list with recording controls */}
      <SoundList
        soundTypes={SOUND_TYPES}
        isRecording={recorder.isRecording}
        customRecordings={customRecordings}
        onRecord={handleRecord}
        onClear={handleClearRecording}
      />

      {/* main grid */}
      <div className="mb-6">
        <Grid
          soundTypes={SOUND_TYPES}
          numBeats={NUM_BEATS}
          pattern={sequencer.pattern}
          onToggleCell={sequencer.toggleCell}
          isPlaying={sequencer.isPlaying}
          currentBeat={sequencer.currentBeat}
        />
      </div>

      {/* pattern code - auto updates */}
      <div className="mb-6 rounded-lg border-2 border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
          Pattern Code
        </h3>
        <div className="flex flex-col gap-3">
          <textarea
            value={patternText}
            onChange={(e) => setPatternText(e.target.value)}
            placeholder="pattern appears here automatically - edit and import to load"
            className="h-32 w-full rounded border-2 border-gray-300 p-3 font-mono text-sm focus:border-columbiaYellow focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="rounded-lg border-2 border-purple-500 bg-purple-50 px-4 py-2 font-medium text-purple-600 transition-all hover:bg-purple-500 hover:text-white"
            >
              Import Pattern
            </button>
          </div>
          <p className="text-xs text-gray-500">
            pattern updates automatically - copy to save, edit and import to
            load
          </p>
        </div>
      </div>

      {/* instructions */}
      <div className="mt-6 rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
          How to use
        </h3>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• Click grid cells to add or remove sounds</li>
          <li>• Each column is one beat (16 beats = 4 bars at 200 BPM)</li>
          <li>• Press Play to hear your pattern loop</li>
          <li>• Pattern code updates automatically as you edit</li>
          <li>• Adjust knobs in the display to modify sound</li>
        </ul>
      </div>
    </Wrapper>
  );
}
