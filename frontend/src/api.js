const BASE = '/api';

function getToken() {
  return localStorage.getItem('mwb_token');
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE + url, { headers, ...options });
  if (res.status === 401) {
    localStorage.removeItem('mwb_token');
    window.location.reload();
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  signin: (data) => request('/auth/signin', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Admin
  getUsers: () => request('/admin/users'),
  setUserPermissions: (uid, screens) => request(`/admin/users/${uid}/permissions`, { method: 'PUT', body: JSON.stringify({ screens }) }),
  toggleUserActive: (uid, is_active) => request(`/admin/users/${uid}/toggle-active`, { method: 'PUT', body: JSON.stringify({ is_active }) }),
  makeAdmin: (uid) => request(`/admin/users/${uid}/make-admin`, { method: 'PUT' }),

  // Projects
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  // Stats
  getStats: () => request('/stats'),
  getActivity: () => request('/activity'),

  // Milestones
  createMilestone: (pid, data) => request(`/projects/${pid}/milestones`, { method: 'POST', body: JSON.stringify(data) }),
  updateMilestone: (mid, data) => request(`/milestones/${mid}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMilestone: (mid) => request(`/milestones/${mid}`, { method: 'DELETE' }),

  // Actions
  createAction: (pid, data) => request(`/projects/${pid}/actions`, { method: 'POST', body: JSON.stringify(data) }),
  updateAction: (aid, data) => request(`/actions/${aid}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleAction: (aid) => request(`/actions/${aid}/toggle`, { method: 'PATCH' }),
  deleteAction: (aid) => request(`/actions/${aid}`, { method: 'DELETE' }),

  // Team
  createTeamMember: (pid, data) => request(`/projects/${pid}/team`, { method: 'POST', body: JSON.stringify(data) }),
  updateTeamMember: (tid, data) => request(`/team/${tid}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeamMember: (tid) => request(`/team/${tid}`, { method: 'DELETE' }),

  // Reviews
  createReview: (pid, data) => request(`/projects/${pid}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
  deleteReview: (rid) => request(`/reviews/${rid}`, { method: 'DELETE' }),

  // Attachments
  createAttachment: (pid, data) => request(`/projects/${pid}/attachments`, { method: 'POST', body: JSON.stringify(data) }),
  deleteAttachment: (aid) => request(`/attachments/${aid}`, { method: 'DELETE' }),

  // Reminders
  createReminder: (pid, data) => request(`/projects/${pid}/reminders`, { method: 'POST', body: JSON.stringify(data) }),
  deleteReminder: (rid) => request(`/reminders/${rid}`, { method: 'DELETE' }),
  completeReminder: (rid) => request(`/reminders/${rid}/complete`, { method: 'PATCH' }),
  snoozeReminder: (rid) => request(`/reminders/${rid}/snooze`, { method: 'PATCH' }),
  getActiveReminders: () => request('/active-reminders'),

  // Upcoming Reviews
  getUpcomingReviews: () => request('/upcoming-reviews'),

  // Chatbot
  chat: (message) => request('/chat', { method: 'POST', body: JSON.stringify({ message }) }),

  // Knowledge docs
  getKnowledgeDocs: () => request('/knowledge-docs'),
  deleteKnowledgeDoc: (id) => request(`/knowledge-docs/${id}`, { method: 'DELETE' }),
  uploadKnowledgeDoc: (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    return fetch(BASE + '/knowledge-docs/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => r.json());
  },
};
