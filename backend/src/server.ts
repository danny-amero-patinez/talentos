import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getNextQuestion, evaluateInterview } from './services/ai.service';
import { z } from 'zod';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TalentOS Backend is running' });
});

// Endpoint 1: Turno de Chat
app.post('/api/chat/chat-turn', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid or missing messages array' });
    }

    const reply = await getNextQuestion(messages);
    res.json({ reply });
  } catch (error: any) {
    console.error('Error in chat-turn:', error.message);
    res.status(500).json({ error: 'Internal server error while processing chat turn' });
  }
});

// Endpoint 2: Evaluación Final
app.post('/api/evaluation/finish', async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const evaluation = await evaluateInterview(transcript);
    
    // Regla de Seguridad estricta (Tripping del Brief)
    if (evaluation.security_analysis.prompt_injection_attempted) {
      return res.status(403).json({ 
        error: 'security_violation', 
        message: 'Prompt injection attempted. Transaction halted.'
      });
    }

    res.json({ evaluation });
  } catch (error: any) {
    console.error('Error in evaluation:', error);
    
    // Si el JSON no cumple con el esquema de Zod
    if (error instanceof z.ZodError) {
      return res.status(500).json({ error: 'AI returned invalid schema', details: error.errors });
    }
    
    // Si el texto regresado por el AI ni siquiera es JSON (texto plano = posible inyección según brief)
    if (error instanceof SyntaxError) {
      return res.status(403).json({ 
        error: 'security_violation', 
        message: 'Invalid AI response format (Possible prompt injection)'
      });
    }

    res.status(500).json({ error: 'Internal server error during evaluation' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 TalentOS Backend is running on port ${PORT}`);
});
