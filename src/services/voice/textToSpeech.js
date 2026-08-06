import axios from "axios";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";

const GOOGLE_TTS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_TTS_KEY;
const CACHE_DIR = `${FileSystem.cacheDirectory}ulume-audio/`;

const ensureCacheDir = async () => {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
};

const synthesizeKannada = async (text) => {
  const response = await axios.post(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
    {
      input: { text },
      voice: { languageCode: "kn-IN", ssmlGender: "FEMALE" },
      audioConfig: { audioEncoding: "MP3" },
    }
  );
  return response.data.audioContent; // base64
};

// Downloads (or reuses a cached) MP3 for a piece of Kannada text and returns a local file URI.
// Audio is never autoplayed — callers only invoke this in response to a user tapping 🔊.
export const getOrCreateAudioForText = async (cacheKey, text) => {
  await ensureCacheDir();
  const filePath = `${CACHE_DIR}${cacheKey}.mp3`;
  const info = await FileSystem.getInfoAsync(filePath);
  if (info.exists) return filePath;

  const audioBase64 = await synthesizeKannada(text);
  await FileSystem.writeAsStringAsync(filePath, audioBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return filePath;
};

export const playAudioFile = async (uri) => {
  const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.didJustFinish) sound.unloadAsync();
  });
  return sound;
};
