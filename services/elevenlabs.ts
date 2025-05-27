import Constants from 'expo-constants';
import { Audio } from 'expo-av';

const API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const API_URL = 'https://api.elevenlabs.io/v1';

// Initialize audio
Audio.setAudioModeAsync({
  allowsRecordingIOS: true,
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
  shouldDuckAndroid: true,
});

export async function textToSpeech(text: string, voiceId: string = 'default') {
  try {
    const response = await fetch(`${API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to convert text to speech');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: true }
    );

    return sound;
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw error;
  }
}

export async function speechToText(audioUri: string): Promise<string> {
  try {
    const formData = new FormData();
    const response = await fetch(audioUri);
    const blob = await response.blob();
    formData.append('audio', blob, 'audio.wav');

    const response = await fetch(`${API_URL}/speech-to-text`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to convert speech to text');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error converting speech to text:', error);
    throw error;
  }
}