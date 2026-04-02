import React from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { FiSettings, FiServer, FiDatabase, FiShield } from 'react-icons/fi';
import ClanLogo from '../../components/ClanLogo/ClanLogo';

const AdminSettings = () => {
  const { api } = useAuth();

  const { data: stats, isLoading } = useQuery(
    ['admin', 'user-stats'],
    async () => {
      const res = await api.get('/users/stats');
      return res?.data || res || null;
    },
    { staleTime: 60 * 1000 }
  );

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

  return (
    <div className="space-y-6">
      <div className="paper-card">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-3">
          <ClanLogo sizeClass="w-11 h-11" className="shadow" />
          系统设置
        </h1>
        <p className="text-ninja-gray mt-2">
          本站业务配置（深渊、兑换码、队伍等）已在对应页面由管理员/队长维护；此处汇总运行信息与用户规模，便于排查问题。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="paper-card">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <FiServer className="text-accent-blue" />
            前端与接口
          </h2>
          <ul className="text-sm space-y-2 text-ninja-gray">
            <li>
              <span className="text-ink">API 基址（开发默认）：</span>
              <code className="ml-1 text-xs bg-paper-dark px-1 rounded break-all">{apiBase}</code>
            </li>
            <li>
              可通过环境变量 <code className="text-xs bg-paper-dark px-1">REACT_APP_API_URL</code> 指向生产环境后端。
            </li>
          </ul>
        </div>

        <div className="paper-card">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <FiDatabase className="text-accent-green" />
            后端与数据库
          </h2>
          <p className="text-sm text-ninja-gray leading-relaxed">
            数据库连接、JWT、端口等在后端目录的 <code className="text-xs bg-paper-dark px-1">.env</code> 中配置（如{' '}
            <code className="text-xs bg-paper-dark px-1">DB_*</code>、<code className="text-xs bg-paper-dark px-1">JWT_SECRET</code>、
            <code className="text-xs bg-paper-dark px-1">PORT</code>、<code className="text-xs bg-paper-dark px-1">CORS_ORIGIN</code>
            ）。修改后需重启后端服务。
          </p>
        </div>
      </div>

      <div className="paper-card">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <FiShield className="text-accent-red" />
          用户统计（仅管理员接口）
        </h2>
        {isLoading ? (
          <p className="text-ninja-gray text-sm">加载中…</p>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-paper-dark">
              <div className="text-ninja-gray">总用户</div>
              <div className="text-xl font-bold">{stats.totalUsers ?? '—'}</div>
            </div>
            <div className="p-3 rounded-lg bg-paper-dark">
              <div className="text-ninja-gray">活跃</div>
              <div className="text-xl font-bold">{stats.activeUsers ?? '—'}</div>
            </div>
            <div className="p-3 rounded-lg bg-paper-dark">
              <div className="text-ninja-gray">管理员</div>
              <div className="text-xl font-bold">{stats.admins ?? '—'}</div>
            </div>
            <div className="p-3 rounded-lg bg-paper-dark">
              <div className="text-ninja-gray">队长</div>
              <div className="text-xl font-bold">{stats.captains ?? '—'}</div>
            </div>
            <div className="p-3 rounded-lg bg-paper-dark">
              <div className="text-ninja-gray">普通成员</div>
              <div className="text-xl font-bold">{stats.members ?? '—'}</div>
            </div>
          </div>
        ) : (
          <p className="text-ninja-gray text-sm">暂时无法获取统计数据</p>
        )}
      </div>

      <div className="paper-card border border-ink-light/50">
        <h2 className="font-bold mb-2 flex items-center gap-2">
          <FiSettings />
          说明
        </h2>
        <p className="text-sm text-ninja-gray leading-relaxed">
          「系统设置」不提供在线改库或改密钥，避免误操作；需要改家族业务展示内容请使用首页「本周配置」、深渊系统、SS+ 猎杀等页面。若你希望在此页增加具体开关（例如维护模式公告），可以再说需求单独做。
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;
