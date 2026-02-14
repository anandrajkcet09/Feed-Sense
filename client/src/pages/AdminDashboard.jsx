import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageSquare,
    BarChart3,
    LogOut,
    TrendingUp,
    Users,
    ThumbsUp,
    ThumbsDown,
    Minus
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/feedback/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedbacks(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Calculate Stats
    const totalFeedback = feedbacks.length;
    const positiveFeedback = feedbacks.filter(f => f.sentiment === 'Positive').length;
    const negativeFeedback = feedbacks.filter(f => f.sentiment === 'Negative').length;
    const neutralFeedback = feedbacks.filter(f => f.sentiment === 'Neutral').length;

    // Chart Data
    const pieData = [
        { name: 'Positive', value: positiveFeedback, color: '#22c55e' },
        { name: 'Negative', value: negativeFeedback, color: '#ef4444' },
        { name: 'Neutral', value: neutralFeedback, color: '#3b82f6' },
    ];

    // Mock Trend Data (Last 7 days)
    // In a real app, this would be aggregated on the backend
    const trendData = [
        { name: 'Feb 1', Positive: 4, Negative: 1, Neutral: 2 },
        { name: 'Feb 2', Positive: 3, Negative: 2, Neutral: 1 },
        { name: 'Feb 3', Positive: 5, Negative: 1, Neutral: 3 },
        { name: 'Feb 4', Positive: 7, Negative: 3, Neutral: 2 },
        { name: 'Feb 5', Positive: 2, Negative: 0, Neutral: 1 }, // Mock
    ];

    const getSentimentBadge = (sentiment) => {
        const styles = {
            Positive: 'bg-green-100 text-green-700',
            Negative: 'bg-red-100 text-red-700',
            Neutral: 'bg-blue-100 text-blue-700',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[sentiment] || 'bg-gray-100'}`}>
                {sentiment}
            </span>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900">Admin Panel</h1>
                        <p className="text-xs text-slate-500">Sentiment Analysis</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'feedback' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <MessageSquare size={20} />
                        Feedback
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'analytics' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <BarChart3 size={20} />
                        Analytics
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <header className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
                    <p className="text-slate-500">Monitor and analyze sentiment feedback in real-time</p>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm mb-1">Total Feedback</p>
                            <h3 className="text-3xl font-bold text-slate-900">{totalFeedback}</h3>
                            <p className="text-xs text-slate-400 mt-1">All time</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl text-slate-600">
                            <Users size={24} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm mb-1">Positive</p>
                            <h3 className="text-3xl font-bold text-slate-900">{positiveFeedback}</h3>
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <TrendingUp size={12} /> {totalFeedback > 0 ? ((positiveFeedback / totalFeedback) * 100).toFixed(0) : 0}%
                            </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl text-green-600">
                            <ThumbsUp size={24} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-red-600 text-sm mb-1">Negative</p>
                            <h3 className="text-3xl font-bold text-slate-900">{negativeFeedback}</h3>
                            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <TrendingUp size={12} /> {totalFeedback > 0 ? ((negativeFeedback / totalFeedback) * 100).toFixed(0) : 0}%
                            </p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-xl text-red-600">
                            <ThumbsDown size={24} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 text-sm mb-1">Neutral</p>
                            <h3 className="text-3xl font-bold text-slate-900">{neutralFeedback}</h3>
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                <Minus size={12} /> {totalFeedback > 0 ? ((neutralFeedback / totalFeedback) * 100).toFixed(0) : 0}%
                            </p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                            <Minus size={24} />
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6">Sentiment Distribution</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6">Sentiment Trend</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="Negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Neutral" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Positive" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Feedback Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800">Recent Feedback</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Feedback</th>
                                    <th className="px-6 py-4">Sentiment</th>
                                    <th className="px-6 py-4">Confidence</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {feedbacks.slice(0, 5).map((feedback) => (
                                    <tr key={feedback._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{feedback.user?.fullName || 'Anonymous'}</div>
                                            <div className="text-xs text-slate-400">{feedback.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 max-w-sm truncate">{feedback.text}</td>
                                        <td className="px-6 py-4">{getSentimentBadge(feedback.sentiment)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-slate-100 rounded-full h-1.5">
                                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${feedback.confidenceScore}%` }}></div>
                                                </div>
                                                <span className="text-xs font-medium">{feedback.confidenceScore}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {new Date(feedback.createdAt).toLocaleDateString()} <br />
                                            {new Date(feedback.createdAt).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
