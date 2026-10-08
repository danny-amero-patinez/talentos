import { create } from 'zustand';
import axios from 'axios';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewState {
  candidateName: string;
  candidateRole: string;
  messages: Message[];
  isLoading: boolean;
  securityViolation: boolean;
  evaluation: any | null;
  
  setCandidateInfo: (name: string, role: string) => void;
  sendMessage: (text: string) => Promise<void>;
  finishInterview: () => Promise<void>;
  resetSession: () => void;
}

// Apunta al backend local
const api = axios.create({ baseURL: 'http://localhost:3000/api' });

export const useInterviewSession = create<InterviewState>((set, get) => ({
  candidateName: '',
  candidateRole: '',
  messages: [],
  isLoading: false,
  securityViolation: false,
  evaluation: null,

  setCandidateInfo: (name, role) => set({ candidateName: name, candidateRole: role }),

  sendMessage: async (text: string) => {
    const { messages } = get();
    const newMessages = [...messages, { role: 'user', content: text } as Message];
    
    set({ messages: newMessages, isLoading: true });

    try {
      const response = await api.post('/chat/chat-turn', { messages: newMessages });
      set({ 
        messages: [...newMessages, { role: 'assistant', content: response.data.reply }],
        isLoading: false 
      });
    } catch (error: any) {
      if (error.response?.status === 403) {
        set({ securityViolation: true, isLoading: false });
      } else {
        console.error("Chat error:", error);
        set({ isLoading: false });
      }
    }
  },

  finishInterview: async () => {
    set({ isLoading: true });
    try {
      const transcript = get().messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
      const response = await api.post('/evaluation/finish', { transcript });
      set({ evaluation: response.data.evaluation, isLoading: false });
    } catch (error: any) {
      if (error.response?.status === 403) {
        set({ securityViolation: true, isLoading: false });
      } else {
        console.error("Evaluation error:", error);
        set({ isLoading: false });
      }
    }
  },

  resetSession: () => set({ 
    candidateName: '', 
    candidateRole: '', 
    messages: [], 
    securityViolation: false, 
    evaluation: null,
    isLoading: false
  })
}));
