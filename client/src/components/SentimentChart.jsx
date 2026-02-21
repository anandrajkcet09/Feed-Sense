import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SentimentChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const sentimentCounts = data.reduce((acc, curr) => {
        acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
        return acc;
    }, {});

    const chartData = [
        { name: 'Positive', value: sentimentCounts['Positive'] || 0, color: '#16a34a' }, // green-600
        { name: 'Neutral', value: sentimentCounts['Neutral'] || 0, color: '#2563eb' },  // blue-600
        { name: 'Negative', value: sentimentCounts['Negative'] || 0, color: '#dc2626' }  // red-600
    ].filter(item => item.value > 0);

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SentimentChart;
