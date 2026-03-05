import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
    Minus,
    Search,
    Download,
    Moon,
    Sun,
    Filter,
    Menu,
    X
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
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Feedback Filtering State
    const [searchTerm, setSearchTerm] = useState('');
    const [sentimentFilter, setSentimentFilter] = useState('All');

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const token = getToken();
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

    // Calculate Dashboard Stats
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

    // Calculate Real 5-Day Trend Data
    const trendData = useMemo(() => {
        const last5Days = Array.from({ length: 5 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (4 - i));
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const dataMap = last5Days.reduce((acc, date) => {
            acc[date] = { name: date, Positive: 0, Negative: 0, Neutral: 0 };
            return acc;
        }, {});

        feedbacks.forEach(f => {
            const dateStr = new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (dataMap[dateStr]) {
                dataMap[dateStr][f.sentiment]++;
            }
        });
        return Object.values(dataMap);
    }, [feedbacks]);

    // Top Performing & Averages
    const topPerforming = useMemo(() => {
        if (!feedbacks.length) return null;
        let highest = feedbacks[0];
        feedbacks.forEach(f => {
            if (f.sentiment === 'Positive' && f.confidenceScore > (highest.sentiment === 'Positive' ? highest.confidenceScore : 0)) {
                highest = f;
            }
        });
        return highest;
    }, [feedbacks]);

    const averageConfidence = totalFeedback > 0
        ? (feedbacks.reduce((acc, curr) => acc + curr.confidenceScore, 0) / totalFeedback).toFixed(1)
        : 0;

    const getSentimentBadge = (sentiment) => {
        const styles = {
            Positive: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            Negative: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            Neutral: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[sentiment] || 'bg-gray-100'}`}>
                {sentiment}
            </span>
        );
    };

    // Filter Feedbacks
    const filteredFeedbacks = feedbacks.filter(f => {
        const matchesSearch = f.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.user?.fullName && f.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSentiment = sentimentFilter === 'All' || f.sentiment === sentimentFilter;
        return matchesSearch && matchesSentiment;
    });

    const handleExportCSV = () => {
        const headers = ["ID", "User", "Email", "Feedback", "Sentiment", "Confidence", "Date", "Keywords"];
        const rows = filteredFeedbacks.map(f => [
            f._id,
            f.user?.fullName || 'Anonymous',
            f.user?.email || 'N/A',
            `"${f.text.replace(/"/g, '""')}"`, // escape quotes for CSV
            f.sentiment,
            f.confidenceScore,
            new Date(f.createdAt).toISOString(),
            (f.detectedKeywords || []).join(';')
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `feedback_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Render Components ---
    const renderDashboard = () => (
        <>
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
                <p className="text-slate-500 dark:text-slate-400">Monitor and analyze sentiment feedback in real-time</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-colors">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Feedback</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalFeedback}</h3>
                        <p className="text-xs text-slate-400 mt-1">All time</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-slate-600 dark:text-slate-300">
                        <Users size={24} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-green-100 dark:border-green-900/30 shadow-sm flex items-center justify-between transition-colors">
                    <div>
                        <p className="text-green-600 dark:text-green-400 text-sm mb-1">Positive</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{positiveFeedback}</h3>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                            <TrendingUp size={12} /> {totalFeedback > 0 ? ((positiveFeedback / totalFeedback) * 100).toFixed(0) : 0}%
                        </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl text-green-600 dark:text-green-400">
                        <ThumbsUp size={24} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm flex items-center justify-between transition-colors">
                    <div>
                        <p className="text-red-600 dark:text-red-400 text-sm mb-1">Negative</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{negativeFeedback}</h3>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                            <TrendingUp size={12} /> {totalFeedback > 0 ? ((negativeFeedback / totalFeedback) * 100).toFixed(0) : 0}%
                        </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-xl text-red-600 dark:text-red-400">
                        <ThumbsDown size={24} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm flex items-center justify-between transition-colors">
                    <div>
                        <p className="text-blue-600 dark:text-blue-400 text-sm mb-1">Neutral</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{neutralFeedback}</h3>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                            <Minus size={12} /> {totalFeedback > 0 ? ((neutralFeedback / totalFeedback) * 100).toFixed(0) : 0}%
                        </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600 dark:text-blue-400">
                        <Minus size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-6">Sentiment Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : 'white', border: 'none', borderRadius: '8px', color: theme === 'dark' ? '#f8fafc' : 'black' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-6">Sentiment Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: theme === 'dark' ? '#334155' : '#f8fafc' }} contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : 'white', borderRadius: '8px', border: 'none', color: theme === 'dark' ? '#f8fafc' : 'black' }} />
                                <Bar dataKey="Negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Neutral" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Positive" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    );

    const renderFeedbackManagement = () => (
        <div className="animate-fade-in">
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback Management</h2>
                    <p className="text-slate-500 dark:text-slate-400">Complete list of analyzed feedback</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 font-medium shadow-sm">
                        <Download size={18} /> Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 font-medium shadow-sm">
                        <BarChart3 size={18} /> Export Summary
                    </button>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 flex-shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search feedback..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="text-slate-400 hidden sm:block" size={18} />
                        <select
                            value={sentimentFilter}
                            onChange={(e) => setSentimentFilter(e.target.value)}
                            className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
                        >
                            <option value="All">All Sentiments</option>
                            <option value="Positive">Positive</option>
                            <option value="Negative">Negative</option>
                            <option value="Neutral">Neutral</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-xs border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">ID / User</th>
                                <th className="px-6 py-4">Feedback</th>
                                <th className="px-6 py-4">Sentiment</th>
                                <th className="px-6 py-4">Confidence</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredFeedbacks.length > 0 ? filteredFeedbacks.map((f, i) => (
                                <tr key={f._id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors bg-white dark:bg-slate-800">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-400 dark:text-slate-500">#{i + 1}</span>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">{f.user?.fullName || 'Anonymous'}</div>
                                                <div className="text-xs text-slate-500">{f.user?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-sm">
                                        <p className="line-clamp-2 text-slate-700 dark:text-slate-300 font-medium">"{f.text}"</p>
                                    </td>
                                    <td className="px-6 py-4">{getSentimentBadge(f.sentiment)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-8">{f.confidenceScore}%</span>
                                            <div className="w-24 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                                <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: `${f.confidenceScore}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                        {new Date(f.createdAt).toLocaleDateString()} <br />
                                        <span className="text-slate-400">{new Date(f.createdAt).toLocaleTimeString()}</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No feedback found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="animate-fade-in">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics & Insights</h2>
                <p className="text-slate-500 dark:text-slate-400">Deep dive into sentiment trends and metrics</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">Sentiment Distribution</h3>
                    <p className="text-sm text-slate-500 mb-6">Breakdown of all feedback sentiments</p>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} innerRadius={0} outerRadius={90} fill="#8884d8" dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : 'white', border: 'none', borderRadius: '8px', color: theme === 'dark' ? '#f8fafc' : 'black' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">5-Day Trend Analysis</h3>
                    <p className="text-sm text-slate-500 mb-6">Sentiment changes over time</p>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: theme === 'dark' ? '#334155' : '#f8fafc' }} contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : 'white', borderRadius: '8px', border: 'none', color: theme === 'dark' ? '#f8fafc' : 'black' }} />
                                <Bar dataKey="Negative" fill="#ef4444" minPointSize={2} />
                                <Bar dataKey="Neutral" fill="#3b82f6" minPointSize={2} />
                                <Bar dataKey="Positive" fill="#22c55e" minPointSize={2} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800/30">
                    <h4 className="font-bold text-slate-800 dark:text-green-50">Top Performing</h4>
                    <p className="text-sm mb-4 text-green-700/80 dark:text-green-400">Highest sentiment score</p>
                    <div className="text-3xl font-black text-green-600 dark:text-green-500 tracking-tight mb-2">
                        {topPerforming ? `${topPerforming.confidenceScore}%` : 'N/A'}
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                        {topPerforming?.user?.fullName ? `${topPerforming.user.fullName}'s feedback` : 'Anonymous review'}
                    </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                    <h4 className="font-bold text-slate-800 dark:text-blue-50">Average Confidence</h4>
                    <p className="text-sm mb-4 text-blue-700/80 dark:text-blue-400">Overall analysis accuracy</p>
                    <div className="text-3xl font-black text-blue-600 dark:text-blue-500 tracking-tight mb-2">
                        {averageConfidence}%
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Across all feedback</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                    <h4 className="font-bold text-slate-800 dark:text-purple-50">Response Rate</h4>
                    <p className="text-sm mb-4 text-purple-700/80 dark:text-purple-400">User engagement metric</p>
                    <div className="text-3xl font-black text-purple-600 dark:text-purple-500 tracking-tight mb-2">
                        100%
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">All feedback analyzed</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 w-full overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900 dark:text-white">Admin Panel</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sentiment Analysis</p>
                        </div>
                    </div>
                    <button
                        className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button
                        onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                    >
                        <LayoutDashboard size={20} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
                        Dashboard
                    </button>
                    <button
                        onClick={() => { setActiveTab('feedback'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'feedback' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                    >
                        <MessageSquare size={20} strokeWidth={activeTab === 'feedback' ? 2.5 : 2} />
                        Feedback
                    </button>
                    <button
                        onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'analytics' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                    >
                        <BarChart3 size={20} strokeWidth={activeTab === 'analytics' ? 2.5 : 2} />
                        Analytics
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 font-bold bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-red-100 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-all"
                    >
                        <LogOut size={18} strokeWidth={2.5} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
                {/* Top Header */}
                <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10 transition-colors">
                    <div className="flex items-center gap-3 md:hidden">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-slate-900 dark:text-white">FeedSense</span>
                    </div>

                    {/* Spacer for desktop to align right */}
                    <div className="hidden md:block flex-1"></div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-900">
                    <div className="max-w-6xl mx-auto">
                        {loading ? (
                            <div className="flex h-64 items-center justify-center">
                                <span className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></span>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'dashboard' && renderDashboard()}
                                {activeTab === 'feedback' && renderFeedbackManagement()}
                                {activeTab === 'analytics' && renderAnalytics()}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
