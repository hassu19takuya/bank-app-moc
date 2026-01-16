
import { AgentType, UserProfile } from '../types';
import { decodeAudioData } from './audioUtils';

// Use environment variable for backend URL, fallback to localhost for development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export interface AgentResponse {
  text: string;
  groundingUrls?: { title: string; uri: string }[];
  audioBase64?: string;
  chartData?: { category: string; amount: number }[];
  audioBuffer?: AudioBuffer;
}

export const generateAgentResponse = async (
  agentType: AgentType,
  userMessage: string,
  history: { role: string; parts: string[] }[],
  userProfile?: UserProfile
): Promise<AgentResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        agentType: agentType,
        history: history,
        userProfile: userProfile
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status} `);
    }

    const data = await response.json();
    console.log("API Response:", data); // Debug log

    let audioBuffer: AudioBuffer | undefined;
    if (data.audioBase64) {
      audioBuffer = await decodeAudioData(data.audioBase64);
    }

    return {
      text: data.text,
      groundingUrls: data.groundingUrls,
      audioBase64: data.audioBase64,
      chartData: data.chartData, // Ensure backend sends this key
      audioBuffer: audioBuffer
    };
  } catch (error) {
    console.error('Error generating response:', error);
    return {
      text: "申し訳ありません。システムエラーが発生しました。",
    };
  }
};
