import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogOut, Send, MessageSquare, History, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/feedback/my-feedback', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/feedback', { text }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(res.data);
            fetchHistory(); // Refresh history
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getSentimentColor = (sentiment) => {
        if (sentiment === 'Positive') return 'text-green-600 bg-green-100';
        if (sentiment === 'Negative') return 'text-red-600 bg-red-100';
        return 'text-blue-600 bg-blue-100';
    };

    const getSentimentEmoji = (sentiment) => {
        if (sentiment === 'Positive') return '😊';
        if (sentiment === 'Negative') return '😠';
        return '😐';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">Sentiment Analysis</h1>
                        <p className="text-xs text-slate-500">User Dashboard</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Input */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-4 text-slate-800">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <MessageSquare size={18} />
                                </div>
                                <h2 className="font-semibold text-lg">Analyze Your Feedback</h2>
                            </div>
                            <p className="text-slate-500 text-sm mb-4">Enter your feedback or review below to analyze the sentiment</p>

                            <form onSubmit={handleAnalyze}>
                                <textarea
                                    className="w-full h-40 p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none transition-all text-slate-700 placeholder:text-slate-400"
                                    placeholder="Type something here..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                ></textarea>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-blue-200"
                                >
                                    {loading ? 'Analyzing...' : <><Send size={18} /> Analyze Sentiment</>}
                                </button>
                            </form>
                        </div>

                        {/* Recent History */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-6 text-slate-800">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <History size={18} />
                                </div>
                                <h2 className="font-semibold text-lg">Recent Analysis</h2>
                            </div>

                            <div className="space-y-4">
                                {history.length === 0 ? (
                                    <p className="text-slate-400 text-center py-4">No recent analysis found.</p>
                                ) : (
                                    history.slice(0, 5).map((item) => (
                                        <div key={item._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSentimentColor(item.sentiment)}`}>
                                                    {getSentimentEmoji(item.sentiment)} {item.sentiment}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(item.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 text-sm line-clamp-2">{item.text}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Result & Stats */}
                    <div className="space-y-8">
                        {/* Analysis Result Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[300px]">
                            <div className="flex items-center gap-2 mb-6 text-slate-800">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <BarChart2 size={18} />
                                </div>
                                <h2 className="font-semibold text-lg">Analysis Result</h2>
                            </div>

                            {!result ? (
                                <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-center border-2 border-dashed border-slate-200 rounded-xl">
                                    <MessageSquare size={48} className="mb-2 opacity-50" />
                                    <p>Submit feedback to see results</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="text-6xl mb-4 animate-bounce-slow">
                                        {getSentimentEmoji(result.sentiment)}
                                    </div>
                                    <div className={`inline-block px-4 py-1.5 rounded-full font-bold text-sm mb-8 ${getSentimentColor(result.sentiment)}`}>
                                        {result.sentiment}
                                    </div>

                                    <div className="space-y-6 text-left">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2 font-medium text-slate-700">
                                                <span>Confidence Score</span>
                                                <span>{result.confidenceScore}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${result.confidenceScore}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {result.detectedKeywords && result.detectedKeywords.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 mb-2">Detected Keywords</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.detectedKeywords.map((word, index) => (
                                                        <span key={index} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
                                                            {word}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-slate-100">
                                            <p className="text-xs text-slate-400 mb-1">Analyzed Text</p>
                                            <p className="text-sm text-slate-600 italic">"{result.text}"</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4">Quick Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                                    <div className="text-2xl font-bold text-slate-900">{history.length}</div>
                                    <div className="text-xs text-slate-500">Total Analysis</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {history.filter(h => h.sentiment === 'Positive').length}
                                    </div>
                                    <div className="text-xs text-slate-500">Positive</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
