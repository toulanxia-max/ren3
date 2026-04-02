import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAuth, api } from '../../contexts/AuthContext';
import { FiTarget, FiClock, FiCheckCircle, FiUser, FiCalendar } from 'react-icons/fi';
import { GiCrossedSwords, GiHourglass } from 'react-icons/gi';
import { toast } from 'react-hot-toast';

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

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="paper-card">
        <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
          <GiCrossedSwords className="mr-3 text-accent-red" />
          SS+猎杀系统
        </h1>
        <p className="text-ninja-gray">
          成员上传截图自动生成任务，管理员分配5个位置，系统按倒计时每日更新剩余天数
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
                  </div>

                  <div className="mb-4">
                    <div className="font-medium mb-2">分配位置（5人）</div>
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

                  <div className="flex space-x-2">
                    <button
                      className="ink-button ink-button-primary flex-1"
                      onClick={() => completeMutation.mutate(task.id)}
                      disabled={task.status === 'completed'}
                    >
                      {task.status === 'completed' ? '已完成' : '标记完成'}
                    </button>
                    {isAdmin && (
                      <button
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
                由成员手动填写Boss和倒计时后直接发布任务
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
                    <th className="text-left py-3">猎杀者</th>
                    <th className="text-left py-3">用时</th>
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
                      <td className="py-3">{record.completer?.display_name || record.completer?.username || '-'}</td>
                      <td className="py-3 font-bold">{record.countdown_days_remaining ?? '-'}天</td>
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
              <li>成员均可上传，上传后自动生成任务</li>
              <li>管理员可在任务中分配5个位置</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-accent-blue">时间识别</h4>
            <ul className="list-disc list-inside space-y-1 text-ninja-gray">
              <li>系统根据识别文本解析倒计时（如 19天22小时）</li>
              <li>系统按天自动刷新剩余天数</li>
              <li>若识别文本不足，可在上传时补充提示</li>
              <li>任务状态可由成员标记完成</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSPlusHunt;