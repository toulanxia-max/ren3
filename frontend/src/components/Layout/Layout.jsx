import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { buildAvatarSrc } from '../../utils/avatarUrl';
import { FiHome, FiUsers, FiTarget, FiCalendar, FiUser, FiLogOut, FiMenu, FiX, FiSettings } from 'react-icons/fi';
import ClanLogo from '../ClanLogo/ClanLogo';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { path: '/', name: '首页', icon: <FiHome /> },
    { path: '/abyss', name: '深渊系统', icon: <FiUsers /> },
    { path: '/hunts', name: 'SS+猎杀', icon: <FiTarget /> },
    { path: '/battles', name: '家族战', icon: <FiTarget /> },
    { path: '/activities', name: '活动', icon: <FiCalendar /> },
    { path: '/profile', name: '个人中心', icon: <FiUser /> },
  ];

  const adminItems = user?.role === 'admin' ? [
    { path: '/admin/users', name: '用户管理', icon: <FiUsers /> },
    { path: '/admin/settings', name: '系统设置', icon: <FiSettings /> },
  ] : [];

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout();
    }
  };

  const avatarUrl = buildAvatarSrc(user?.avatar_url, user?.updated_at);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 移动端侧边栏开关 */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="ink-button p-3"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* 侧边栏 */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40 w-64 bg-ink text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* 侧边栏头部 */}
        <div className="p-6 border-b border-ink-light">
          <div className="flex items-center space-x-3">
            <ClanLogo sizeClass="w-10 h-10" className="shadow-md" />
            <div>
              <h1 className="text-xl font-serif font-bold">紫川家族</h1>
              <p className="text-sm text-ninja-light-gray">忍3 · 家族站</p>
            </div>
          </div>
        </div>

        {/* 用户信息 */}
        <div className="p-4 border-b border-ink-light">
          <Link
            to="/profile"
            className="flex items-center space-x-3 rounded-lg p-1 hover:bg-ink-light transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-12 h-12 rounded-full bg-accent-blue flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold">{user?.display_name?.charAt(0) || '忍'}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="font-bold">{user?.display_name || '未知用户'}</div>
              <div className="text-sm text-ninja-light-gray">
                {user?.role === 'admin' ? '管理员' :
                 user?.role === 'captain' ? '队长' : '成员'}
              </div>
            </div>
          </Link>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 overflow-y-auto scroll-area">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${location.pathname === item.path
                    ? 'bg-accent-red text-white'
                    : 'hover:bg-ink-light'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}

            {/* 管理员菜单分隔线 */}
            {adminItems.length > 0 && (
              <>
                <div className="my-4 h-px bg-ink-light"></div>
                <div className="text-xs uppercase tracking-wider text-ninja-light-gray px-4 mb-2">
                  管理员
                </div>
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-ink-light transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </>
            )}
          </div>
        </nav>

        {/* 底部退出按钮 */}
        <div className="p-4 border-t border-ink-light">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-lg bg-ink-light hover:bg-accent-red transition-colors"
          >
            <FiLogOut />
            <span>退出登录</span>
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 md:ml-64">
        {/* 移动端侧边栏遮罩 */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 页面内容 */}
        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* 页脚 */}
        <footer className="mt-auto border-t border-ink-light p-4 text-center text-ninja-gray text-sm">
          <p>© {new Date().getFullYear()} 紫川家族站 · 《忍者必须死3》家族自用</p>
          <p className="mt-1">本网站与游戏官方无关，仅供家族内部使用</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;