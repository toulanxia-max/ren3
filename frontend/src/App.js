import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';

// 页面组件
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Abyss from './pages/Abyss/Abyss';
import SSPlusHunt from './pages/SSPlusHunt/SSPlusHunt';
import ClanBattles from './pages/ClanBattles/ClanBattles';
import Activities from './pages/Activities/Activities';
import Profile from './pages/Profile/Profile';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminSettings from './pages/Admin/AdminSettings';
import NotFound from './pages/NotFound/NotFound';
import { useAuth } from './contexts/AuthContext';

// 创建React Query客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5分钟
    },
  },
});

// 私有路由组件
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// 管理员路由：以 AuthContext 为准，避免只改 localStorage 不同步
const AdminGate = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ninja-gray">加载中…</div>;
  }
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-paper">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'linear-gradient(145deg, #2d2d2d, #1a1a1a)',
                  color: '#fff',
                  border: '1px solid #c53030',
                  fontFamily: '"STKaiti", KaiTi, serif',
                },
              }}
            />

            <Routes>
              {/* 公开路由 */}
              <Route path="/login" element={<Login />} />

              {/* 私有路由 */}
              <Route path="/" element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }>
                <Route index element={<Home />} />
                <Route path="abyss" element={<Abyss />} />
                <Route path="hunts" element={<SSPlusHunt />} />
                <Route path="battles" element={<ClanBattles />} />
                <Route path="activities" element={<Activities />} />
                <Route path="profile" element={<Profile />} />

                {/* 管理员路由（使用 Outlet，避免嵌套 Routes 匹配不到） */}
                <Route
                  path="admin"
                  element={
                    <AdminGate>
                      <Outlet />
                    </AdminGate>
                  }
                >
                  <Route index element={<Navigate to="users" replace />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>

              {/* 404页面 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;