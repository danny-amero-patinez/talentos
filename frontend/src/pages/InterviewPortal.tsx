import { useState } from 'react';
import { useInterviewSession } from '../store/useInterviewSession';
import { Send, AlertTriangle } from 'lucide-react';

export function InterviewPortal() {
  const { 
    candidateName, candidateRole, setCandidateInfo, 
    messages, sendMessage, isLoading, securityViolation, 
    finishInterview, evaluation 
  } = useInterviewSession();

  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [textInput, setTextInput] = useState('');

  if (securityViolation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-200 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Session Terminated</h2>
          <p className="text-slate-600">The session was terminated due to unexpected input. Please contact HR.</p>
        </div>
      </div>
    );
  }

  if (!candidateName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md w-full">
          <h1 className="text-2xl font-bold text-brand-slate mb-6">Welcome to TalentOS</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                value={nameInput} onChange={e => setNameInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role Applied For</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                value={roleInput} onChange={e => setRoleInput(e.target.value)}
              />
            </div>
            <button 
              className="w-full bg-brand-blue text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              onClick={() => { if(nameInput && roleInput) setCandidateInfo(nameInput, roleInput) }}
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md">
          <h2 className="text-2xl font-bold text-brand-slate mb-2">Interview Completed</h2>
          <p className="text-slate-600">Thank you for your time, {candidateName}. Our HR team will review your results.</p>
          <a href="/dashboard" className="text-brand-blue text-sm mt-4 inline-block underline">Ir al Dashboard (Demo)</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-light">
      <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm">
        <div className="font-bold text-brand-slate text-lg">TalentOS</div>
        <button 
          onClick={finishInterview}
          disabled={isLoading || messages.length === 0}
          className="bg-brand-slate text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          Finish Interview
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl w-full mx-auto">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-10">Send a message to start the interview.</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-4 ${m.role === 'user' ? 'bg-brand-blue text-white rounded-br-none' : 'bg-white border border-slate-200 text-brand-slate rounded-bl-none shadow-sm'}`}>
              <div className="whitespace-pre-wrap text-sm">{m.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 text-slate-400 rounded-xl rounded-bl-none p-4 shadow-sm text-sm">
              <span className="animate-pulse">Agent is typing...</span>
            </div>
          </div>
        )}
      </main>

      <div className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input 
            type="text"
            className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-blue"
            placeholder="Type your answer..."
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            disabled={isLoading}
            onKeyDown={e => { if(e.key === 'Enter' && textInput) { sendMessage(textInput); setTextInput(''); } }}
          />
          <button 
            disabled={isLoading || !textInput}
            className="bg-brand-blue text-white p-3 rounded-lg disabled:opacity-50"
            onClick={() => { sendMessage(textInput); setTextInput(''); }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
