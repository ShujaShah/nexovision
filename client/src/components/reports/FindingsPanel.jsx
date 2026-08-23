import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

const FindingsPanel = ({ report }) => {
  if (!report || !report.structuredFindings) return null;

  const { impression, findings, recommendations, differentialDiagnosis } = report.structuredFindings;

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'severe': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'moderate': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'mild': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'severe': return <AlertTriangle size={14} />;
      case 'moderate': 
      case 'mild': return <Info size={14} />;
      default: return <CheckCircle size={14} />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar space-y-6 text-sm">
      
      {/* Impression Section */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
          <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
          Overall Impression
        </h3>
        <p className="text-[var(--text-primary)] leading-relaxed bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)]">
          {impression || "No impression generated."}
        </p>
      </div>

      {/* Detailed Findings */}
      <div>
        <h3 className="text-white font-semibold mb-3 px-1">Key Findings</h3>
        <div className="space-y-3">
          {findings && findings.length > 0 ? findings.map((finding, idx) => (
            <div key={idx} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-white">{finding.region}</span>
                <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 border ${getSeverityColor(finding.severity)}`}>
                  {getSeverityIcon(finding.severity)}
                  <span className="capitalize">{finding.severity || 'Normal'}</span>
                </span>
              </div>
              <p className="text-[var(--text-secondary)]">{finding.description}</p>
            </div>
          )) : (
            <p className="text-[var(--text-muted)] italic px-1">No detailed findings extracted.</p>
          )}
        </div>
      </div>

      {/* Differential Diagnosis */}
      {differentialDiagnosis && differentialDiagnosis.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3 px-1">Differential Diagnosis</h3>
          <ul className="list-disc pl-5 space-y-1 text-[var(--text-secondary)]">
            {differentialDiagnosis.map((diag, idx) => (
              <li key={idx} className="marker:text-[var(--accent-primary)]">{diag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="pb-4">
          <h3 className="text-white font-semibold mb-3 px-1">Recommendations</h3>
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4">
            <ul className="space-y-2">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-[var(--text-primary)]">
                  <span className="text-[var(--accent-primary)] font-bold mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindingsPanel;
