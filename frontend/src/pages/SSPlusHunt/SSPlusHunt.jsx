import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAuth, api } from '../../contexts/AuthContext';
import { FiTarget, FiClock, FiCheckCircle, FiUser, FiCalendar } from 'react-icons/fi';
import { GiCrossedSwords, GiHourglass } from 'react-icons/gi';
import { toast } from 'react-hot-toast';

/** 猎杀用时：从任务创建（上传/发布）到标记完成的时间 */
function formatHuntElapsedUploadToComplete(createdAt, completedAt) {
  if (!createdAt || !completedAt) return null;
  const start = new Date(createdAt).getTime();
  const end = new Date(completedAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  const ms = end - start;
  const totalMins = Math.floor(ms / 60000);
  const days = Math.floor(totalMins / (60 * 24));
  const hours = Math.floor((totalMins % (60 * 24)) / 60);
  const mins = totalMins % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  if (days === 0 && hours === 0 && mins > 0) parts.push(`${mins}分钟`);
  if (parts.length === 0) return '不足1分钟';
  return parts.join('');
}

const SSPlusHunt = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('hunts');
  const [bossHint, setBossHint] = useState('');
  const [countdownHint, setCountdownHint] = useState('');
  const [notes, setNotes] = useState('');

  const { data: huntsData, isLoading } = useQuery('hunts-list', () =>
    api.get('/hunts').then((res) => res.data?.hunts || [])
  );
  const { data: usersData } = useQuery('users-list-hunt', () =>
    api.get('/users').then((res) => res.data?.users || [])
  );

  const uploadMutation = useMutation(
    (payload) => api.post('/hunts/manual', payload),
    {
      onSuccess: () => {
        toast.success('任务发布成功');
        queryClient.invalidateQueries('hunts-list');
        setBossHint('');
        setCountdownHint('');
        setNotes('');
      },
      onError: (error) => toast.error(error.response?.data?.message || '上传失败')
    }
  );

  const completeMutation = useMutation(
    (huntId) => api.put(`/hunts/${huntId}/complete`),
    {
      onSuccess: () => {
        toast.success('任务已完成');
        queryClient.invalidateQueries('hunts-list');
      },
      onError: (error) => toast.error(error.response?.data?.message || '操作失败')
    }
  );

  const reopenMutation = useMutation(
    (huntId) => api.put(`/hunts/${huntId}/reopen`),
    {
      onSuccess: () => {
        toast.success('已取消完成标记');
        queryClient.invalidateQueries('hunts-list');
      },
      onError: (error) => toast.error(error.response?.data?.message || '操作失败')
    }
  );

  const assignMutation = useMutation(
    ({ huntId, slots }) => api.put(`/hunts/${huntId}/assign-slots`, { assignment_slots: slots }),
    {
      onSuccess: () => {
        toast.success('分配成功');
        queryClient.invalidateQueries('hunts-list');
      },
      onError: (error) => toast.error(error.response?.data?.message || '分配失败')
    }
  );

  const deleteMutation = useMutation(
    (huntId) => api.delete(`/hunts/${huntId}`),
    {
      onSuccess: () => {
        toast.success('任务已删除');
        queryClient.invalidateQueries('hunts-list');
      },
      onError: (error) => toast.error(error.response?.data?.message || '删除失败')
    }
  );

  const huntTasks = huntsData || [];
  const activeMembers = useMemo(() => (usersData || []).filter((u) => u.status === 'active'), [usersData]);

  const handleUpload = () => {
    if (!bossHint.trim()) {
      toast.error('请填写Boss名称');
      return;
    }
    if (!countdownHint.trim()) {
      toast.error('请填写倒计时提示，例如：19天22小时');
      return;
    }
    uploadMutation.mutate({
      boss_name: bossHint.trim(),
      countdown_hint: countdownHint.trim(),
      notes: notes.trim()
    });
  };

  const handleAssignSlot = (hunt, slotIndex, userId) => {
    const slots = Array.isArray(hunt.assignment_slots) ? [...hunt.assignment_slots] : [null, null, null, null, null];
    slots[slotIndex] = userId ? parseInt(userId, 10) : null;
    assignMutation.mutate({ huntId: hunt.id, slots });
  };

  const getAvailableMembersForSlot = (hunt, slotIndex) => {
    const slots = Array.isArray(hunt.assignment_slots) ? hunt.assignment_slots : [null, null, null, null, null];
    const selectedElsewhere = new Set(
      slots
        .map((id, idx) => (idx === slotIndex ? null : id))
        .filter((id) => id)
    );
    return activeMembers.filter((member) => !selectedElsewhere.has(member.id));
  };

  const canManageHuntCompletion = (task) =>
    isAdmin || (user?.id != null && Number(user.id) === Number(task.created_by));

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="paper-card">
        <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
          <GiCrossedSwords className="mr-3 text-accent-red" />
          SS+猎杀系统
        </h1>
        <p className="text-ninja-gray">
          成员发布任务后自动占用位置1（可知是谁发布），管理员分配其余位置；系统按倒计时每日更新剩余天数
        </p>
      </div>

      {/* 标签页 */}
      <div className="paper-card">
        <div className="flex flex-wrap border-b border-ink-light mb-6">
          {[
            { id: 'hunts', label: '猎杀任务', icon: <FiTarget /> },
              { id: 'upload', label: '发布任务', icon: <FiTarget /> },
            { id: 'history', label: '猎杀记录', icon: <FiCalendar /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-accent-red text-accent-red'
                  : 'border-transparent text-ninja-gray hover:text-ink'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 猎杀任务 */}
        {activeTab === 'hunts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">SS+猎杀任务</h2>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-ninja-gray">加载中...</div>
            ) : huntTasks.length === 0 ? (
              <div className="text-center py-8 text-ninja-gray">暂无任务，先去上传截图生成任务</div>
            ) : (
            <div className="grid grid-cols-1 gap-4">
              {huntTasks.map((task) => (
                <div key={task.id} className="paper-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xl font-bold">{task.target_name}</div>
                      <div className="text-sm text-ninja-gray">等级: {task.target_level || 'SS+'}</div>
                    </div>
                    <div className={`text-2xl ${
                      task.status === 'completed' ? 'text-green-600' :
                      task.status === 'in_progress' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {task.status === 'completed' ? <FiCheckCircle /> :
                       task.status === 'in_progress' ? <GiHourglass /> :
                       <FiTarget />}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <FiClock className="mr-2 text-ninja-gray" />
                      倒计时剩余: <span className="ml-1 font-bold">{task.countdown_days_remaining ?? '-'} 天</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FiCalendar className="mr-2 text-ninja-gray" />
                      上传日期: <span className="ml-1 font-bold">{task.hunt_date}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FiUser className="mr-2 text-ninja-gray" />
                      发布者:{' '}
                      <span className="ml-1 font-bold">
                        {task.creator?.display_name || task.creator?.username || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="font-medium mb-2">分配位置（5人）</div>
                    <p className="text-xs text-ninja-gray mb-2">
                      位置1默认为发布任务成员，管理员可改；位置2～5由管理员分配。
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <select
                          key={idx}
                          className="brush-input"
                          disabled={!isAdmin}
                          value={task.assignment_slots?.[idx] || ''}
                          onChange={(e) => handleAssignSlot(task, idx, e.target.value)}
                        >
                          <option value="">位置{idx + 1}</option>
                          {getAvailableMembersForSlot(task, idx).map((m) => (
                            <option key={m.id} value={m.id}>{m.display_name || m.username}</option>
                          ))}
                        </select>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {canManageHuntCompletion(task) ? (
                      <div className="flex space-x-2">
                        {task.status === 'completed' ? (
                          <button
                            type="button"
                            className="ink-button flex-1 border border-ink-light"
                            onClick={() => reopenMutation.mutate(task.id)}
                            disabled={reopenMutation.isLoading}
                          >
                            取消完成标记
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="ink-button ink-button-primary flex-1"
                            onClick={() => completeMutation.mutate(task.id)}
                            disabled={completeMutation.isLoading}
                          >
                            标记完成
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            className="ink-button flex-1 text-accent-red"
                            onClick={() => {
                              if (window.confirm('确定删除该猎杀任务吗？')) {
                                deleteMutation.mutate(task.id);
                              }
                            }}
                          >
                            删除任务
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-ninja-gray text-center py-2">
                        完成状态仅管理员或任务发布者可更改
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* 截图上传 */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">发布猎杀任务</h2>
              <p className="text-ninja-gray mb-6">
                由成员手动填写 Boss 和倒计时后发布任务；您将自动占用猎杀位置 1，其余位置由管理员分配。
              </p>
            </div>

            <div className="paper-card">
              <h3 className="font-bold mb-4">任务信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Boss名称（必填）</label>
                  <input
                    className="brush-input w-full"
                    value={bossHint}
                    onChange={(e) => setBossHint(e.target.value)}
                    placeholder="例如：绫翼、青冥龙王"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">倒计时提示（必填）</label>
                  <input
                    className="brush-input w-full"
                    value={countdownHint}
                    onChange={(e) => setCountdownHint(e.target.value)}
                    placeholder="例如：19天22小时"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">备注说明</label>
                  <textarea
                    className="brush-input w-full h-32"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="可选：添加猎杀过程中的特殊情况说明..."
                  />
                </div>

                <button
                  className="ink-button ink-button-primary w-full"
                  onClick={handleUpload}
                  disabled={uploadMutation.isLoading}
                >
                  {uploadMutation.isLoading ? '发布中...' : '发布任务'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 猎杀记录 */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">猎杀历史记录</h2>
              <div className="text-sm text-ninja-gray">
                共 <span className="font-bold">{huntTasks.length}</span> 条记录
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-light">
                    <th className="text-left py-3">日期</th>
                    <th className="text-left py-3">目标</th>
                    <th className="text-left py-3">猎杀者（发布者）</th>
                    <th
                      className="text-left py-3"
                      title="从任务发布到标记完成的时间"
                    >
                      猎杀用时
                    </th>
                    <th className="text-left py-3">奖励</th>
                  </tr>
                </thead>
                <tbody>
                  {huntTasks.map((record) => (
                    <tr key={record.id} className="border-b border-ink-light hover:bg-paper-dark">
                      <td className="py-3 font-medium">{record.hunt_date}</td>
                      <td className="py-3">
                        <span className="ink-badge ink-badge-red">{record.target_name}</span>
                      </td>
                      <td className="py-3">
                        {record.creator?.display_name || record.creator?.username || '—'}
                      </td>
                      <td className="py-3 font-bold">
                        {record.status === 'completed'
                          ? formatHuntElapsedUploadToComplete(
                              record.created_at,
                              record.completed_at
                            ) || '—'
                          : '—'}
                      </td>
                      <td className="py-3">
                        <span className="ink-badge ink-badge-gold">{record.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 操作指南 */}
      <div className="paper-card">
        <h3 className="font-bold mb-3">SS+猎杀指南</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold mb-2 text-accent-red">截图要求</h4>
            <ul className="list-disc list-inside space-y-1 text-ninja-gray">
              <li>截图以屏幕中心Boss卡片为主</li>
              <li>确保图片清晰可读</li>
              <li>成员均可上传或手动发布，发布者自动占位置1</li>
              <li>管理员分配位置2～5（位置1也可按需调整）</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-accent-blue">时间识别</h4>
            <ul className="list-disc list-inside space-y-1 text-ninja-gray">
              <li>系统根据识别文本解析倒计时（如 19天22小时）</li>
              <li>系统按天自动刷新剩余天数</li>
              <li>若识别文本不足，可在上传时补充提示</li>
              <li>仅发布者或管理员可标记完成 / 取消完成</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSPlusHunt;