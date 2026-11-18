
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://eam-backend-6v6k.onrender.com/api',
  // baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle 401 globally — clear the session and bounce to login, but only when
// the user is on a protected page. Public routes (login, register, set-password)
// must not be hijacked by a stale-token 401, otherwise the password-setup link
// would redirect to login instead of showing the Set Password page.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const publicRoutes = ['/login', '/register', '/set-password'];
      const onPublic = publicRoutes.some((p) => window.location.pathname.startsWith(p));
      if (!onPublic) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

export default api;
