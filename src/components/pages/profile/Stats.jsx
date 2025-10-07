import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";
import { selectedUserId } from "../../../store/authSlice";

const API_URL = import.meta.env.VITE_API_URL;
const ProposalStatsDashboard = () => {
  // Use the API URL provided by the user
  const userId = useSelector(selectedUserId);
  const URL = `${API_URL}/schedules/manage/${userId}`;
  // console.log("URL", URL);

  const [stats, setStats] = useState({
    totalProposals: 0,
    signed: 0,
    denied: 0,
    sent: 0,
    scheduled: 0,
    statusPercentages: {},
    recipientStats: [],
    timelineData: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Fetching data from the actual API endpoint
  const fetchData = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch(URL);
      // console.log("response from api", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiData = await response.json();
      // console.log("apiData", apiData);

      if (apiData.success) {
        calculateStats(apiData);
      } else {
        throw new Error("API returned an unsuccessful response");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  const calculateStats = (apiData) => {
    const { groupedProposals } = apiData;
    // console.log("groupedProposals", groupedProposals);

    // Add null/undefined check
    if (!groupedProposals || !Array.isArray(groupedProposals)) {
      console.warn("groupedProposals is null or not an array");
      setStats({
        totalProposals: 0,
        signed: 0,
        denied: 0,
        sent: 0,
        scheduled: 0,
        pending: 0,
        statusPercentages: {
          signed: 0,
          denied: 0,
          sent: 0,
          scheduled: 0,
          pending: 0,
        },
        recipientStats: [],
        timelineData: [],
        loading: false,
        error: null,
      });
      return;
    }

    let totalProposals = 0;
    let signedCount = 0;
    let deniedCount = 0;
    let sentCount = 0;
    let scheduledCount = 0;

    const recipientMap = new Map();
    const timelineData = [];

    // Rest of your existing code remains the same...
    groupedProposals.forEach((group) => {
      totalProposals += group.proposals?.length || 0;
      scheduledCount += group.schedules?.length || 0;

      const groupSigned = (
        group.signatures?.filter((sig) => sig.status === true) || []
      ).length;

      const groupDenied = (
        group.signatures?.filter((sig) => sig.status === false) || []
      ).length;

      signedCount += groupSigned;
      deniedCount += groupDenied;

      sentCount += group.recipients?.length || 0;

      // Continue with the rest of your function...
      (group.recipients || []).forEach((recipient) => {
        if (recipientMap.has(recipient.recipientEmail)) {
          recipientMap.set(
            recipient.recipientEmail,
            recipientMap.get(recipient.recipientEmail) + 1
          );
        } else {
          recipientMap.set(recipient.recipientEmail, 1);
        }
      });

      (group.proposals || []).forEach((proposal) => {
        let status = "Pending";

        if (group.signatures?.length > 0) {
          const hasSigned = group.signatures.some((sig) => sig.status === true);
          const hasDenied = group.signatures.some(
            (sig) => sig.status === false
          );
          if (hasSigned) {
            status = "Signed";
          } else if (hasDenied) {
            status = "Denied";
          }
        }

        timelineData.push({
          name: proposal.proposalName,
          date: new Date(proposal.expirationDate).toLocaleDateString(),
          fullDate: proposal.expirationDate,
          status: status,
          link: proposal.link,
        });
      });
    });

    const statusPercentages = {
      signed:
        totalProposals > 0
          ? Math.round((signedCount / totalProposals) * 100)
          : 0,
      denied:
        totalProposals > 0
          ? Math.round((deniedCount / totalProposals) * 100)
          : 0,
      sent:
        totalProposals > 0 ? Math.round((sentCount / totalProposals) * 100) : 0,
      scheduled:
        totalProposals > 0
          ? Math.round((scheduledCount / totalProposals) * 100)
          : 0,
      pending:
        totalProposals > 0
          ? Math.round(
              ((totalProposals - signedCount - deniedCount) / totalProposals) *
                100
            )
          : 0,
    };

    const recipientStats = Array.from(recipientMap, ([email, count]) => {
      const safeEmail = email || "Unknown";
      return {
        email:
          safeEmail.length > 20
            ? safeEmail.substring(0, 20) + "..."
            : safeEmail,
        fullEmail: safeEmail,
        count,
      };
    })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    timelineData.sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate));

    setStats({
      totalProposals,
      signed: signedCount,
      denied: deniedCount,
      sent: sentCount,
      scheduled: scheduledCount,
      pending: totalProposals - signedCount - deniedCount,
      statusPercentages,
      recipientStats,
      timelineData: timelineData.slice(0, 10),
      loading: false,
      error: null,
    });
  };

  const statusData = [
    {
      name: "Signed",
      value: stats.statusPercentages.signed,
      color: "#10b981",
      count: stats.signed,
    },
    {
      name: "Sent",
      value: stats.statusPercentages.sent,
      color: "#3b82f6",
      count: stats.sent,
    },
    {
      name: "Pending",
      value: stats.statusPercentages.pending,
      color: "#f59e0b",
      count: stats.pending,
    },
    {
      name: "Scheduled",
      value: stats.statusPercentages.scheduled,
      color: "#8b5cf6",
      count: stats.scheduled,
    },
    {
      name: "Denied",
      value: stats.statusPercentages.denied,
      color: "#ef4444",
      count: stats.denied,
    },
  ].filter((item) => item.value > 0);

  const StatCard = ({ title, value, percentage, color, icon, description }) => (
    <div className="stat-card">
      <div className="stat-content">
        <div className="stat-text">
          <p className="stat-title">{title}</p>
          <p className="stat-value">{value}</p>
          <div className="stat-details">
            <span className="stat-percentage" style={{ color: color }}>
              {percentage}%
            </span>
            <span className="stat-description">{description}</span>
          </div>
        </div>
        <div
          className="stat-icon"
          style={{
            backgroundColor: color
              .replace("text-", "bg-")
              .replace("-600", "-100"),
          }}
        >
          <span className="stat-icon-text">{icon}</span>
        </div>
      </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="loading-container">
      <div className="spinner"></div>
    </div>
  );

  const ErrorMessage = () => (
    <div className="error-container">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Failed to load data</h2>
        <p className="error-message">{stats.error}</p>
        <button onClick={fetchData} className="retry-button">
          Retry
        </button>
      </div>
    </div>
  );

  if (stats.loading) return <LoadingSpinner />;
  if (stats.error) return <ErrorMessage />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            title="Total Proposals"
            value={stats.totalProposals}
            percentage={100}
            color="#3b82f6"
            icon="📊"
            description="total"
          />
          <StatCard
            title="Signed"
            value={stats.signed}
            percentage={stats.statusPercentages.signed}
            color="#10b981"
            icon="✅"
            description="signed"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            percentage={stats.statusPercentages.pending}
            color="#f59e0b"
            icon="⏳"
            description="pending"
          />
          <StatCard
            title="Scheduled"
            value={stats.scheduled}
            percentage={stats.statusPercentages.scheduled}
            color="#8b5cf6"
            icon="📅"
            description="scheduled"
          />
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          {/* Pie Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Status Distribution</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Top Recipients</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.recipientStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="email"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    formatter={(value) => [value, "Proposals"]}
                    labelFormatter={(label) =>
                      `Email: ${
                        stats.recipientStats.find((r) => r.email === label)
                          ?.fullEmail || label
                      }`
                    }
                  />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                    name="Proposals"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="progress-section">
          <h3 className="progress-title">Detailed Status Breakdown</h3>
          <div className="progress-bars-container">
            {statusData.map((status, index) => (
              <div key={index} className="progress-bar-item">
                <div className="progress-bar-info">
                  <span className="progress-label">
                    <span
                      className="progress-color-dot"
                      style={{ backgroundColor: status.color }}
                    ></span>
                    {status.name} ({status.count})
                  </span>
                  <span className="progress-percentage">{status.value}%</span>
                </div>
                <div className="progress-bar-background">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${status.value}%`,
                      backgroundColor: status.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Proposals Table */}
        <div className="table-section">
          <div className="table-header">
            <h3 className="table-title">Recent Proposals</h3>
            <span className="table-summary">
              Showing {Math.min(stats.timelineData.length, 10)} of{" "}
              {stats.totalProposals}
            </span>
          </div>
          <div className="table-container">
            <table className="proposal-table">
              <thead>
                <tr>
                  <th className="table-cell">Proposal Name</th>
                  <th className="table-cell">Expiration Date</th>
                  <th className="table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.timelineData.map((item, index) => (
                  <tr key={index} className="table-row">
                    <td className="table-cell">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="proposal-link"
                      >
                        {item.name}
                      </a>
                    </td>
                    <td className="table-cell table-text-color">{item.date}</td>
                    <td className="table-cell">
                      <span
                        className={`status-badge status-${item.status.toLowerCase()}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`
        /* General Styles */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
        }
        
        .dashboard-container {
            min-height: 100vh;
            background-color: #f3f4f6;
            padding: 1rem;
        }

        .dashboard-content {
            max-width: 80rem;
            margin: auto;
        }

        /* Header */
        .dashboard-header {
            margin-bottom: 2.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-title {
            font-size: 2.25rem;
            font-weight: 800;
            color: #111827;
        }

        .header-subtitle {
            color: #6b7280;
            margin-top: 0.5rem;
        }

        .refresh-button {
            background-color: #ffffff;
            color: #4b5563;
            padding: 0.5rem 1.25rem;
            border-radius: 0.75rem;
            border: 1px solid #d1d5db;
            transition: background-color 0.2s, box-shadow 0.2s;
            display: flex;
            align-items: center;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .refresh-button:hover {
            background-color: #f9fafb;
        }

        .refresh-icon {
            margin-right: 0.5rem;
        }
        
        /* Stat Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2.5rem;
        }
        
        .stat-card {
            background-color: #ffffff;
            border-radius: 1rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            padding: 1.5rem;
            border: 1px solid #f3f4f6;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .stat-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .stat-text {
            flex: 1;
        }

        .stat-title {
            font-size: 0.875rem;
            font-weight: 500;
            color: #6b7280;
        }

        .stat-value {
            font-size: 1.875rem;
            font-weight: 700;
            color: #111827;
            margin-top: 0.5rem;
        }
        
        .stat-details {
            display: flex;
            align-items: center;
            margin-top: 0.5rem;
        }
        
        .stat-percentage {
            font-size: 0.875rem;
            font-weight: 600;
        }

        .stat-description {
            font-size: 0.875rem;
            color: #9ca3af;
            margin-left: 0.25rem;
        }
        
        .stat-icon {
            padding: 0.75rem;
            border-radius: 9999px;
            margin-left: 1rem;
        }

        .stat-icon-text {
            font-size: 1.5rem;
        }

        /* Charts Section */
        .charts-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2.5rem;
        }

        .chart-card {
            background-color: #ffffff;
            border-radius: 1rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            padding: 1.5rem;
            border: 1px solid #f3f4f6;
        }
        
        .chart-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 1rem;
        }

        .chart-container {
            height: 20rem;
        }
        
        /* Progress Bars */
        .progress-section {
            background-color: #ffffff;
            border-radius: 1rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            padding: 1.5rem;
            margin-bottom: 2.5rem;
            border: 1px solid #f3f4f6;
        }

        .progress-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 1.5rem;
        }

        .progress-bars-container {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .progress-bar-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .progress-bar-info {
            display: flex;
            justify-content: space-between;
            font-size: 0.875rem;
        }

        .progress-label {
            font-weight: 500;
            color: #4b5563;
            display: flex;
            align-items: center;
        }

        .progress-color-dot {
            width: 0.75rem;
            height: 0.75rem;
            border-radius: 9999px;
            margin-right: 0.5rem;
        }

        .progress-percentage {
            color: #4b5563;
            font-weight: 600;
        }

        .progress-bar-background {
            width: 100%;
            background-color: #e5e7eb;
            border-radius: 9999px;
            height: 0.5rem;
        }

        .progress-bar-fill {
  height: 0.5rem;
  border-radius: 9999px;
  transition: width 0.5s ease-out;
  max-width: 100%; /* Add this line to prevent overflow */
}

        /* Table */
        .table-section {
            background-color: #ffffff;
            border-radius: 1rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            padding: 1.5rem;
            border: 1px solid #f3f4f6;
        }

        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .table-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
        }

        .table-summary {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .table-container {
            overflow-x: auto;
            border-radius: 0.5rem;
            border: 1px solid #e5e7eb;
        }
        
        .proposal-table {
            min-width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        
        .proposal-table thead {
            background-color: #f9fafb;
        }

        .proposal-table th {
            text-align: left;
            padding: 0.75rem 1.5rem;
            font-size: 0.75rem;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .proposal-table tbody {
            background-color: #ffffff;
            border-top: 1px solid #e5e7eb;
        }

        .table-row {
            transition: background-color 0.2s;
        }
        
        .table-row:hover {
            background-color: #f9fafb;
        }

        .table-cell {
            padding: 1rem 1.5rem;
            font-size: 0.875rem;
        }

        .proposal-link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
        }

        .proposal-link:hover {
            text-decoration: underline;
            color: #2563eb;
        }

        .table-text-color {
            color: #4b5563;
        }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .status-signed {
            background-color: #d1fae5;
            color: #065f46;
        }
        .status-denied {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .status-pending {
            background-color: #fffbeb;
            color: #92400e;
        }
        
        /* Loading & Error */
        .loading-container, .error-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }

        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #3b82f6;
            border-radius: 50%;
            width: 3rem;
            height: 3rem;
            animation: spin 1s linear infinite;
        }
        
        .error-content {
            text-align: center;
        }

        .error-icon {
            font-size: 3rem;
            color: #ef4444;
            margin-bottom: 1rem;
        }

        .error-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.5rem;
        }

        .error-message {
            color: #4b5563;
            margin-bottom: 1rem;
        }
        
        .retry-button {
            background-color: #3b82f6;
            color: #ffffff;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s;
        }

        .retry-button:hover {
            background-color: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default ProposalStatsDashboard;
