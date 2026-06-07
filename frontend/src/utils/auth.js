// src/utils/auth.js

export function getAuthToken() {
  return localStorage.getItem("auth_token");
}

export function getUserRole() {
  return localStorage.getItem("auth_role"); // "USER" | "ADMIN"
}

export function setAuthSession(token, role) {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_role", role);
}

export function clearAuthSession() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_role");
}

export function isAuthenticated() {
  return !!getAuthToken();
}
