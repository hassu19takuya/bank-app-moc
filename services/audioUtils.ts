// Decodes base64 string to Uint8Array
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes PCM data to AudioBuffer
export async function decodeAudioData(
  base64String: string,
  sampleRate: number = 24000
): Promise<AudioBuffer> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate
  });

  const bytes = decode(base64String);
  const dataInt16 = new Int16Array(bytes.buffer);
  
  // Gemini TTS usually returns mono audio
  const numChannels = 1; 
  const frameCount = dataInt16.length;
  
  const buffer = audioContext.createBuffer(numChannels, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    // Convert 16-bit PCM to float [-1.0, 1.0]
    channelData[i] = dataInt16[i] / 32768.0;
  }

  return buffer;
}

// Helper to play an AudioBuffer
export function playAudioBuffer(buffer: AudioBuffer) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
}
