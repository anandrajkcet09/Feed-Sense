import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogOut, Send, MessageSquare, History, BarChart2, Moon, Sun, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SentimentChart from '../components/SentimentChart';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [previewResult, setPreviewResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    // Real-time Preview Effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (text.trim().length > 5) {
                setPreviewLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.post('http://localhost:5000/api/feedback/analyze-preview', { text }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setPreviewResult(res.data);
                } catch (err) {
                    console.error("Preview error", err);
                } finally {
                    setPreviewLoading(false);
                }
            } else {
                setPreviewResult(null);
            }
        }, 800); // 800ms debounce

        return () => clearTimeout(timer);
    }, [text]);

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
        if (!text.trim()) return toast.error("Please enter some text!");

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/feedback', { text }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(res.data);
            fetchHistory(); // Refresh history
            toast.success("Feedback analyzed successfully!");
            setText('');
            setPreviewResult(null);
        } catch (err) {
            console.error(err);
            toast.error("Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Sentiment Analysis</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">User Dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Input */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                        <MessageSquare size={18} />
                                    </div>
                                    <h2 className="font-semibold text-lg">Analyze Your Feedback</h2>
                                </div>
                                {previewLoading && (
                                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 animate-pulse">
                                        <Loader2 size={14} className="animate-spin" />
                                        Analyzing...
                                    </div>
                                )}
                                {!previewLoading && previewResult && (
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium border animate-fade-in ${getSentimentColor(previewResult.sentiment)}`}>
                                        Preview: {previewResult.sentiment}
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Enter your feedback or review below to analyze the sentiment</p>

                            <form onSubmit={handleAnalyze}>
                                <textarea
                                    className="w-full h-40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 outline-none resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    placeholder="Type something here... e.g., 'I absolutely love this product!'"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                ></textarea>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-blue-200 dark:shadow-none"
                                >
                                    {loading ? 'Analyzing...' : <><Send size={18} /> Analyze Sentiment</>}
                                </button>
                            </form>
                        </div>

                        {/* Recent History */}
                        {/* Recent History */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
                            <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-white">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                    <History size={18} />
                                </div>
                                <h2 className="font-semibold text-lg">Recent Analysis</h2>
                            </div>

                            <div className="space-y-4">
                                {history.length === 0 ? (
                                    <p className="text-slate-400 dark:text-slate-500 text-center py-4">No recent analysis found.</p>
                                ) : (
                                    history.slice(0, 5).map((item) => (
                                        <div key={item._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSentimentColor(item.sentiment)}`}>
                                                    {getSentimentEmoji(item.sentiment)} {item.sentiment}
                                                </span>
                                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                                    {new Date(item.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-2">{item.text}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Result & Stats */}
                    <div className="space-y-8">
                        {/* Analysis Result Card */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 min-h-[300px] transition-colors duration-200">
                            <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-white">
                                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                    <BarChart2 size={18} />
                                </div>
                                <h2 className="font-semibold text-lg">Analysis Result</h2>
                            </div>

                            {!result ? (
                                <div className="h-48 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
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
                                            <div className="flex justify-between text-sm mb-2 font-medium text-slate-700 dark:text-slate-300">
                                                <span>Confidence Score</span>
                                                <span>{result.confidenceScore}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${result.confidenceScore}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {result.detectedKeywords && result.detectedKeywords.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Detected Keywords</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.detectedKeywords.map((word, index) => (
                                                        <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-600">
                                                            {word}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Analyzed Text</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{result.text}"</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chart Section */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Sentiment Distribution</h3>
                            <div className="flex items-center justify-center">
                                {history.length > 0 ? (
                                    <SentimentChart data={history} />
                                ) : (
                                    <p className="text-slate-400 dark:text-slate-500 text-sm py-8">No data to display</p>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        {/* Quick Stats */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors duration-200">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Quick Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm text-center border border-slate-100 dark:border-slate-700">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{history.length}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Total Analysis</div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm text-center border border-slate-100 dark:border-slate-700">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                                        {history.filter(h => h.sentiment === 'Positive').length}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Positive</div>
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
