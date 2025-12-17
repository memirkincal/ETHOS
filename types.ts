
export enum AppIntent {
  ACADEMIC = 'MAKALE',
  CV = 'CV',
  HOMEWORK = 'ODEV',
  REPORT = 'RAPOR',
  CUSTOM = 'CUSTOM',
  NONE = 'NONE'
}

export interface CustomTemplate {
  id: string;
  title: string;
  font: string;
  desc: string;
  icon: string;
}

export interface MetricState {
  aiRisk: number;
  originality: number;
  academicStrength: number;
  repetition: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export type CvTemplate = 'MODERN' | 'KLASIK' | 'MINIMAL' | 'EXECUTIVE' | 'CREATIVE';
