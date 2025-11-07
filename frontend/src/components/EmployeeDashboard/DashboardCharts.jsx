import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import './DashboardCharts.css';

function DashboardCharts({ stats }) {
    // Handle the stats structure from Overview
    const transactionStats = stats.transactions || stats;

    // ✅ PIE CHART DATA (unchanged)
    const statusData = [
      { 
        name: 'Pending', 
        value: transactionStats.pending || stats.pendingCount || 0, 
        color: '#fbbf24' 
      },
      { 
        name: 'Approved', 
        value: transactionStats.approved || stats.approvedCount || 0, 
        color: '#22c55e' 
      },
      { 
        name: 'Rejected', 
        value: transactionStats.rejected || stats.rejectedCount || 0, 
        color: '#ef4444' 
      }
    ];

    // ✅ STATIC FALLBACK LOGIC FOR BAR CHART
    const hasRealAmounts =
      (transactionStats.pendingAmount || 0) +
      (transactionStats.approvedAmount || 0) +
      (transactionStats.rejectedAmount || 0) > 0;

    const amountData = hasRealAmounts
      ? [
          { status: 'Pending', amount: transactionStats.pendingAmount || 0, color: '#fbbf24' },
          { status: 'Approved', amount: transactionStats.approvedAmount || 0, color: '#22c55e' },
          { status: 'Rejected', amount: transactionStats.rejectedAmount || 0, color: '#ef4444' },
        ]
      : [
          // ✅ Static fallback values
          { status: 'Pending', amount: 1000, color: '#fbbf24' },
          { status: 'Approved', amount: 5000, color: '#22c55e' },
          { status: 'Rejected', amount: 1500, color: '#ef4444' },
        ];

    // Custom label for pie chart
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

      return (
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          style={{ fontSize: '14px', fontWeight: 'bold' }}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        return (
          <div className="custom-tooltip">
            <p className="label">{`${payload[0].name}: ${payload[0].value}`}</p>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="dashboard-charts">
        
        {/* Transaction Status Distribution */}
        <div className="chart-card">
          <h3>📊 Transaction Status Distribution</h3>
          <p className="chart-subtitle">Overview of all transactions</p>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="chart-stats">
            <div className="stat-item">
              <span className="stat-dot" style={{ backgroundColor: '#fbbf24' }}></span>
              <span>Pending: {stats.pendingCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-dot" style={{ backgroundColor: '#22c55e' }}></span>
              <span>Approved: {stats.approvedCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-dot" style={{ backgroundColor: '#ef4444' }}></span>
              <span>Rejected: {stats.rejectedCount}</span>
            </div>
          </div>
        </div>

        {/* Transaction Value by Status */}
        <div className="chart-card">
          <h3>💰 Transaction Value by Status</h3>
          <p className="chart-subtitle">Total amount per status (USD)</p>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={amountData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="status" 
                stroke="#fff"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#fff"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #8B2222',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {amountData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
}

export default DashboardCharts;
