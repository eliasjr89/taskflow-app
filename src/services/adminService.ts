// src/services/adminService.ts
import api from "@/services/api";

export interface SystemHealth {
  uptime: number;
  message: string;
  timestamp: string;
  memory: {
    free: number;
    total: number;
    usagePercent: string;
  };
  loadAvg: number[];
  dbConnection: string;
}

export interface DashboardStats {
  users: number;
  projects: number;
  tasks: number;
  activeSessions: number;
}

export default {
  getSystemHealth(): Promise<{ data: SystemHealth }> {
    return api.get("/admin/health");
  },
  getDashboardStats(): Promise<{ data: DashboardStats }> {
    return api.get("/admin/dashboard");
  },
  impersonateUser(userId: number) {
    return api.post("/admin/impersonate", { userId });
  },
  getAuditLogs(params: any) {
    return api.get("/admin/activity", { params });
  },
  getUserSessions(userId: number) {
    return api.get(`/admin/users/${userId}/sessions`);
  },
  deleteSession(sessionId: number | string) {
    return api.delete(`/admin/sessions/${sessionId}`);
  },
  // Roles
  getRoles() {
    return api.get("/admin/roles");
  },
  getPermissions() {
    return api.get("/admin/permissions");
  },
  createRole(data: any) {
    return api.post("/admin/roles", data);
  },
  updateRole(id: number, data: any) {
    return api.put(`/admin/roles/${id}`, data);
  },
  deleteRole(id: number) {
    return api.delete(`/admin/roles/${id}`);
  },
  // Settings
  getSettings() {
    return api.get("/admin/settings");
  },
  updateSetting(key: string, value: any) {
    return api.put(`/admin/settings/${key}`, { value });
  },
  // Webhooks
  getWebhooks() {
    return api.get("/admin/webhooks");
  },
  createWebhook(data: any) {
    return api.post("/admin/webhooks", data);
  },
  deleteWebhook(id: number) {
    return api.delete(`/admin/webhooks/${id}`);
  },
  // Announcements
  getAnnouncements() {
    return api.get("/announcements"); // Public/Auth
  },
  createAnnouncement(data: any) {
    return api.post("/announcements", data);
  },
  deleteAnnouncement(id: number) {
    return api.delete(`/announcements/${id}`); // Actually deactivate
  },
};
