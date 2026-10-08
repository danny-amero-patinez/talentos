import { useInterviewSession } from '../store/useInterviewSession';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { evaluation, candidateName, candidateRole } = useInterviewSession();

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-brand-light p-8 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-lg">
          <h1 className="text-2xl font-bold text-brand-slate mb-4">HR Dashboard</h1>
          <p className="text-slate-600 mb-4">No completed interviews yet. Finish an interview in the portal to see the results here.</p>
          <a href="/interview" className="text-brand-blue underline">Go to Interview Portal</a>
        </div>
      </div>
    );
  }

  const chartData = [
    { subject: 'Communication', A: evaluation.quantitative_scores.communication, fullMark: 100 },
    { subject: 'Technical Depth', A: evaluation.quantitative_scores.technical_depth, fullMark: 100 },
    { subject: 'Problem Solving', A: evaluation.quantitative_scores.problem_solving, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-brand-light flex">
      <aside className="w-64 bg-brand-slate text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-8">TalentOS HR</h2>
        <nav className="space-y-4 text-sm font-medium text-slate-300">
          <div className="text-white bg-slate-800 p-2 rounded cursor-pointer">Candidates</div>
          <div className="hover:text-white cursor-pointer p-2">Settings</div>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-brand-slate mb-6">Candidate Profile</h1>
        
        {evaluation.security_analysis.prompt_injection_attempted && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg font-bold flex flex-col">
            <span>⚠️ SECURITY ALERT: Prompt Injection Attempt Detected</span>
            {evaluation.security_analysis.suspicious_behavior_notes && (
              <span className="font-normal text-sm mt-1">{evaluation.security_analysis.suspicious_behavior_notes}</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">{candidateName || 'Unknown Candidate'}</h2>
              <p className="text-slate-500 mb-4">{candidateRole || 'Software Engineer'}</p>
              <div className="mb-4">
                <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                  evaluation.final_recommendation === 'STRONG_HIRE' ? 'bg-green-100 text-green-800' :
                  evaluation.final_recommendation === 'HIRE' ? 'bg-blue-100 text-blue-800' :
                  evaluation.final_recommendation === 'NO_HIRE' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {evaluation.final_recommendation.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-semibold text-slate-700 mb-2">Executive Summary</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{evaluation.qualitative_analysis.executive_summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-3">Key Strengths</h3>
                <ul className="space-y-2">
                  {evaluation.qualitative_analysis.key_strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-md border border-green-100">{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-3">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {evaluation.qualitative_analysis.areas_for_improvement.map((s: string, i: number) => (
                    <li key={i} className="text-sm bg-orange-50 text-orange-700 px-3 py-1 rounded-md border border-orange-100">{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
            <h3 className="font-semibold text-slate-700 mb-4 self-start">Performance Radar</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 w-full space-y-3">
              <button className="w-full bg-brand-slate text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
                Approve & Generate Offer
              </button>
              <button className="w-full bg-white border border-slate-300 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
                Reject Candidate
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
