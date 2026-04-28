import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import Chatbot from './Chatbot';

const DEPT_ICONS = { HR: '👤', Operations: '🏭', 'Supply Chain': '🚚', Technology: '💻', Commercial: '📣' };
const DEPT_CLASSES = { HR: 'hr', Operations: 'ops', 'Supply Chain': 'sc', Technology: 'tech', Commercial: 'com' };
const STATUS_COLOR = { 'On Track': 'green', 'At Risk': 'amber', 'Off Track': 'red', Completed: 'blue' };
const STATUS_LABEL = { completed: 'Completed', delayed: 'Delayed', 'in-progress': 'In Progress', upcoming: 'Upcoming' };
const FILE_ICONS = { pptx: '📊', xlsx: '📗', pdf: '📄', docx: '📝', jpg: '🖼', png: '🖼' };

const ALL_SCREENS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'all-projects', label: '📁 All Projects' },
  { id: 'all-actions', label: '☰ Actions' },
  { id: 'reminders-page', label: '🔔 Reminders' },
  { id: 'review-cal', label: '📅 Review Calendar' },
  { id: 'project-detail', label: '📋 Project Detail' },
];

// ─── Login / Signup Page ───
function AuthPage({ onLogin }) {
  const [tab, setTab] = useState('signin');
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const F = (field) => ({ value: form[field] || '', onChange: e => setForm(f => ({ ...f, [field]: e.target.value })) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'signin') {
        if (!form.username || !form.password) { setError('Please fill all fields'); setLoading(false); return; }
        const res = await api.signin({ username: form.username, password: form.password });
        localStorage.setItem('mwb_token', res.access_token);
      } else {
        if (!form.username || !form.email || !form.password) { setError('Please fill all required fields'); setLoading(false); return; }
        if (form.password.length < 4) { setError('Password must be at least 4 characters'); setLoading(false); return; }
        const res = await api.signup({ username: form.username, email: form.email, full_name: form.full_name || '', password: form.password });
        localStorage.setItem('mwb_token', res.access_token);
      }
      const user = await api.getMe();
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Left panel — branding */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand-icon">⚡</div>
          <div className="auth-brand-title">MWB Tracker</div>
          <div className="auth-brand-sub">Strategic Must-Win Battles Management Platform.<br/>Track projects, milestones, actions and team performance.</div>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon blue">📊</div>
              <div className="auth-feature-text"><strong>Dashboard & Analytics</strong><br/>Real-time portfolio overview with stats and progress tracking</div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon green">🏁</div>
              <div className="auth-feature-text"><strong>Milestones & Actions</strong><br/>Track milestones, assign actions, and manage deadlines</div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon amber">👥</div>
              <div className="auth-feature-text"><strong>Team Collaboration</strong><br/>Manage teams, reviews, and stakeholder updates</div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon purple">🔒</div>
              <div className="auth-feature-text"><strong>Role-Based Access</strong><br/>Admin-controlled permissions per screen for every user</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{tab === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
            <p>{tab === 'signin' ? 'Sign in to continue to MWB Tracker' : 'Get started with MWB Tracker'}</p>
          </div>
          <div className="auth-body">
            <div className="auth-tabs">
              <button className={`auth-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => { setTab('signin'); setError(''); setForm({}); }}>Sign In</button>
              <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); setForm({}); }}>Sign Up</button>
            </div>
            {error && <div className="auth-error">⚠ {error}</div>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-row"><label>Username</label><input placeholder="Enter your username" autoFocus {...F('username')} /></div>
              {tab === 'signup' && (
                <>
                  <div className="form-row"><label>Email</label><input type="email" placeholder="you@company.com" {...F('email')} /></div>
                  <div className="form-row"><label>Full Name</label><input placeholder="John Doe" {...F('full_name')} /></div>
                </>
              )}
              <div className="form-row"><label>Password</label><input type="password" placeholder="Enter your password" {...F('password')} /></div>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Please wait...' : tab === 'signin' ? '→ Sign In' : '→ Create Account'}
              </button>
            </form>
            {tab === 'signin' && (
              <>
                <div className="auth-divider">or</div>
                <div className="auth-footer">Demo credentials — <strong>admin</strong> / <strong>admin123</strong></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Panel Component ───
function AdminPanel({ toast }) {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [selectedScreens, setSelectedScreens] = useState([]);

  const loadUsers = async () => { try { setUsers(await api.getUsers()); } catch { } };
  useEffect(() => { loadUsers(); }, []);

  const openPermissions = (u) => {
    setEditUser(u);
    setSelectedScreens(u.permissions.filter(p => p.can_access).map(p => p.screen));
  };

  const savePermissions = async () => {
    await api.setUserPermissions(editUser.id, selectedScreens);
    setEditUser(null);
    loadUsers();
    toast('Permissions updated!');
  };

  const toggleScreen = (s) => {
    setSelectedScreens(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>👥 User Management</h2>

      {/* Permissions Modal */}
      {editUser && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditUser(null)}>
          <div className="modal">
            <div className="modal-header"><h3>Permissions — {editUser.full_name || editUser.username}</h3><button className="modal-close" onClick={() => setEditUser(null)}>✕</button></div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Select which screens this user can access:</p>
              {ALL_SCREENS.map(s => (
                <label key={s.id} className="screen-check">
                  <input type="checkbox" checked={selectedScreens.includes(s.id)} onChange={() => toggleScreen(s.id)} />
                  {s.label}
                </label>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={savePermissions}>Save Permissions</button>
            </div>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Screen Access</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td><strong>{u.full_name || u.username}</strong><br /><span style={{ fontSize: 11, color: '#94a3b8' }}>@{u.username}</span></td>
              <td>{u.email}</td>
              <td><span className={`user-badge ${u.is_admin ? 'admin' : 'user'}`}>{u.is_admin ? 'Admin' : 'User'}</span></td>
              <td><span className={`user-badge ${u.is_active ? 'user' : 'disabled'}`}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
              <td>
                {u.permissions.filter(p => p.can_access).map(p => (
                  <span key={p.id} className="perm-chip active">{p.screen}</span>
                ))}
                {u.permissions.filter(p => p.can_access).length === 0 && <span style={{ fontSize: 12, color: '#94a3b8' }}>None</span>}
              </td>
              <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button className="admin-btn edit" onClick={() => openPermissions(u)}>✏ Permissions</button>
                <button className="admin-btn danger" onClick={async () => { await api.toggleUserActive(u.id, !u.is_active); loadUsers(); toast(u.is_active ? 'User disabled' : 'User enabled'); }}>
                  {u.is_active ? '🚫 Disable' : '✅ Enable'}
                </button>
                {!u.is_admin && <button className="admin-btn success" onClick={async () => { if (!confirm(`Make ${u.username} an admin?`)) return; await api.makeAdmin(u.id); loadUsers(); toast('User promoted to admin!'); }}>⬆ Make Admin</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Toast({ msg, show }) {
  return <div className={`toast ${show ? 'show' : ''}`}><span style={{ color: '#16a34a' }}>✓</span><span>{msg}</span></div>;
}

function Modal({ open, onClose, title, wide, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`}>
        <div className="modal-header"><h3>{title}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Calendar Page Component ───
function CalendarPage({ projects }) {
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return null;
  };

  const allEvents = [];
  projects.forEach(p => {
    (p.reviews || []).forEach(r => {
      const d = parseDate(r.date);
      if (d) allEvents.push({ date: d, type: 'review', title: r.notes?.substring(0, 60) || 'Status Review', project: p.proj_id, projectTitle: p.title, status: r.status, author: r.author, color: 'blue' });
    });
    (p.actions || []).forEach(a => {
      const d = parseDate(a.due);
      if (d) allEvents.push({ date: d, type: 'action', title: a.title?.substring(0, 60), project: p.proj_id, projectTitle: p.title, responsible: a.responsible, priority: a.priority, done: a.done, status: a.status, color: a.done ? 'green' : a.status === 'overdue' ? 'red' : 'amber' });
    });
    (p.reminders || []).forEach(r => {
      const d = parseDate(r.date);
      if (d) allEvents.push({ date: d, type: 'reminder', title: r.text, project: p.proj_id, projectTitle: p.title, freq: r.freq, color: 'purple' });
    });
  });

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const weeks = [];
  let week = new Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week); }

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return allEvents.filter(e => e.date === dateStr);
  };

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); setSelectedDay(null); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); setSelectedDay(null); };
  const goToday = () => { setCalMonth(today.getMonth()); setCalYear(today.getFullYear()); setSelectedDay(today.getDate()); };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const monthPrefix = `${calYear}-${String(calMonth+1).padStart(2,'0')}`;
  const reviewCount = allEvents.filter(e => e.type === 'review' && e.date.startsWith(monthPrefix)).length;
  const actionCount = allEvents.filter(e => e.type === 'action' && e.date.startsWith(monthPrefix)).length;
  const reminderCount = allEvents.filter(e => e.type === 'reminder' && e.date.startsWith(monthPrefix)).length;

  return (
    <div className="page">
      <div className="cal-header-bar">
        <h2 className="cal-page-title">📅 Review Calendar</h2>
        <button className="btn btn-secondary" onClick={goToday} style={{fontSize: 12}}>Today</button>
      </div>

      <div className="cal-legend">
        <span className="cal-legend-item"><span className="cal-dot blue"></span> Reviews ({reviewCount})</span>
        <span className="cal-legend-item"><span className="cal-dot amber"></span> Actions ({actionCount})</span>
        <span className="cal-legend-item"><span className="cal-dot purple"></span> Reminders ({reminderCount})</span>
      </div>

      <div className="cal-layout">
        <div className="cal-card">
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
            <span className="cal-month-label">{MONTH_NAMES[calMonth]} {calYear}</span>
            <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          </div>
          <div className="cal-grid">
            {DAY_NAMES.map(d => <div className="cal-day-name" key={d}>{d}</div>)}
            {weeks.map((w, wi) => w.map((d, di) => {
              const dateStr = d ? `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` : '';
              const dayEvents = d ? getEventsForDay(d) : [];
              const isToday = dateStr === todayStr;
              const isSelected = d === selectedDay;
              const hasReview = dayEvents.some(e => e.type === 'review');
              const hasAction = dayEvents.some(e => e.type === 'action');
              const hasReminder = dayEvents.some(e => e.type === 'reminder');
              return (
                <div
                  key={`${wi}-${di}`}
                  className={`cal-cell${d ? '' : ' empty'}${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}${dayEvents.length > 0 ? ' has-events' : ''}`}
                  onClick={() => d && setSelectedDay(d === selectedDay ? null : d)}
                >
                  {d && (
                    <>
                      <span className="cal-day-num">{d}</span>
                      {dayEvents.length > 0 && (
                        <div className="cal-dots">
                          {hasReview && <span className="cal-dot blue"></span>}
                          {hasAction && <span className="cal-dot amber"></span>}
                          {hasReminder && <span className="cal-dot purple"></span>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            }))}
          </div>
        </div>

        <div className="cal-detail-panel">
          {selectedDay ? (
            <>
              <div className="cal-detail-title">
                {new Date(calYear, calMonth, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              {selectedEvents.length === 0 ? (
                <div className="cal-detail-empty">No events on this day.</div>
              ) : (
                <div className="cal-detail-list">
                  {selectedEvents.map((ev, i) => (
                    <div className={`cal-event-card ${ev.color}`} key={i}>
                      <div className="cal-event-type-badge">
                        {ev.type === 'review' ? '↻ Review' : ev.type === 'action' ? '☰ Action' : '🔔 Reminder'}
                      </div>
                      <div className="cal-event-title">{ev.title}</div>
                      <div className="cal-event-meta">
                        <span>📁 {ev.project}</span>
                        {ev.author && <span>👤 {ev.author}</span>}
                        {ev.responsible && <span>👤 {ev.responsible}</span>}
                        {ev.status && <span className={`status-chip ${ev.status.toLowerCase().replace(' ', '-')}`} style={{fontSize: 10, padding: '1px 8px'}}>{ev.status}</span>}
                        {ev.priority && <span className={`priority-pill ${ev.priority.toLowerCase()}`} style={{fontSize: 10}}>{ev.priority}</span>}
                        {ev.done !== undefined && <span style={{color: ev.done ? 'var(--green)' : 'var(--gray500)', fontWeight: 600}}>{ev.done ? '✓ Done' : '○ Open'}</span>}
                        {ev.freq && <span>🔄 {ev.freq}</span>}
                      </div>
                      <div className="cal-event-project">{ev.projectTitle}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="cal-detail-empty">
              <div style={{fontSize: 32, marginBottom: 8}}>👈</div>
              Select a day to view events
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // ─── Auth State ───
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState('dashboard');
  const [activeProject, setActiveProject] = useState(null);
  const [activeTab, setActiveTab] = useState('charter');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const [prevPage, setPrevPage] = useState('dashboard');
  const [activity, setActivity] = useState([]);
  const [upcomingReviews, setUpcomingReviews] = useState([]);
  const [activeReminders, setActiveReminders] = useState([]);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Modal states
  const [showNewProject, setShowNewProject] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showEditCharter, setShowEditCharter] = useState(false);

  // Edit IDs
  const [editMilestoneId, setEditMilestoneId] = useState(null);
  const [editActionId, setEditActionId] = useState(null);
  const [editTeamId, setEditTeamId] = useState(null);

  // Form states
  const [form, setForm] = useState({});

  const toast = (msg) => { setToastMsg(msg); setToastShow(true); setTimeout(() => setToastShow(false), 2800); };

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => { localStorage.removeItem('mwb_token'); setUser(null); };

  const canAccess = (screen) => {
    if (!user) return false;
    if (user.is_admin) return true;
    return user.permissions?.some(p => p.screen === screen && p.can_access);
  };

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const [p, s, act, rev] = await Promise.all([
        api.getProjects(),
        api.getStats(),
        api.getActivity(),
        api.getUpcomingReviews()
      ]);
      setProjects(p);
      setStats(s);
      setActivity(act);
      setUpcomingReviews(rev);
    } catch (e) { console.error(e); }
  }, [user]);

  const loadProjects = useCallback(async () => {
    if (!user) return;
    try {
      const [p, s] = await Promise.all([api.getProjects(), api.getStats()]);
      setProjects(p);
      setStats(s);
    } catch (e) { console.error(e); }
  }, [user]);

  const refreshProject = useCallback(async () => {
    if (!activeProject) return;
    try {
      const p = await api.getProject(activeProject.id);
      setActiveProject(p);
      const [pj, s] = await Promise.all([api.getProjects(), api.getStats()]);
      setProjects(pj);
      setStats(s);
    } catch (e) { console.error(e); }
  }, [activeProject]);

  // Auth: check token on mount
  useEffect(() => {
    const token = localStorage.getItem('mwb_token');
    if (token) {
      api.getMe().then(u => { setUser(u); setAuthLoading(false); }).catch(() => { localStorage.removeItem('mwb_token'); setAuthLoading(false); });
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Load projects when user is set
  useEffect(() => { if (user) loadDashboardData(); }, [user, loadDashboardData]);

  // Load active reminders and poll every 60s
  const loadActiveReminders = useCallback(async () => {
    if (!user) return;
    try { setActiveReminders(await api.getActiveReminders()); } catch (e) { console.error(e); }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadActiveReminders();
    const interval = setInterval(loadActiveReminders, 60000);
    return () => clearInterval(interval);
  }, [user, loadActiveReminders]);

  const handleCompleteReminder = async (rid) => {
    await api.completeReminder(rid);
    setActiveReminders(prev => prev.filter(r => r.id !== rid));
    toast('Reminder completed!');
  };

  const handleSnoozeReminder = async (rid) => {
    await api.snoozeReminder(rid);
    setActiveReminders(prev => prev.filter(r => r.id !== rid));
    toast('Reminder snoozed for 30 minutes');
  };

  // If loading auth, show spinner
  if (authLoading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#1a1a2e',color:'#fff',fontSize:16 }}><div className="spinner" style={{marginRight:12}}></div>Loading...</div>;

  // If not logged in, show auth page
  if (!user) return <AuthPage onLogin={handleLogin} />;

  const filteredProjects = projects.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (catFilter && p.dept !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.proj_id.toLowerCase().includes(q) || p.lead.toLowerCase().includes(q);
    }
    return true;
  });

  const openProject = async (id) => {
    if (!canAccess('project-detail')) { toast('You don\'t have access to project details'); return; }
    const p = await api.getProject(id);
    setActiveProject(p);
    setActiveTab('charter');
    setPrevPage(page);
    setPage('project-detail');
  };

  const goBack = () => { setPage(prevPage); setActiveProject(null); };

  // ─── Project Card ───
  const ProjectCard = ({ p }) => {
    const sc = STATUS_COLOR[p.status] || 'green';
    const openAc = p.actions.filter(a => !a.done).length;
    const overdueAc = p.actions.filter(a => a.status === 'overdue').length;
    const nextReminder = p.reminders[0]?.date || '';
    return (
      <div className="proj-card" onClick={() => openProject(p.id)}>
        <div className={`proj-card-top-bar ${sc}`} />
        <div className="proj-card-body">
          <div className="proj-meta">
            <span className="proj-id">{p.proj_id}</span>
            <span className={`priority-pill ${p.priority.toLowerCase()}`}>{p.priority.toUpperCase()}</span>
          </div>
          <div className="proj-title">{p.title}</div>
          <div className="proj-dept-row">
            <span className={`dept-tag ${DEPT_CLASSES[p.dept] || 'default'}`}>{p.dept}</span>
            <span className="proj-owner">👤 {p.lead}</span>
          </div>
          <div className="prog-label"><span>Progress</span><span>{p.progress}%</span></div>
          <div className="prog-bar"><div className={`prog-fill ${sc}`} style={{ width: `${p.progress}%` }} /></div>
          <div className="proj-card-footer">
            <span className={`status-chip ${p.status.toLowerCase().replace(' ', '-')}`}>{p.status}</span>
            <div className="card-stats">
              {openAc > 0 && <span className="card-stat">☰ {openAc}</span>}
              {overdueAc > 0 && <span className="card-stat"><span className="dot red" /> {overdueAc}</span>}
            </div>
          </div>
          {nextReminder && <div className="review-due">📅 Next reminder: {nextReminder}</div>}
        </div>
      </div>
    );
  };

  // ─── Stats Grid ───
  const StatsGrid = () => (
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-icon blue">📋</div><div><div className="stat-val">{stats.total || 0}</div><div className="stat-label">Total Projects</div></div></div>
      <div className="stat-card"><div className="stat-icon green">✅</div><div><div className="stat-val">{stats.on_track || 0}</div><div className="stat-label">On Track</div></div></div>
      <div className="stat-card"><div className="stat-icon amber">⚠</div><div><div className="stat-val">{stats.at_risk || 0}</div><div className="stat-label">At Risk</div></div></div>
      <div className="stat-card"><div className="stat-icon red">✖</div><div><div className="stat-val">{stats.off_track || 0}</div><div className="stat-label">Off Track</div></div></div>
      <div className="stat-card"><div className="stat-icon purple">☰</div><div><div className="stat-val">{stats.open_actions || 0}</div><div className="stat-label">Open Actions</div></div></div>
      <div className="stat-card"><div className="stat-icon pink">⏰</div><div><div className="stat-val">{stats.overdue_actions || 0}</div><div className="stat-label">Overdue Actions</div></div></div>
    </div>
  );

  // ─── Detail Header ───
  const DetailHeader = () => {
    if (!activeProject) return null;
    const p = activeProject;
    const sc = STATUS_COLOR[p.status] || 'green';
    const colors = { green: '#16a34a', amber: '#d97706', red: '#dc2626', blue: '#2563eb' };
    const color = colors[sc];
    const r = 28, cx = 35, cy = 35, circ = 2 * Math.PI * r;
    const dashArr = (p.progress / 100) * circ;
    const iconBg = { HR: '#fdf2f8', Operations: '#fff7ed', 'Supply Chain': '#ecfeff', Technology: '#eff6ff', Commercial: '#f5f3ff' }[p.dept] || '#f1f5f9';
    return (
      <div className="proj-header-card">
        <div className="proj-icon-big" style={{ background: iconBg }}>{DEPT_ICONS[p.dept] || '📋'}</div>
        <div className="proj-header-info">
          <div className="proj-header-id">{p.proj_id}</div>
          <div className="proj-header-title">{p.title}</div>
          <div className="proj-header-meta">
            <span className="meta-item">👤 Sponsor: <strong>{p.sponsor}</strong></span>
            <span className="meta-item">👤 Lead: <strong>{p.lead}</strong></span>
            <span className="meta-item">📅 {p.start} → {p.end}</span>
            <span className="meta-item">🏢 {p.dept}</span>
            <span className="ai-badge">🤖 AI Assessment Pending</span>
          </div>
        </div>
        <div className="proj-header-right">
          <span className={`status-badge ${p.status.toLowerCase().replace(' ', '-')}`}>{p.status}</span>
          <div className="progress-ring-wrap">
            <svg className="ring-svg" viewBox="0 0 70 70">
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
                strokeDasharray={`${dashArr.toFixed(1)} ${circ.toFixed(1)}`}
                strokeDashoffset={(circ / 4).toFixed(1)} strokeLinecap="round" />
              <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>{p.progress}%</text>
            </svg>
            <div className="progress-ring-label">Overall Progress</div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Charter Tab ───
  const CharterTab = () => {
    const p = activeProject;
    if (!p) return null;
    return (
      <>
        <div className="charter-section"><h3>ℹ Project Background</h3><p className="info-text">{p.background || 'No background set.'}</p></div>
        <div className="charter-grid" style={{ marginBottom: 14 }}>
          <div className="charter-section"><h3>🎯 Scope & Success Criteria</h3><p className="info-text">{p.scope || '—'}</p></div>
          <div className="charter-section"><h3>🚫 Out of Scope</h3><p className="info-text">{p.out_of_scope || '—'}</p></div>
        </div>
        <div className="charter-grid" style={{ marginBottom: 14 }}>
          <div className="charter-section"><h3>🏆 Deliverables & KPIs</h3><p className="info-text">{p.kpis || '—'}</p></div>
          <div className="charter-section"><h3>⚠ Risks</h3><p className="info-text">{p.risks || '—'}</p></div>
        </div>
        {p.bg_url && <div className="charter-section"><h3>🔗 Background Material</h3><a href={p.bg_url} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontSize: 13 }}>↗ {p.bg_url}</a></div>}
      </>
    );
  };

  // ─── Milestones Tab ───
  const MilestonesTab = () => {
    const p = activeProject;
    if (!p) return null;
    const done = p.milestones.filter(m => m.status === 'completed').length;
    const pct = p.milestones.length ? Math.round((done / p.milestones.length) * 100) : 0;
    return (
      <>
        <div className="section-action-bar"><h3 /><button className="add-btn" onClick={() => { setEditMilestoneId(null); setForm({ title: '', planned: '', actual: '', status: 'upcoming', owner: '', note: '' }); setShowMilestone(true); }}>+ Add Milestone</button></div>
        <div className="milestone-progress-bar">
          <span>🏁</span>
          <span className="mile-prog-text">{done} of {p.milestones.length} milestones completed</span>
          <div className="mile-prog-bar"><div className="mile-prog-fill" style={{ width: `${pct}%` }} /></div>
          <span className="mile-prog-pct">{pct}%</span>
        </div>
        <div className="milestone-list">
          {p.milestones.map((m, i) => (
            <div className="milestone-item" key={m.id}>
              <div className="mile-dot-col">
                <div className={`mile-dot ${m.status}`} />
                {i < p.milestones.length - 1 && <div className="mile-connector" />}
              </div>
              <div className="mile-body">
                <div className="mile-title"><span>#{i + 1}</span>{m.title}</div>
                <div className="mile-dates">
                  <span>📅 Planned: {m.planned || 'TBD'}</span>
                  {m.actual && <span className="actual">✓ Actual: {m.actual}</span>}
                </div>
                {m.note && <div className="mile-note">🗒 {m.note}</div>}
              </div>
              <span className={`mile-status-chip ${m.status}`}>{STATUS_LABEL[m.status] || m.status}</span>
              <div className="mile-actions-icons">
                <button className="icon-btn" onClick={() => { setEditMilestoneId(m.id); setForm({ title: m.title, planned: m.planned, actual: m.actual, status: m.status, owner: m.owner, note: m.note }); setShowMilestone(true); }}>✏</button>
                <button className="icon-btn del" onClick={async () => { if (!confirm('Delete this milestone?')) return; await api.deleteMilestone(m.id); refreshProject(); toast('Milestone deleted'); }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  // ─── Actions Tab ───
  const ActionsTab = () => {
    const p = activeProject;
    if (!p) return null;
    const statusChip = (s) => <span className={`action-status ${s}`}>● {s === 'overdue' ? 'Overdue' : s === 'open' ? 'Open' : 'Complete'}</span>;
    return (
      <>
        <div className="section-action-bar"><h3 /><button className="add-btn" onClick={() => { setEditActionId(null); setForm({ title: '', responsible: '', due: '', priority: 'High', status: 'open', comment: '', done: false }); setShowAction(true); }}>+ Add Action</button></div>
        {p.actions.length === 0 ? <div className="empty-state"><div className="empty-icon">☰</div>No actions yet.</div> :
          p.actions.map(a => (
            <div className={`action-item ${a.done ? 'complete' : 'open'}`} key={a.id}>
              <input type="checkbox" className="cb" checked={a.done} onChange={async () => { await api.toggleAction(a.id); refreshProject(); toast(a.done ? 'Action reopened' : 'Action complete!'); }} />
              <div className="action-body">
                <div className={`action-title ${a.done ? 'done-text' : ''}`}>{a.title}</div>
                <div className="action-meta-row">
                  <span>👤 {a.responsible}</span><span>📅 Due: {a.due}</span><span>🏴 {a.priority}</span>
                  {statusChip(a.status)}
                </div>
                {a.comment && <div className="action-comment">💬 {a.comment}</div>}
              </div>
              <div className="mile-actions-icons">
                <button className="icon-btn" onClick={() => { setEditActionId(a.id); setForm({ title: a.title, responsible: a.responsible, due: a.due, priority: a.priority, status: a.status, comment: a.comment, done: a.done }); setShowAction(true); }}>✏</button>
                <button className="icon-btn del" onClick={async () => { if (!confirm('Delete?')) return; await api.deleteAction(a.id); refreshProject(); toast('Action deleted'); }}>🗑</button>
              </div>
            </div>
          ))}
      </>
    );
  };

  // ─── Team Tab ───
  const TeamTab = () => {
    const p = activeProject;
    if (!p) return null;
    const roleLabel = { sponsor: 'SPONSOR', lead: 'PROJECT LEAD', member: 'MEMBER' };
    return (
      <>
        <div className="section-action-bar"><h3 /><button className="add-btn" onClick={() => { setEditTeamId(null); setForm({ name: '', role: 'member', email: '', dept: '', load: 0, color: '#2563eb' }); setShowTeam(true); }}>👤+ Add Member</button></div>
        <div className="team-grid">
          {p.team_members.map(m => (
            <div className="team-card" key={m.id}>
              <div className="team-av" style={{ background: m.color }}>{m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
              <div className="team-name">{m.name}</div>
              <span className={`team-role-chip ${m.role}`}>{roleLabel[m.role] || 'MEMBER'}</span>
              <div className="team-email">✉ {m.email}</div>
              <div className="team-dept">🏢 {m.dept}</div>
              <div className="team-load">⏰ {m.load} days load</div>
              <div className="team-card-actions">
                <button className="icon-btn" onClick={() => { setEditTeamId(m.id); setForm({ name: m.name, role: m.role, email: m.email, dept: m.dept, load: m.load, color: m.color }); setShowTeam(true); }}>✏</button>
                <button className="icon-btn del" onClick={async () => { if (!confirm('Remove?')) return; await api.deleteTeamMember(m.id); refreshProject(); toast('Member removed'); }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  // ─── Reviews Tab ───
  const ReviewsTab = () => {
    const p = activeProject;
    if (!p) return null;
    return (
      <>
        <div className="section-action-bar"><h3 /><button className="add-btn" onClick={() => { setForm({ status: 'On Track', progress: '', notes: '', author: '', date: new Date().toISOString().split('T')[0] }); setShowReview(true); }}>+ Add Review</button></div>
        {p.reviews.length === 0 ? <div className="empty-state"><div className="empty-icon">↻</div>No reviews yet.</div> :
          p.reviews.map(r => (
            <div className="review-card" key={r.id}>
              <div className="review-header">
                <div className="review-av" style={{ background: r.color }}>{r.initials}</div>
                <div><span className="review-author">{r.author}</span><span className="review-date">{r.date}</span></div>
                <span className={`status-chip ${r.status.toLowerCase().replace(' ', '-')}`} style={{ marginLeft: 'auto' }}>{r.status}</span>
                {r.progress != null && <span style={{ fontSize: 12, color: 'var(--gray500)', marginLeft: 8 }}>{r.progress}%</span>}
              </div>
              <div className="review-body">{r.notes}</div>
            </div>
          ))}
      </>
    );
  };

  // ─── Attachments Tab ───
  const AttachmentsTab = () => {
    const p = activeProject;
    if (!p) return null;
    const simulateUpload = async () => {
      const files = [['Q4_Update.pptx', 'pptx', '3.4 MB'], ['Budget_Sheet.xlsx', 'xlsx', '890 KB'], ['Risk_Matrix.pdf', 'pdf', '1.2 MB']];
      const f = files[Math.floor(Math.random() * files.length)];
      await api.createAttachment(p.id, { name: f[0], type: f[1], size: f[2], uploader: 'Program Manager', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) });
      refreshProject(); toast('File uploaded!');
    };
    return (
      <>
        <div className="section-action-bar"><h3>Attachments ({p.attachments.length})</h3></div>
        {p.attachments.map(a => (
          <div className="att-item" key={a.id}>
            <div className="att-icon">{FILE_ICONS[a.type] || '📁'}</div>
            <div className="att-body"><div className="att-name">{a.name}</div><div className="att-meta">{a.size} · Uploaded by {a.uploader} · {a.date}</div></div>
            <button className="att-remove" onClick={async () => { if (!confirm('Remove?')) return; await api.deleteAttachment(a.id); refreshProject(); toast('File removed'); }}>✕</button>
          </div>
        ))}
        <div className="upload-zone" onClick={simulateUpload}>📎 Click to upload file (PPT, Excel, PDF, Images…)</div>
      </>
    );
  };

  // ─── Reminders Tab ───
  const RemindersTab = () => {
    const p = activeProject;
    if (!p) return null;
    return (
      <>
        <div className="section-action-bar"><h3 /><button className="add-btn" onClick={() => { setForm({ text: '', date: '', freq: 'One-time', notify: '' }); setShowReminder(true); }}>+ Add Reminder</button></div>
        {p.reminders.length === 0 ? <div className="empty-state"><div className="empty-icon">🔔</div>No reminders set.</div> :
          p.reminders.map(r => (
            <div className="reminder-item" key={r.id}>
              <div className="reminder-icon-wrap">🔔</div>
              <div className="rem-body"><div className="rem-title">{r.text}</div><div className="rem-meta">{r.freq} · {r.date}{r.notify ? ` · 📧 ${r.notify}` : ''}</div></div>
              <button className="rem-remove" onClick={async () => { await api.deleteReminder(r.id); refreshProject(); toast('Reminder removed'); }}>✕</button>
            </div>
          ))}
      </>
    );
  };

  // ─── All Actions Page ───
  const AllActionsPage = () => (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>All Actions</h2>
      {projects.filter(p => p.actions.some(a => !a.done)).length === 0
        ? <div className="empty-state"><div className="empty-icon">☰</div>No open actions across all projects.</div>
        : projects.map(p => {
          const open = p.actions.filter(a => !a.done);
          if (!open.length) return null;
          return (
            <div key={p.id}>
              <div className="action-proj-label">{p.proj_id} — {p.title}</div>
              {open.map(a => (
                <div className="action-item open" key={a.id} style={{ marginBottom: 8 }}>
                  <div className="action-body">
                    <div className="action-title">{a.title}</div>
                    <div className="action-meta-row">
                      <span>👤 {a.responsible}</span><span>📅 {a.due}</span><span>🏴 {a.priority}</span>
                      <span className={`action-status ${a.status}`}>{a.status === 'overdue' ? 'Overdue' : 'Open'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
    </div>
  );

  // ─── All Reminders Page ───
  const AllRemindersPage = () => (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>All Reminders</h2>
      {projects.filter(p => p.reminders.length > 0).length === 0
        ? <div className="empty-state"><div className="empty-icon">🔔</div>No reminders across any project.</div>
        : projects.map(p => {
          if (!p.reminders.length) return null;
          return (
            <div key={p.id}>
              <div className="action-proj-label">{p.proj_id} — {p.title}</div>
              {p.reminders.map(r => (
                <div className="reminder-item" key={r.id} style={{ marginBottom: 8 }}>
                  <div className="reminder-icon-wrap">🔔</div>
                  <div className="rem-body"><div className="rem-title">{r.text}</div><div className="rem-meta">{r.freq} · {r.date}</div></div>
                </div>
              ))}
            </div>
          );
        })}
    </div>
  );

  // ─── Save Handlers ───
  const saveNewProject = async () => {
    if (!form.title?.trim()) { toast('Title required'); return; }
    await api.createProject({
      proj_id: form.proj_id || `MWB-${projects.length + 1}`, title: form.title, dept: form.dept || 'HR',
      status: form.status || 'On Track', priority: form.priority || 'Medium', progress: 0,
      sponsor: form.sponsor || '', lead: form.lead || '', start: form.start || '', end: form.end || '',
      background: form.background || '', scope: form.scope || '', out_of_scope: '', kpis: form.kpis || '', risks: '', bg_url: '',
    });
    setShowNewProject(false); loadProjects(); toast('Project created!');
  };

  const saveMilestoneHandler = async () => {
    if (!form.title?.trim()) { toast('Title required'); return; }
    const data = { title: form.title, planned: form.planned || '', actual: form.actual || '', status: form.status || 'upcoming', owner: form.owner || '', note: form.note || '' };
    if (editMilestoneId) await api.updateMilestone(editMilestoneId, data);
    else await api.createMilestone(activeProject.id, data);
    setShowMilestone(false); refreshProject(); toast('Milestone saved!');
  };

  const saveActionHandler = async () => {
    if (!form.title?.trim()) { toast('Description required'); return; }
    const st = form.status || 'open';
    const data = { title: form.title, responsible: form.responsible || '', due: form.due || '', priority: form.priority || 'High', status: st, comment: form.comment || '', done: st === 'complete' };
    if (editActionId) await api.updateAction(editActionId, data);
    else await api.createAction(activeProject.id, data);
    setShowAction(false); refreshProject(); toast('Action saved!');
  };

  const saveTeamHandler = async () => {
    if (!form.name?.trim()) { toast('Name required'); return; }
    const data = { name: form.name, role: form.role || 'member', email: form.email || '', dept: form.dept || '', load: parseInt(form.load) || 0, color: form.color || '#2563eb' };
    if (editTeamId) await api.updateTeamMember(editTeamId, data);
    else await api.createTeamMember(activeProject.id, data);
    setShowTeam(false); refreshProject(); toast('Team member saved!');
  };

  const saveReviewHandler = async () => {
    if (!form.notes?.trim()) { toast('Notes required'); return; }
    const author = form.author || 'Program Manager';
    const initials = author.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['#dc2626', '#7c3aed', '#0891b2', '#16a34a', '#d97706', '#2563eb'];
    const d = new Date(form.date || Date.now());
    await api.createReview(activeProject.id, {
      author, initials, color: colors[Math.floor(Math.random() * colors.length)],
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: form.status, notes: form.notes, progress: form.progress ? parseInt(form.progress) : null,
    });
    setShowReview(false); refreshProject(); toast('Review posted!');
  };

  const saveReminderHandler = async () => {
    if (!form.text?.trim()) { toast('Text required'); return; }
    await api.createReminder(activeProject.id, { text: form.text, date: form.date || '', freq: form.freq || 'One-time', notify: form.notify || '' });
    setShowReminder(false); refreshProject(); toast('Reminder set!');
  };

  const saveCharterHandler = async () => {
    await api.updateProject(activeProject.id, {
      proj_id: form.proj_id, title: form.title, dept: form.dept, status: form.status, priority: form.priority,
      sponsor: form.sponsor, lead: form.lead, start: form.start, end: form.end, progress: parseInt(form.progress) || 0,
      background: form.background, scope: form.scope, out_of_scope: form.out_of_scope, kpis: form.kpis, risks: form.risks, bg_url: form.bg_url,
    });
    setShowEditCharter(false); refreshProject(); toast('Charter saved!');
  };

  const openEditCharterModal = () => {
    const p = activeProject;
    setForm({ proj_id: p.proj_id, title: p.title, dept: p.dept, status: p.status, priority: p.priority, sponsor: p.sponsor, lead: p.lead, start: p.start, end: p.end, progress: p.progress, background: p.background, scope: p.scope, out_of_scope: p.out_of_scope, kpis: p.kpis, risks: p.risks, bg_url: p.bg_url });
    setShowEditCharter(true);
  };

  const handleDeleteProject = async () => {
    if (!user.is_admin) return toast('Admin access required.');
    if (!window.confirm(`Are you SURE you want to delete the project "${activeProject.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteProject(activeProject.id);
      toast('Project deleted successfully.');
      loadDashboard();
      setPage('dashboard');
    } catch (e) {
      toast('Failed to delete project.');
    }
  };

  const F = (field) => ({ value: form[field] || '', onChange: e => setForm(f => ({ ...f, [field]: e.target.value })) });

  // Page titles
  const pageTitles = { dashboard: 'Dashboard', 'all-projects': 'All Projects', 'all-actions': 'Actions', 'reminders-page': 'Reminders', 'review-cal': 'Review Calendar', admin: 'User Management' };
  const topTitle = page === 'project-detail' && activeProject ? `${activeProject.proj_id} — ${activeProject.title}` : pageTitles[page] || '';

  const tabs = ['charter', 'milestones', 'actions', 'team', 'reviews', 'attachments', 'reminders'];
  const tabLabels = { charter: '📋 Charter', milestones: '🏁 Milestones', actions: '☰ Actions', team: '👥 Team', reviews: '↻ Reviews', attachments: '📎 Attachments', reminders: '🔔 Reminders' };

  const navigateTo = (pg) => { setPage(pg); setSidebarOpen(false); };

  return (
    <>
      {/* SIDEBAR OVERLAY (mobile) */}
      {sidebarOpen && <div className="sidebar-overlay open" onClick={() => setSidebarOpen(false)} />}
      {/* SIDEBAR */}
      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">⚡</div>
          <div className="brand-name">MWB Tracker</div>
          <div className="brand-sub">Must-Win Battles</div>
        </div>
        <nav className="sidebar-nav">
          {[['dashboard', '📊', 'Dashboard'], ['all-projects', '📁', 'All Projects'], ['all-actions', '☰', 'Actions'], ['reminders-page', '🔔', 'Reminders'], ['review-cal', '📅', 'Review Calendar']].map(([id, icon, label]) => (
            canAccess(id) && <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => navigateTo(id)}>
              <span className="ni">{icon}</span> {label}
            </button>
          ))}
          {user.is_admin && (
            <button className={`nav-item ${page === 'admin' ? 'active' : ''}`} onClick={() => navigateTo('admin')}>
              <span className="ni">⚙</span> User Management
            </button>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="new-project-btn" onClick={() => { setForm({}); setShowNewProject(true); setSidebarOpen(false); }}>+ New Project</button>
          <button className="nav-item" onClick={handleLogout} style={{ marginTop: 8, color: '#f87171' }}>
            <span className="ni">🚪</span> Sign Out
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="main-wrap">
        <div className="topbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="topbar-title">{topTitle}</div>
          <div className="topbar-search"><span className="search-icon">🔍</span><input placeholder="Search projects, actions..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="topbar-actions">
            <button className="topbar-btn" onClick={loadProjects}>↻</button>
            <div className="user-av" title={`${user.full_name || user.username}${user.is_admin ? ' (Admin)' : ''}`}>{(user.full_name || user.username).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
          </div>
        </div>
        {/* DASHBOARD */}
        {page === 'dashboard' && (
          <div className="page">
            <StatsGrid />
            <div className="dashboard-grid">
              <div className="dashboard-main">
                <div className="card">
                  <div className="card-header"><h2>Project Portfolio</h2></div>
                  <div className="card-body" style={{padding: '8px'}}>
                    <div className="filter-row" style={{padding: '0 12px 8px'}}>
                      <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">All Statuses</option>
                        {['On Track', 'At Risk', 'Off Track', 'Completed'].map(s => <option key={s}>{s}</option>)}
                      </select>
                      <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                        <option value="">All Categories</option>
                        {['HR', 'Operations', 'Supply Chain', 'Technology', 'Commercial'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="projects-grid">
                      {filteredProjects.slice(0, 5).map(p => <ProjectCard key={p.id} p={p} />)}
                    </div>
                  </div>
                  <div className="card-footer"><a href="#" onClick={(e) => {e.preventDefault(); setPage('all-projects')}}>View All Projects →</a></div>
                </div>
              </div>
              <div className="dashboard-side">
                <div className="card">
                  <div className="card-header"><h2>Recent Activity</h2></div>
                  <div className="card-body">
                    <div className="activity-feed">
                      {activity.length === 0 ? <div className="empty-state small">No recent activity.</div> : (showAllActivity ? activity : activity.slice(0, 5)).map(a => (
                        <div className="activity-item" key={a.id}>
                          <div className="activity-icon" style={{ background: `var(--${a.color}-light)`, color: `var(--${a.color})` }}>
                            {a.icon === 'add' ? '+' : a.icon === 'edit' ? '✏' : a.icon === 'delete' ? '✕' : a.icon === 'check' ? '✓' : '!'}
                          </div>
                          <div>
                            <div className="activity-text" dangerouslySetInnerHTML={{ __html: a.text.replace(/'([^']*)'/g, "<strong>$1</strong>") }}></div>
                            <div className="activity-time">{new Date(a.timestamp).toLocaleString()} by {a.user_name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {activity.length > 5 && (
                      <div className="view-more-container" style={{ textAlign: 'center', marginTop: '12px' }}>
                        <button className="btn btn-secondary" onClick={() => setShowAllActivity(!showAllActivity)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                          {showAllActivity ? 'Show Less' : `View More (${activity.length - 5} older)`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card">
                  <div className="card-header"><h2>Upcoming Reviews</h2></div>
                  <div className="card-body">
                    <div className="review-list">
                      {upcomingReviews.length === 0 ? <div className="empty-state small">No upcoming reviews.</div> : (showAllReviews ? upcomingReviews : upcomingReviews.slice(0, 5)).map(r => (
                        <div className="review-item" key={`${r.type || 'r'}-${r.id}`}>
                          <div className="review-date-box">
                            {r.date && /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? (
                              <>
                                <div className="month">{new Date(r.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                                <div className="day">{new Date(r.date).getDate()}</div>
                              </>
                            ) : (
                              <>
                                <div className="month" style={{fontSize: 9}}>{r.date?.split(' ')[1] || ''}</div>
                                <div className="day">{r.date?.split(' ')[0] || '—'}</div>
                              </>
                            )}
                          </div>
                          <div className="review-item-info">
                            <strong>{projects.find(p => p.id === r.project_id)?.proj_id || 'Project'}</strong>
                            <span>{r.text}</span>
                            {r.author && <span style={{fontSize: 11, color: '#94a3b8'}}>by {r.author}</span>}
                          </div>
                          {r.status && <span className={`status-chip ${r.status.toLowerCase().replace(' ', '-')}`} style={{fontSize: 10, padding: '2px 8px', marginLeft: 'auto', flexShrink: 0}}>{r.status}</span>}
                        </div>
                      ))}
                    </div>
                    {upcomingReviews.length > 5 && (
                      <div className="view-more-container" style={{ textAlign: 'center', marginTop: '12px' }}>
                        <button className="btn btn-secondary" onClick={() => setShowAllReviews(!showAllReviews)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                          {showAllReviews ? 'Show Less' : `View More (${upcomingReviews.length - 5} more)`}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="card-footer"><a href="#" onClick={(e) => {e.preventDefault(); setPage('review-cal')}}>View Calendar →</a></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ALL PROJECTS */}
        {page === 'all-projects' && (
          <div className="page">
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>All Projects</h2>
            <div className="projects-grid">{projects.map(p => <ProjectCard key={p.id} p={p} />)}</div>
          </div>
        )}

        {/* ALL ACTIONS */}
        {page === 'all-actions' && <AllActionsPage />}

        {/* REMINDERS */}
        {page === 'reminders-page' && <AllRemindersPage />}

        {/* REVIEW CALENDAR */}
        {page === 'review-cal' && <CalendarPage projects={projects} />}

        {/* ADMIN */}
        {page === 'admin' && user.is_admin && <AdminPanel toast={toast} />}

        {/* NO ACCESS */}
        {!['dashboard', 'all-projects', 'all-actions', 'reminders-page', 'review-cal', 'project-detail', 'admin'].includes(page) && (
          <div className="page"><div className="empty-state"><div className="empty-icon">🔒</div>You don't have access to this page.</div></div>
        )}

        {/* PROJECT DETAIL */}
        {page === 'project-detail' && activeProject && (
          <div className="page">
            <div className="back-bar">
              <button className="back-btn" onClick={goBack}>← Back to Portfolio</button>
              <div className="back-bar-right">
                {user.is_admin && <button className="topbar-btn" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={handleDeleteProject}>🗑 Delete</button>}
                <button className="topbar-btn" onClick={openEditCharterModal}>✏ Edit Charter</button>
                <button className="topbar-btn primary" onClick={() => { setForm({ status: 'On Track', progress: '', notes: '', author: '', date: new Date().toISOString().split('T')[0] }); setShowReview(true); }}>+ Add Review</button>
              </div>
            </div>
            <DetailHeader />
            <div className="tabs-bar">
              {tabs.map(t => <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{tabLabels[t]}</button>)}
            </div>
            {activeTab === 'charter' && <CharterTab />}
            {activeTab === 'milestones' && <MilestonesTab />}
            {activeTab === 'actions' && <ActionsTab />}
            {activeTab === 'team' && <TeamTab />}
            {activeTab === 'reviews' && <ReviewsTab />}
            {activeTab === 'attachments' && <AttachmentsTab />}
            {activeTab === 'reminders' && <RemindersTab />}
          </div>
        )}
      </div>

      {/* ═══ MODALS ═══ */}

      {/* New Project */}
      <Modal open={showNewProject} onClose={() => setShowNewProject(false)} title="+ New Must-Win Battle"
        footer={<><button className="btn btn-secondary" onClick={() => setShowNewProject(false)}>Cancel</button><button className="btn btn-primary" onClick={saveNewProject}>Create Battle</button></>}>
        <div className="form-grid-2">
          <div className="form-row"><label>Project ID</label><input placeholder="MWB-HR-06" {...F('proj_id')} /></div>
          <div className="form-row"><label>Priority</label><select {...F('priority')}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div>
        </div>
        <div className="form-row"><label>Title *</label><input placeholder="Project title..." {...F('title')} /></div>
        <div className="form-grid-2">
          <div className="form-row"><label>Department</label><select {...F('dept')}><option value="HR">HR</option><option value="Operations">Operations</option><option value="Supply Chain">Supply Chain</option><option value="Technology">Technology</option><option value="Commercial">Commercial</option></select></div>
          <div className="form-row"><label>Status</label><select {...F('status')}><option>On Track</option><option>At Risk</option><option>Off Track</option><option>Completed</option></select></div>
        </div>
        <div className="form-grid-2">
          <div className="form-row"><label>Sponsor</label><input placeholder="Name" {...F('sponsor')} /></div>
          <div className="form-row"><label>Project Lead</label><input placeholder="Name" {...F('lead')} /></div>
        </div>
        <div className="form-grid-2">
          <div className="form-row"><label>Start Date</label><input type="date" {...F('start')} /></div>
          <div className="form-row"><label>End Date</label><input type="date" {...F('end')} /></div>
        </div>
        <div className="form-row"><label>Background</label><textarea placeholder="Project background..." {...F('background')} /></div>
        <div className="form-row"><label>Objective</label><textarea placeholder="Scope and success criteria..." {...F('scope')} /></div>
        <div className="form-row"><label>KPI / Target</label><input placeholder="e.g. Attrition < 10%" {...F('kpis')} /></div>
      </Modal>

      {/* Milestone */}
      <Modal open={showMilestone} onClose={() => setShowMilestone(false)} title={editMilestoneId ? 'Edit Milestone' : 'Add Milestone'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowMilestone(false)}>Cancel</button><button className="btn btn-primary" onClick={saveMilestoneHandler}>Save Milestone</button></>}>
        <div className="form-row"><label>Milestone Title *</label><input placeholder="e.g. Leadership Academy Launch" {...F('title')} /></div>
        <div className="form-grid-2">
          <div className="form-row"><label>Planned Date</label><input type="date" {...F('planned')} /></div>
          <div className="form-row"><label>Actual Date</label><input type="date" {...F('actual')} /></div>
        </div>
        <div className="form-grid-2">
          <div className="form-row"><label>Status</label><select {...F('status')}><option value="upcoming">Upcoming</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="delayed">Delayed</option></select></div>
          <div className="form-row"><label>Owner</label><input placeholder="Responsible person" {...F('owner')} /></div>
        </div>
        <div className="form-row"><label>Note</label><input placeholder="Progress note..." {...F('note')} /></div>
      </Modal>

      {/* Action */}
      <Modal open={showAction} onClose={() => setShowAction(false)} title={editActionId ? 'Edit Action' : 'Add Action'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowAction(false)}>Cancel</button><button className="btn btn-primary" onClick={saveActionHandler}>Save Action</button></>}>
        <div className="form-row"><label>Action Description *</label><textarea placeholder="Describe the action item..." {...F('title')} /></div>
        <div className="form-grid-2">
          <div className="form-row"><label>Responsible</label><input placeholder="Person responsible" {...F('responsible')} /></div>
          <div className="form-row"><label>Due Date</label><input type="date" {...F('due')} /></div>
        </div>
        <div className="form-grid-2">
          <div className="form-row"><label>Priority</label><select {...F('priority')}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div>
          <div className="form-row"><label>Status</label><select {...F('status')}><option value="open">Open</option><option value="overdue">Overdue</option><option value="complete">Complete</option></select></div>
        </div>
        <div className="form-row"><label>Comment</label><input placeholder="Additional context..." {...F('comment')} /></div>
      </Modal>

      {/* Team */}
      <Modal open={showTeam} onClose={() => setShowTeam(false)} title={editTeamId ? 'Edit Member' : 'Add Team Member'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowTeam(false)}>Cancel</button><button className="btn btn-primary" onClick={saveTeamHandler}>Add Member</button></>}>
        <div className="form-grid-2">
          <div className="form-row"><label>Full Name *</label><input placeholder="Full name" {...F('name')} /></div>
          <div className="form-row"><label>Role</label><select {...F('role')}><option value="member">Member</option><option value="lead">Project Lead</option><option value="sponsor">Sponsor</option></select></div>
        </div>
        <div className="form-grid-2">
          <div className="form-row"><label>Email</label><input placeholder="email@company.com" {...F('email')} /></div>
          <div className="form-row"><label>Department</label><input placeholder="HR, Finance, Ops..." {...F('dept')} /></div>
        </div>
        <div className="form-row"><label>Workload (days)</label><input type="number" placeholder="e.g. 45" {...F('load')} /></div>
        <div className="form-row"><label>Avatar Color</label><select {...F('color')}>
          <option value="#dc2626">Red</option><option value="#7c3aed">Purple</option><option value="#0891b2">Cyan</option>
          <option value="#16a34a">Green</option><option value="#d97706">Amber</option><option value="#2563eb">Blue</option>
          <option value="#db2777">Pink</option><option value="#0f172a">Dark</option>
        </select></div>
      </Modal>

      {/* Review */}
      <Modal open={showReview} onClose={() => setShowReview(false)} title="Post Status Review"
        footer={<><button className="btn btn-secondary" onClick={() => setShowReview(false)}>Cancel</button><button className="btn btn-primary" onClick={saveReviewHandler}>Post Review</button></>}>
        <div className="form-grid-2">
          <div className="form-row"><label>Overall Status</label><select {...F('status')}><option>On Track</option><option>At Risk</option><option>Off Track</option><option>Completed</option></select></div>
          <div className="form-row"><label>Progress %</label><input type="number" min="0" max="100" placeholder="0-100" {...F('progress')} /></div>
        </div>
        <div className="form-row"><label>Review Notes *</label><textarea placeholder="Highlights, blockers, risks, next steps..." {...F('notes')} /></div>
        <div className="form-grid-2">
          <div className="form-row"><label>Reviewed By</label><input placeholder="Your name" {...F('author')} /></div>
          <div className="form-row"><label>Review Date</label><input type="date" {...F('date')} /></div>
        </div>
      </Modal>

      {/* Reminder */}
      <Modal open={showReminder} onClose={() => setShowReminder(false)} title="Add Reminder"
        footer={<><button className="btn btn-secondary" onClick={() => setShowReminder(false)}>Cancel</button><button className="btn btn-primary" onClick={saveReminderHandler}>Set Reminder</button></>}>
        <div className="form-row"><label>Reminder Text *</label><input placeholder="e.g. Monthly review update due" {...F('text')} /></div>
        <div className="form-grid-2">
          <div className="form-row"><label>Date</label><input type="date" {...F('date')} /></div>
          <div className="form-row"><label>Frequency</label><select {...F('freq')}><option>One-time</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option></select></div>
        </div>
        <div className="form-row"><label>Notify</label><input placeholder="email@company.com (optional)" {...F('notify')} /></div>
      </Modal>

      {/* Edit Charter */}
      <Modal open={showEditCharter} onClose={() => setShowEditCharter(false)} title="Edit Charter" wide
        footer={<><button className="btn btn-secondary" onClick={() => setShowEditCharter(false)}>Cancel</button><button className="btn btn-primary" onClick={saveCharterHandler}>Save Charter</button></>}>
        <div className="form-grid-2">
          <div className="form-row"><label>Project ID</label><input {...F('proj_id')} /></div>
          <div className="form-row"><label>Priority</label><select {...F('priority')}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div>
        </div>
        <div className="form-row"><label>Title *</label><input {...F('title')} /></div>
        <div className="form-grid-2">
          <div className="form-row"><label>Department</label><select {...F('dept')}><option value="HR">HR</option><option value="Operations">Operations</option><option value="Supply Chain">Supply Chain</option><option value="Technology">Technology</option><option value="Commercial">Commercial</option></select></div>
          <div className="form-row"><label>Status</label><select {...F('status')}><option>On Track</option><option>At Risk</option><option>Off Track</option><option>Completed</option></select></div>
        </div>
        <div className="form-grid-2">
          <div className="form-row"><label>Sponsor</label><input {...F('sponsor')} /></div>
          <div className="form-row"><label>Project Lead</label><input {...F('lead')} /></div>
        </div>
        <div className="form-grid-2">
          <div className="form-row"><label>Start Date</label><input type="date" {...F('start')} /></div>
          <div className="form-row"><label>End Date</label><input type="date" {...F('end')} /></div>
        </div>
        <div className="form-row"><label>Progress %</label><input type="number" min="0" max="100" {...F('progress')} /></div>
        <div className="form-row"><label>Background</label><textarea {...F('background')} /></div>
        <div className="form-row"><label>Scope & Success Criteria</label><textarea {...F('scope')} /></div>
        <div className="form-row"><label>Out of Scope</label><textarea {...F('out_of_scope')} /></div>
        <div className="form-row"><label>Deliverables & KPIs</label><textarea {...F('kpis')} /></div>
        <div className="form-row"><label>Risks</label><textarea {...F('risks')} /></div>
        <div className="form-row"><label>Background Material URL</label><input placeholder="https://..." {...F('bg_url')} /></div>
      </Modal>



      {/* Persistent Reminder Banner */}
      {activeReminders.length > 0 && (
        <div className="reminder-banner">
          <div className="reminder-banner-header">
            <span className="reminder-banner-icon">🔔</span>
            <span className="reminder-banner-title">Active Reminders ({activeReminders.length})</span>
          </div>
          <div className="reminder-banner-list">
            {activeReminders.map(r => (
              <div className="reminder-banner-item" key={r.id}>
                <div className="reminder-banner-dot"></div>
                <div className="reminder-banner-body">
                  <div className="reminder-banner-text">{r.text}</div>
                  <div className="reminder-banner-meta">
                    📅 {r.date} · {r.freq}
                    {projects.find(p => p.id === r.project_id) && <span> · 📁 {projects.find(p => p.id === r.project_id)?.proj_id}</span>}
                  </div>
                </div>
                <div className="reminder-banner-actions">
                  <button className="reminder-snooze-btn" onClick={() => handleSnoozeReminder(r.id)} title="Snooze 30 min">⏰ Snooze</button>
                  <button className="reminder-complete-btn" onClick={() => handleCompleteReminder(r.id)} title="Mark as completed">✓ Complete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Chatbot />
      <Toast msg={toastMsg} show={toastShow} />
    </>
  );
}
