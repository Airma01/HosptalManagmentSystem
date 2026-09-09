// src/Pages/Admin/DashboardOverview.jsx
import React, { useState, useEffect, useCallback } from "react";
import API from "../../Config/API";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const formatNumber = (value) =>
  new Intl.NumberFormat().format(value ?? 0);

const COLOR_MAP = {
  blue: { border: "border-blue-500", text: "text-blue-500", bg: "bg-blue-50" },
  green: { border: "border-green-500", text: "text-green-500", bg: "bg-green-50" },
  purple: { border: "border-purple-500", text: "text-purple-500", bg: "bg-purple-50" },
  orange: { border: "border-orange-500", text: "text-orange-500", bg: "bg-orange-50" },
  red: { border: "border-red-500", text: "text-red-500", bg: "bg-red-50" },
  indigo: { border: "border-indigo-500", text: "text-indigo-500", bg: "bg-indigo-50" },
  teal: { border: "border-teal-500", text: "text-teal-500", bg: "bg-teal-50" },
  cyan: { border: "border-cyan-500", text: "text-cyan-500", bg: "bg-cyan-50" },
  pink: { border: "border-pink-500", text: "text-pink-500", bg: "bg-pink-50" },
  amber: { border: "border-amber-500", text: "text-amber-500", bg: "bg-amber-50" },
};

const CHART_COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444",
  "#6366F1", "#14B8A6", "#EC4899", "#F97316", "#06B6D4",
];

const EmptyChart = ({ message = "No data available" }) => (
  <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
    <div className="text-center">
      <i className="bi bi-bar-chart text-3xl mb-2 block"></i>
      <p>{message}</p>
    </div>
  </div>
);

const DashboardOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("/Hospital/AdminOverview/overview");
      setData(response.data);
    } catch (err) {
      console.error("Admin overview error:", err);
      setError("Unable to load dashboard data. Please try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // ---------- Loading ----------
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500 text-sm">Hospital overview and analytics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow border p-5 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow border p-6 flex items-center justify-center h-72">
          <div className="text-center text-gray-500">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p>Loading dashboard data…</p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Error ----------
  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500 text-sm">Hospital overview and analytics</p>
        </div>
        <div className="bg-white rounded-xl shadow border p-10 text-center">
          <i className="bi bi-exclamation-triangle text-4xl text-red-500 mb-3 block"></i>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={fetchOverview}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="bi bi-arrow-clockwise mr-2"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ---------- KPI cards (only real DTO fields) ----------
  const kpiCards = [
    { title: "Total Patients", value: data.totalPatients, icon: "bi-people-fill", color: "blue" },
    { title: "Today's Patients", value: data.todaysPatients, icon: "bi-person-plus-fill", color: "cyan" },
    { title: "Total Visits", value: data.totalVisits, icon: "bi-hospital-fill", color: "green" },
    { title: "Today's Visits", value: data.todaysVisits, icon: "bi-calendar2-check-fill", color: "teal" },
    { title: "Total Doctors", value: data.totalDoctors, icon: "bi-person-badge-fill", color: "purple" },
    { title: "Total Nurses", value: data.totalNurses, icon: "bi-person-hearts", color: "pink" },
    { title: "Total Staff", value: data.totalStaff, icon: "bi-people", color: "indigo" },
    { title: "Total Appointments", value: data.totalAppointments, icon: "bi-calendar-event-fill", color: "orange" },
    { title: "Today's Appointments", value: data.todaysAppointments, icon: "bi-calendar-check-fill", color: "amber" },
    { title: "Pending Appointments", value: data.pendingAppointments, icon: "bi-hourglass-split", color: "orange" },
    { title: "Completed Appointments", value: data.completedAppointments, icon: "bi-check-circle-fill", color: "green" },
    { title: "Cancelled Appointments", value: data.cancelledAppointments, icon: "bi-x-circle-fill", color: "red" },
    { title: "Total Referrals", value: data.totalReferrals, icon: "bi-arrow-left-right", color: "indigo" },
    { title: "Pending Referrals", value: data.pendingReferrals, icon: "bi-clock-history", color: "amber" },
    { title: "Completed Referrals", value: data.completedReferrals, icon: "bi-check2-all", color: "green" },
    { title: "Lab Requests", value: data.totalLaboratoryRequests, icon: "bi-flask", color: "teal" },
    { title: "Pending Lab", value: data.pendingLaboratoryRequests, icon: "bi-hourglass", color: "orange" },
    { title: "Completed Lab", value: data.completedLaboratoryRequests, icon: "bi-clipboard2-check", color: "green" },
    { title: "Prescriptions", value: data.totalPrescriptions, icon: "bi-capsule", color: "purple" },
    { title: "Pending Prescriptions", value: data.pendingPrescriptions, icon: "bi-prescription2", color: "red" },
    { title: "Paid Prescriptions", value: data.paidPrescriptions, icon: "bi-cash-coin", color: "green" },
  ].filter((c) => c.value !== undefined && c.value !== null);

  // ---------- Trend line data (merge patients + visits by month) ----------
  const patientTrend = data.patientRegistrationTrend ?? [];
  const visitTrend = data.visitTrend ?? [];
  const trendData = patientTrend.map((p, i) => ({
    month: p.month,
    patients: p.count ?? 0,
    visits: visitTrend[i]?.count ?? 0,
  }));

  // ---------- Department bar ----------
  const departmentData = (data.departmentWorkload ?? []).map((d) => ({
    name: d.departmentName || `Dept ${d.clinicalDepartmentID}`,
    doctors: d.doctorCount ?? 0,
    nurses: d.nurseCount ?? 0,
    appointments: d.appointmentCount ?? 0,
    referrals: d.referralCount ?? 0,
  }));

  // ---------- Status / gender pie helpers ----------
  const appointmentStatusData = (data.appointmentStatusDistribution ?? []).map((s) => ({
    name: s.status || "Unknown",
    value: s.count ?? 0,
  }));

  const referralStatusData = (data.referralStatusDistribution ?? []).map((s) => ({
    name: s.status || "Unknown",
    value: s.count ?? 0,
  }));

  const genderData = (data.genderDistribution ?? []).map((g) => ({
    name: g.gender || "Unknown",
    value: g.count ?? 0,
  }));

  const visitStatusData = (data.visitStatusDistribution ?? []).map((s) => ({
    name: s.status || "Unknown",
    value: s.count ?? 0,
  }));

  // ---------- Laboratory ----------
  const lab = data.laboratory ?? {};
  const labSectionData = (lab.testsBySection ?? []).map((s) => ({
    name: s.sectionName || `Section ${s.laboratorySectionID}`,
    tests: s.testCount ?? 0,
  }));
  const labStatusData = (lab.statusDistribution ?? []).map((s) => ({
    name: s.status || "Unknown",
    value: s.count ?? 0,
  }));

  // ---------- Pharmacy ----------
  const pharmacy = data.pharmacy ?? {};
  const pharmacyBarData = [
    { name: "Total Rx", value: pharmacy.totalPrescriptions ?? 0 },
    { name: "Paid", value: pharmacy.paidPrescriptions ?? 0 },
    { name: "Unpaid", value: pharmacy.unpaidPrescriptions ?? 0 },
    { name: "Dispensed", value: pharmacy.totalDispenseMedicines ?? 0 },
    { name: "CS Requests", value: pharmacy.centralStoreRequests ?? 0 },
    { name: "Aid Requests", value: pharmacy.aidStoreRequests ?? 0 },
    { name: "CS Transfers", value: pharmacy.centralStoreTransfers ?? 0 },
    { name: "Aid Transfers", value: pharmacy.aidStoreTransfers ?? 0 },
  ].filter((x) => x.value > 0 || true); // keep structure; chart still readable at zero

  // ---------- Maternal & Child ----------
  const maternal = data.maternalChild ?? {};
  const maternalBarData = [
    { name: "Pregnancies", value: maternal.totalPregnancies ?? 0 },
    { name: "ANC", value: maternal.totalANCVisits ?? 0 },
    { name: "PNC", value: maternal.totalPNCVisits ?? 0 },
    { name: "Deliveries", value: maternal.totalDeliveries ?? 0 },
    { name: "Family Planning", value: maternal.totalFamilyPlanning ?? 0 },
    { name: "High-Risk", value: maternal.totalHighRiskPregnancies ?? 0 },
    { name: "Growth", value: maternal.totalGrowthMonitorings ?? 0 },
    { name: "Immunization", value: maternal.totalImmunizations ?? 0 },
    { name: "Nutrition", value: maternal.totalNutritionAssessments ?? 0 },
    { name: "Neonatal", value: maternal.totalNeonatalCares ?? 0 },
    { name: "IMNCI", value: maternal.totalIMNCIEncounters ?? 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="text-gray-500 text-sm">Hospital overview and analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {kpiCards.map((stat, index) => {
          const colors = COLOR_MAP[stat.color] || COLOR_MAP.blue;
          return (
            <div
              key={index}
              className={`bg-white rounded-xl shadow border-l-4 ${colors.border} p-5`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {formatNumber(stat.value)}
                  </h3>
                </div>
                <div className={`p-3 rounded-lg ${colors.bg}`}>
                  <i className={`bi ${stat.icon} text-2xl ${colors.text}`}></i>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Patient & Visit Trend — Line */}
      <div className="bg-white rounded-xl shadow border p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Patient &amp; Visit Trend
        </h3>
        {trendData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="patients"
                name="Patients"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="visits"
                name="Visits"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Department Workload + Appointment Status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow border p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Department Workload
          </h3>
          {departmentData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={departmentData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  height={70}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="doctors" name="Doctors" fill="#8B5CF6" />
                <Bar dataKey="nurses" name="Nurses" fill="#EC4899" />
                <Bar dataKey="appointments" name="Appointments" fill="#F59E0B" />
                <Bar dataKey="referrals" name="Referrals" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow border p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Appointment Status
          </h3>
          {appointmentStatusData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={appointmentStatusData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="Count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Gender + Visit Status + Referral Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow border p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Gender</h3>
          {genderData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {genderData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatNumber(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow border p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Visit Status</h3>
          {visitStatusData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={visitStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {visitStatusData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatNumber(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow border p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Referral Status</h3>
          {referralStatusData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={referralStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {referralStatusData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatNumber(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Laboratory + Pharmacy */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow border p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Laboratory Analytics</h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            <span>Total: <strong>{formatNumber(lab.totalRequests)}</strong></span>
            <span>Pending: <strong>{formatNumber(lab.pendingRequests)}</strong></span>
            <span>Completed: <strong>{formatNumber(lab.completedRequests)}</strong></span>
          </div>
          {labSectionData.length === 0 && labStatusData.length === 0 ? (
            <EmptyChart />
          ) : labSectionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={labSectionData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="tests" name="Tests" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={labStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {labStatusData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow border p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pharmacy Analytics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pharmacyBarData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={55} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Bar dataKey="value" name="Count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Maternal & Child */}
      <div className="bg-white rounded-xl shadow border p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Maternal &amp; Child Health Analytics
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={maternalBarData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => formatNumber(v)} />
            <Bar dataKey="value" name="Count" fill="#EC4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardOverview;