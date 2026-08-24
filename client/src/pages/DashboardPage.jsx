import { useContext } from 'react';
import { Link } from 'react-router-dom';
import BodyPartIcon from '../components/common/BodyPartIcon';
import { useDashboardStats } from '../hooks/api/useDashboard';
import { AuthContext } from '../context/AuthContext';
import { Users, Image as ImageIcon, FileText, CheckCircle, BrainCircuit, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) {
    return <div className="animate-pulse space-y-6 p-4">Loading dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Patients', value: data.stats.totalPatients, icon: <Users size={24} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Scans Uploaded', value: data.stats.totalScans, icon: <ImageIcon size={24} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Pending Reviews', value: data.stats.pendingReviews, icon: <FileText size={24} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Completed Reports', value: data.stats.completedReports, icon: <CheckCircle size={24} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Dr. {user?.name.split(' ')[0] || ''}</h1>
        <p className="text-[var(--text-secondary)]">Here's an overview of your medical imaging practice.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link to="/scans/upload" className="btn-primary flex items-center gap-2">
          <BrainCircuit size={18} /> New AI Analysis
        </Link>
        <Link to="/patients" className="btn-secondary flex items-center gap-2">
          <Users size={18} /> Add Patient
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6 border-b border-[var(--border-color)] pb-3">
            <h2 className="text-xl font-semibold text-white">Recent AI Analysis</h2>
            <Link to="/scans" className="text-sm text-[var(--accent-primary)] hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity) => (
                <Link 
                  key={activity._id} 
                  to={`/scans/${activity._id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-black/50 border border-[var(--border-color)] flex items-center justify-center overflow-hidden">
                      {(activity.files?.[0]?.filePath || activity.filePath) ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${activity.files?.[0]?.filePath || activity.filePath}`} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover opacity-80"
                        />
                      ) : (
                        <ImageIcon size={18} className="text-[var(--text-secondary)]" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium flex items-center gap-2 group-hover:text-[var(--accent-primary)] transition-colors">
                        <BodyPartIcon bodyPart={activity.bodyPart} size={14} className="text-inherit opacity-70" />
                        {activity.patient.firstName} {activity.patient.lastName} - <span className="capitalize">{activity.bodyPart}</span>
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`badge ${
                      activity.status === 'completed' ? 'badge-success' : 
                      activity.status === 'analyzing' ? 'badge-primary animate-pulse' :
                      'badge-warning'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-[var(--text-muted)] mt-10">No recent activity.</p>
            )}
          </div>
        </div>

        {/* Scan Types Chart */}
        <div className="glass-panel p-6 flex flex-col h-[400px]">
          <h2 className="text-xl font-semibold text-white mb-6 border-b border-[var(--border-color)] pb-3">Modality Distribution</h2>
          
          <div className="flex-1 w-full flex items-center justify-center min-h-0">
            {data.scanTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.scanTypes}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.scanTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[var(--text-muted)]">No scan data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
