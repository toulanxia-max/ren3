import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

// 创建Context
const AuthContext = createContext({});


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const extractUserToken = (response) => {
    const payload = response?.data || response || {};
    const data = payload?.data || {};
    return {
      user: data.user || payload.user || null,
      token: data.token || payload.token || null
    };
  };

  const refreshCurrentUser = async () => {
    const response = await api.get('/auth/me', {
      params: { _t: Date.now() },
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
    const { user: latestUser } = extractUserToken(response);
    if (latestUser) {
      setUser(latestUser);
      localStorage.setItem('user', JSON.stringify(latestUser));
    }
    return latestUser;
  };

  // 初始化：从localStorage恢复用户状态
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));

          // 验证令牌有效性
          await refreshCurrentUser();
        } catch (error) {
          // 令牌无效，清除存储
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // 登录
  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user: userData } = extractUserToken(response);

      // 保存到localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // 更新状态
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      toast.success('登录成功！');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || '登录失败';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // 注册
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user: newUser } = extractUserToken(response);

      // 保存到localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));

      // 更新状态
      setUser(newUser);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      toast.success('注册成功！');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || '注册失败';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // 登出
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // 忽略登出错误
    } finally {
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);

      toast.success('已退出登录');
      window.location.href = '/login';
    }
  };

  // 修改密码
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('密码修改成功！');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || '修改密码失败';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // 更新用户信息
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // 检查用户角色
  const isAdmin = user?.role === 'admin';
  const isCaptain = user?.role === 'captain' || isAdmin;
  const isMember = user?.role === 'member' || isCaptain || isAdmin;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    updateUser,
    refreshCurrentUser,
    isAdmin,
    isCaptain,
    isMember,
    api, // 导出api实例供其他组件使用
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内使用');
  }
  return context;
};

// 导出api实例
export { api };