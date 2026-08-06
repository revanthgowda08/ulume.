import { Audio } from "expo-av";
import axios from "axios";

const GOOGLE_SPEECH_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_SPEECH_KEY;

export const startRecording = async () => {
  const { granted } = await Audio.requestPermissionsAsync();
  if (!granted) throw new Error("MICROPHONE_PERMISSION_DENIED");
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();
  return recording;
};

export const stopAndTranscribe = async (recording, languageCode = "kn-IN") => {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  const response = await fetch(uri);
  const blob = await response.blob();
  const reader = new FileReader();
  const audioBase64 = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const apiResponse = await axios.post(
    `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_SPEECH_API_KEY}`,
    {
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 44100,
        languageCode,
        alternativeLanguageCodes: ["hi-IN", "en-IN"],
        model: "latest_long",
        useEnhanced: true,
      },
      audio: { content: audioBase64 },
    }
  );

  const transcript = apiResponse.data.results?.[0]?.alternatives?.[0]?.transcript;
  if (!transcript) throw new Error("NO_SPEECH_DETECTED");
  return transcript;
};
