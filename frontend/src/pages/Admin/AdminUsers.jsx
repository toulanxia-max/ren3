import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { FiTrash2 } from 'react-icons/fi';
import ClanLogo from '../../components/ClanLogo/ClanLogo';

const roleLabel = (r) => (r === 'admin' ? '管理员' : r === 'captain' ? '队长' : '成员');

const AdminUsers = () => {
  const { user: currentUser, api } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['admin', 'users'],
    async () => {
      const res = await api.get('/users');
      return res?.data?.users || res?.users || [];
    },
    { staleTime: 30 * 1000 }
  );

  const users = Array.isArray(data) ? data : [];

  const roleMutation = useMutation(
    async ({ id, role }) => {
      await api.put(`/users/${id}/role`, { role });
    },
    {
      onSuccess: (_, { id, role }) => {
        queryClient.invalidateQueries(['admin', 'users']);
        toast.success(`已设为${roleLabel(role)}`);
        if (String(id) === String(currentUser?.id)) {
          toast('你修改了自己的角色，将刷新页面以更新权限', { icon: 'ℹ️' });
          setTimeout(() => window.location.reload(), 800);
        }
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || '修改角色失败');
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      await api.delete(`/users/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'users']);
        toast.success('已删除用户');
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || '删除失败');
      },
    }
  );

  const handleDelete = (u) => {
    if (String(u.id) === String(currentUser?.id)) {
      toast.error('不能删除当前登录账号');
      return;
    }
    if (!window.confirm(`确定删除用户「${u.display_name || u.username}」？此操作不可恢复。`)) return;
    deleteMutation.mutate(u.id);
  };

  return (
    <div className="space-y-6">
      <div className="paper-card">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-3">
          <ClanLogo sizeClass="w-11 h-11" className="shadow" />
          用户管理
        </h1>
        <p className="text-ninja-gray mt-2">
          查看家族成员、调整角色（管理员 / 队长 / 成员）。删除用户前请确认对方已不再需要访问本站。
        </p>
      </div>

      <div className="paper-card overflow-x-auto">
        {isLoading ? (
          <p className="text-ninja-gray">加载中…</p>
        ) : users.length === 0 ? (
          <p className="text-ninja-gray">暂无用户数据</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-light text-left text-ninja-gray">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">显示名</th>
                <th className="py-2 pr-4">用户名</th>
                <th className="py-2 pr-4">游戏 ID</th>
                <th className="py-2 pr-4">角色</th>
                <th className="py-2 pr-4">状态</th>
                <th className="py-2 pr-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-ink-light/60">
                  <td className="py-3 pr-4">{u.id}</td>
                  <td className="py-3 pr-4 font-medium">{u.display_name || '—'}</td>
                  <td className="py-3 pr-4">{u.username}</td>
                  <td className="py-3 pr-4">{u.game_id || '—'}</td>
                  <td className="py-3 pr-4">
                    <select
                      className="brush-input py-1 text-sm min-w-[7rem]"
                      value={u.role}
                      disabled={roleMutation.isLoading}
                      onChange={(e) => {
                        const role = e.target.value;
                        if (role === u.role) return;
                        roleMutation.mutate({ id: u.id, role });
                      }}
                    >
                      <option value="member">成员</option>
                      <option value="captain">队长</option>
                      <option value="admin">管理员</option>
                    </select>
                  </td>
                  <td className="py-3 pr-4">{u.status === 'active' ? '正常' : u.status || '—'}</td>
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => handleDelete(u)}
                      disabled={deleteMutation.isLoading || String(u.id) === String(currentUser?.id)}
                      className="inline-flex items-center gap-1 text-accent-red hover:underline disabled:opacity-40 disabled:no-underline"
                    >
                      <FiTrash2 size={14} />
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
