export enum AgentType {
  GENERAL = 'GENERAL',
  SUPPORT = 'SUPPORT',
  NEWS = 'NEWS',
  ANALYST = 'ANALYST',
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingUrls?: Array<{ title: string; uri: string }>;
  audioData?: Float32Array; // Decoded audio buffer data
  isError?: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface AgentConfig {
  id: AgentType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface UserProfile {
  ageGroup: string;
  prefecture: string;
  occupation: string;
  interests: string[];
}
