import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth, api } from '../../contexts/AuthContext';
import { FiUsers, FiCalendar, FiClock, FiCheckCircle, FiPlus, FiTrash2, FiUserPlus, FiImage, FiRefreshCw } from 'react-icons/fi';
import { GiStoneBlock, GiRank3 } from 'react-icons/gi';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import AbyssScheduleSheet, { splitTeamsForSheets } from '../../components/AbyssScheduleSheet/AbyssScheduleSheet';

function AbyssTeamManagementCard({
  team,
  isCaptain,
  isAdmin,
  onOpenAddMember,
  onRemoveMember,
  onSetCaptain,
}) {
  const members = team.members || [];
  const captain = members.find((m) => m.role === 'captain');
  const teamMembers = members.filter((m) => m.role !== 'captain');

  return (
    <div className="border border-ink-light rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="text-2xl font-bold text-accent-red mr-3">{team.team_name}</div>
          <span className="text-sm text-ninja-gray">共 {members.length} 人</span>
        </div>
        {isCaptain && (
          <button
            type="button"
            onClick={onOpenAddMember}
            className="ink-button ink-button-primary flex items-center text-sm"
          >
            <FiUserPlus className="mr-1" />
            添加成员
          </button>
        )}
      </div>

      <div className="space-y-2">
        {captain ? (
          <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
            <div className="flex items-center">
              <span className="ink-badge ink-badge-red mr-2">队长</span>
              <span className="font-medium">
                {captain.user?.display_name || captain.user?.username || '未知'}
              </span>
              <span className="text-sm text-ninja-gray ml-2">(ID: {captain.user?.game_id})</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-ninja-gray">
                {new Date(captain.joined_at).toLocaleDateString('zh-CN')}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onRemoveMember(captain.id)}
                  className="text-accent-red hover:text-red-700"
                  title="移除队长"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2 bg-yellow-50 rounded-lg text-yellow-700 text-sm">
            暂无队长，请添加成员并设置队长
          </div>
        )}

        {teamMembers.length > 0 ? (
          teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 bg-paper-dark rounded-lg">
              <div className="flex items-center">
                <span className="text-ninja-gray mr-2">{members.indexOf(member) + 2}.</span>
                <span className="font-medium">
                  {member.user?.display_name || member.user?.username || '未知'}
                </span>
                <span className="text-sm text-ninja-gray ml-2">(ID: {member.user?.game_id})</span>
              </div>
              <div className="flex items-center space-x-2">
                {isCaptain && (
                  <>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => onSetCaptain(team.id, member.id)}
                        className="text-sm text-accent-blue hover:underline"
                      >
                        设为队长
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveMember(member.id)}
                      className="text-accent-red hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-ninja-gray p-2">暂无其他成员</div>
        )}
      </div>
    </div>
  );
}

const Abyss = () => {
  const { user, isAdmin, isCaptain } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('schedule');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [scheduleExporting, setScheduleExporting] = useState(false);
  const scheduleSheet1Ref = useRef(null);
  const scheduleSheet2Ref = useRef(null);

  const scheduleLogoSrc = useMemo(() => {
    if (typeof window === 'undefined') return '/clan-logo.png';
    const pub = process.env.PUBLIC_URL || '';
    const path = `${pub}/clan-logo.png`.replace(/([^:])\/{2,}/g, '$1/');
    return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
  }, []);

  const {
    data: teamsData,
    isLoading: teamsLoading,
    isError: teamsError,
    refetch: refetchTeams,
  } = useQuery(
    'abyss-teams',
    () =>
      api.get('/abyss/teams').then((res) => {
        const raw = res?.data?.teams ?? res?.teams;
        return Array.isArray(raw) ? raw : [];
      }),
    {
      onError: (e) => {
        toast.error(e.response?.data?.message || '获取深渊队伍失败');
      },
    }
  );

  const teamsGrouped = useMemo(() => {
    const list = Array.isArray(teamsData) ? [...teamsData] : [];
    list.sort((a, b) => (Number(a.team_number) || 0) - (Number(b.team_number) || 0));
    const num = (t) => Number(t.team_number);
    const sheet1 = list.filter((t) => num(t) >= 1 && num(t) <= 4);
    const sheet2 = list.filter((t) => num(t) >= 5 && num(t) <= 9);
    const spare = list.filter((t) => num(t) === 10);
    const used = new Set([...sheet1, ...sheet2, ...spare].map((t) => t.id));
    const other = list.filter((t) => !used.has(t.id));
    return { sheet1, sheet2, spare, other };
  }, [teamsData]);

  const seedTeamsMutation = useMutation(
    () => api.post('/abyss/teams/seed-defaults'),
    {
      onSuccess: (res) => {
        toast.success(res?.message || '已写入默认队伍');
        queryClient.invalidateQueries('abyss-teams');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || '初始化失败');
      },
    }
  );

  const [teamsSheet1, teamsSheet2] = useMemo(
    () => splitTeamsForSheets(teamsData),
    [teamsData]
  );

  const downloadSchedulePng = useCallback(
    async (el, filename) => {
      if (!el) return;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    },
    []
  );

  const handleExportScheduleSheets = useCallback(async () => {
    if (!teamsData?.length) {
      toast.error('暂无队伍数据');
      return;
    }
    if (!teamsSheet1.length && !teamsSheet2.length) {
      toast.error('当前队伍无法分到 1～4 队或 5～9 队，请检查队伍编号');
      return;
    }
    setScheduleExporting(true);
    try {
      let n = 0;
      if (teamsSheet1.length && scheduleSheet1Ref.current) {
        await downloadSchedulePng(scheduleSheet1Ref.current, '紫川深渊排表-1至4队.png');
        n += 1;
        await new Promise((r) => setTimeout(r, 400));
      }
      if (teamsSheet2.length && scheduleSheet2Ref.current) {
        await downloadSchedulePng(scheduleSheet2Ref.current, '紫川深渊排表-5至9队.png');
        n += 1;
      }
      if (n === 0) {
        toast.error('导出失败，请稍后重试');
      } else {
        toast.success(`已生成 ${n} 张排表图片（已下载）`);
      }
    } catch (e) {
      console.error(e);
      toast.error('生成图片失败，请重试');
    } finally {
      setScheduleExporting(false);
    }
  }, [teamsData, teamsSheet1, teamsSheet2, downloadSchedulePng]);

  const { data: recordsData, isLoading: recordsLoading } = useQuery(
    'abyss-records',
    () => api.get('/abyss/records').then(res => res.data?.records || [])
  );

  const { data: usersData } = useQuery(
    'users-list',
    () => api.get('/users').then(res => res.data?.users || [])
  );

  const { data: myLeavesData, isLoading: leavesLoading } = useQuery(
    'my-leaves',
    () => api.get('/abyss/leaves/me').then(res => res.data?.leaves || [])
  );

  const { data: activeLeavesData } = useQuery(
    'active-leaves',
    () => api.get('/abyss/leaves/active').then(res => res.data?.leaves || [])
  );

  const createRecordMutation = useMutation(
    (data) => api.post('/abyss/records', data),
    {
      onSuccess: () => {
        toast.success('记录提交成功');
        queryClient.invalidateQueries('abyss-records');
        setShowRecordModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || '提交失败');
      }
    }
  );

  const addMemberMutation = useMutation(
    (data) => api.post('/abyss/members', data),
    {
      onSuccess: () => {
        toast.success('添加队员成功');
        queryClient.invalidateQueries('abyss-teams');
        setShowMemberModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || '添加失败');
      }
    }
  );

  const submitLeaveMutation = useMutation(
    (data) => api.post('/abyss/leaves', data),
    {
      onSuccess: () => {
        toast.success('请假确认成功，已自动从队伍移除');
        queryClient.invalidateQueries('my-leaves');
        queryClient.invalidateQueries('active-leaves');
        queryClient.invalidateQueries('abyss-teams');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || '请假提交失败');
      }
    }
  );

  const removeMemberMutation = useMutation(
    (id) => api.delete(`/abyss/members/${id}`),
    {
      onSuccess: () => {
        toast.success('移除成功');
        queryClient.invalidateQueries('abyss-teams');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || '移除失败');
      }
    }
  );

  const updateCaptainMutation = useMutation(
    (data) => api.put(`/abyss/members/${data.memberId}`, { role: 'captain' }),
    {
      onSuccess: () => {
        toast.success('设置队长成功');
        queryClient.invalidateQueries('abyss-teams');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || '设置失败');
      }
    }
  );

  const handleCreateRecord = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createRecordMutation.mutate({
      record_date: formData.get('record_date'),
      damage_score: parseFloat(formData.get('damage_score')),
      rank: parseInt(formData.get('rank')) || null,
      notes: formData.get('notes') || ''
    });
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addMemberMutation.mutate({
      team_id: parseInt(formData.get('team_id')),
      user_id: parseInt(formData.get('user_id')),
      role: formData.get('role')
    });
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm('确定要移除该队员吗？')) {
      removeMemberMutation.mutate(memberId);
    }
  };

  const handleSetCaptain = (teamId, memberId) => {
    updateCaptainMutation.mutate({ teamId, memberId });
  };

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    submitLeaveMutation.mutate({
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      reason: formData.get('reason') || ''
    });
    e.target.reset();
  };

  const allMembers = usersData?.filter(u => u.status === 'active') || [];
  const activeLeaveUserIds = new Set((activeLeavesData || []).map((leave) => leave.user_id));
  const isCurrentUserOnLeave = (activeLeavesData || []).some((leave) => leave.user_id === user?.id);

  const getAvailableMembers = (team) => {
    const currentMemberIds = team.members?.map(m => m.user_id) || [];
    return allMembers.filter((m) => !currentMemberIds.includes(m.id) && !activeLeaveUserIds.has(m.id));
  };

  const getFilteredMembers = (team) => {
    const availableMembers = getAvailableMembers(team);
    const keyword = memberSearch.trim().toLowerCase();

    if (!keyword) {
      return availableMembers;
    }

    return availableMembers.filter((member) => {
      const displayName = (member.display_name || '').toLowerCase();
      const username = (member.username || '').toLowerCase();
      const gameId = String(member.game_id || '').toLowerCase();

      return displayName.includes(keyword) || username.includes(keyword) || gameId.includes(keyword);
    });
  };

  return (
    <div className="space-y-6">
      <div className="paper-card">
        <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
          <GiStoneBlock className="mr-3 text-accent-red" />
          深渊系统
        </h1>
        <p className="text-ninja-gray">
          家族深渊挑战管理，包含队伍排表、请假申请、战绩排行等功能
        </p>
      </div>

      <div className="paper-card">
        <div className="flex flex-wrap border-b border-ink-light mb-6">
          {[
            { id: 'schedule', label: '深渊记录', icon: <FiCalendar /> },
            { id: 'teams', label: '队伍管理', icon: <FiUsers /> },
            { id: 'ranking', label: '战绩排行', icon: <GiRank3 /> },
            { id: 'leave', label: '请假申请', icon: <FiClock /> },
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

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">深渊记录</h2>
              <button
                onClick={() => setShowRecordModal(true)}
                className="ink-button ink-button-primary flex items-center"
              >
                <FiPlus className="mr-2" />
                提交记录
              </button>
            </div>

            {recordsLoading ? (
              <div className="text-center py-8 text-ninja-gray">加载中...</div>
            ) : recordsData?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ink-light">
                      <th className="text-left py-3">日期</th>
                      <th className="text-left py-3">玩家</th>
                      <th className="text-left py-3">伤害</th>
                      <th className="text-left py-3">排名</th>
                      <th className="text-left py-3">提交时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordsData.map((record) => (
                      <tr key={record.id} className="border-b border-ink-light hover:bg-paper-dark">
                        <td className="py-3">{record.record_date}</td>
                        <td className="py-3">{record.user?.display_name || record.user?.username || '未知'}</td>
                        <td className="py-3 font-bold text-accent-red">{record.damage_score}M</td>
                        <td className="py-3">{record.rank || '-'}</td>
                        <td className="py-3 text-ninja-gray text-sm">
                          {new Date(record.created_at).toLocaleDateString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-ninja-gray">
                <GiStoneBlock className="text-5xl mx-auto mb-3 opacity-50" />
                <p>暂无深渊记录</p>
                <p className="text-sm mt-1">点击上方"提交记录"添加第一条记录</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-bold">深渊队伍管理</h2>
              {(isCaptain || isAdmin) && (
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => seedTeamsMutation.mutate()}
                    disabled={seedTeamsMutation.isLoading || teamsLoading}
                    className="ink-button flex items-center justify-center shrink-0"
                  >
                    {seedTeamsMutation.isLoading ? '写入中…' : '初始化默认队伍'}
                  </button>
                  {isCaptain && (
                    <button
                      type="button"
                      onClick={handleExportScheduleSheets}
                      disabled={scheduleExporting || teamsLoading}
                      className="ink-button ink-button-primary flex items-center justify-center shrink-0"
                    >
                      <FiImage className="mr-2" />
                      {scheduleExporting ? '正在生成图片…' : '生成排表图'}
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-ninja-gray -mt-2">
              下方按排表分成两组共 9 队（1～4、5～9），对应两张「紫川深渊排表」图；第 10 队为备用。每队 5×2 共 10 格，队长首位黄底。若列表为空，请先点「初始化默认队伍」，或在服务器 MySQL 执行{' '}
              <code className="text-xs bg-paper-dark px-1 rounded">database/seed_abyss_teams.sql</code>
              。
            </p>

            {teamsLoading ? (
              <div className="text-center py-8 text-ninja-gray">加载中...</div>
            ) : teamsError ? (
              <div className="text-center py-12 space-y-3 text-ninja-gray">
                <p>队伍列表加载失败（请确认已登录且接口正常）。</p>
                <button
                  type="button"
                  onClick={() => refetchTeams()}
                  className="ink-button ink-button-primary inline-flex items-center"
                >
                  <FiRefreshCw className="mr-2" />
                  重试
                </button>
              </div>
            ) : !teamsData?.length ? (
              <div className="text-center py-12 space-y-3 text-ninja-gray">
                <p>
                  当前没有拉到任何队伍。请先点「初始化默认队伍」（需队长/管理员），或在服务器执行{' '}
                  <code className="text-xs bg-paper-dark px-1 rounded">database/seed_abyss_teams.sql</code>
                  写入 1～10 队；再点下面重新加载。
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(isCaptain || isAdmin) && (
                    <button
                      type="button"
                      onClick={() => seedTeamsMutation.mutate()}
                      disabled={seedTeamsMutation.isLoading}
                      className="ink-button ink-button-primary inline-flex items-center"
                    >
                      {seedTeamsMutation.isLoading ? '写入中…' : '初始化默认队伍'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => refetchTeams()}
                    className="ink-button inline-flex items-center"
                  >
                    <FiRefreshCw className="mr-2" />
                    重新加载队伍
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-ink">第一张排表：1～4 队</h3>
                  <p className="text-sm text-ninja-gray">导出 PNG「紫川深渊排表-1至4队」时使用本节 4 个队伍块。</p>
                  {teamsGrouped.sheet1.length === 0 ? (
                    <div className="text-sm text-ninja-gray border border-dashed border-ink-light rounded-lg p-4">
                      暂无 1～4 队。请点击「初始化默认队伍」或执行 SQL 种子。
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teamsGrouped.sheet1.map((team) => (
                        <AbyssTeamManagementCard
                          key={team.id}
                          team={team}
                          isCaptain={isCaptain}
                          isAdmin={isAdmin}
                          onOpenAddMember={() => {
                            setSelectedTeam(team);
                            setMemberSearch('');
                            setShowMemberModal(true);
                          }}
                          onRemoveMember={handleRemoveMember}
                          onSetCaptain={handleSetCaptain}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-ink">第二张排表：5～9 队</h3>
                  <p className="text-sm text-ninja-gray">导出 PNG「紫川深渊排表-5至9队」时使用本节 5 个队伍块（共 9 队参与排表）。</p>
                  {teamsGrouped.sheet2.length === 0 ? (
                    <div className="text-sm text-ninja-gray border border-dashed border-ink-light rounded-lg p-4">
                      暂无 5～9 队。请点击「初始化默认队伍」或执行 SQL 种子。
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teamsGrouped.sheet2.map((team) => (
                        <AbyssTeamManagementCard
                          key={team.id}
                          team={team}
                          isCaptain={isCaptain}
                          isAdmin={isAdmin}
                          onOpenAddMember={() => {
                            setSelectedTeam(team);
                            setMemberSearch('');
                            setShowMemberModal(true);
                          }}
                          onRemoveMember={handleRemoveMember}
                          onSetCaptain={handleSetCaptain}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-ink">第 10 队（备用）</h3>
                  <p className="text-sm text-ninja-gray">默认两张排表图不包含本队；仍可在此维护成员。</p>
                  {teamsGrouped.spare.length === 0 ? (
                    <div className="text-sm text-ninja-gray border border-dashed border-ink-light rounded-lg p-4">
                      暂无第 10 队记录。初始化默认队伍后会自动出现。
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teamsGrouped.spare.map((team) => (
                        <AbyssTeamManagementCard
                          key={team.id}
                          team={team}
                          isCaptain={isCaptain}
                          isAdmin={isAdmin}
                          onOpenAddMember={() => {
                            setSelectedTeam(team);
                            setMemberSearch('');
                            setShowMemberModal(true);
                          }}
                          onRemoveMember={handleRemoveMember}
                          onSetCaptain={handleSetCaptain}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {teamsGrouped.other.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-lg font-serif font-bold text-ink">其它队伍</h3>
                    <p className="text-sm text-ninja-gray">编号不在 1～10 范围内的数据（需核对 team_number）。</p>
                    <div className="space-y-4">
                      {teamsGrouped.other.map((team) => (
                        <AbyssTeamManagementCard
                          key={team.id}
                          team={team}
                          isCaptain={isCaptain}
                          isAdmin={isAdmin}
                          onOpenAddMember={() => {
                            setSelectedTeam(team);
                            setMemberSearch('');
                            setShowMemberModal(true);
                          }}
                          onRemoveMember={handleRemoveMember}
                          onSetCaptain={handleSetCaptain}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
            {/* 离屏渲染，供 html2canvas 截图（队长/管理员可见按钮时仍挂载，避免 ref 为空） */}
            {isCaptain && (
              <div
                className="fixed left-[-12000px] top-0 pointer-events-none opacity-100"
                aria-hidden
              >
                <AbyssScheduleSheet ref={scheduleSheet1Ref} teams={teamsSheet1} logoSrc={scheduleLogoSrc} />
                <AbyssScheduleSheet ref={scheduleSheet2Ref} teams={teamsSheet2} logoSrc={scheduleLogoSrc} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">深渊伤害排行榜</h2>
            
            {recordsData?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ink-light">
                      <th className="text-left py-3">排名</th>
                      <th className="text-left py-3">玩家</th>
                      <th className="text-left py-3">日期</th>
                      <th className="text-left py-3">伤害</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordsData
                      .sort((a, b) => b.damage_score - a.damage_score)
                      .map((record, index) => (
                        <tr key={record.id} className="border-b border-ink-light hover:bg-paper-dark">
                          <td className="py-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-paper-dark'
                            }`}>
                              {index + 1}
                            </div>
                          </td>
                          <td className="py-3 font-medium">
                            {record.user?.display_name || record.user?.username || '未知'}
                          </td>
                          <td className="py-3">{record.record_date}</td>
                          <td className="py-3 font-bold text-accent-red">{record.damage_score}M</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-ninja-gray">
                <GiRank3 className="text-5xl mx-auto mb-3 opacity-50" />
                <p>暂无排行榜数据</p>
                <p className="text-sm mt-1">提交深渊记录后自动生成</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leave' && (
          <div className="space-y-6">
            <div className="paper-card">
              <h3 className="font-bold mb-4">请假规则（已启用）</h3>
              <ul className="space-y-2 text-ninja-gray">
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 mr-2 mt-1" />
                  成员可自行在本页面提交并确认请假
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 mr-2 mt-1" />
                  确认请假后，会自动从深渊队伍中移除
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 mr-2 mt-1" />
                  请假生效期间，成员无法被加入任何队伍
                </li>
              </ul>
            </div>

            <div className="paper-card">
              <h3 className="font-bold mb-4">提交请假</h3>
              {isCurrentUserOnLeave && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
                  你当前处于请假状态，请假期间无法加入队伍。
                </div>
              )}
              <form onSubmit={handleSubmitLeave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">开始日期</label>
                    <input name="start_date" type="date" required className="brush-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">结束日期</label>
                    <input name="end_date" type="date" required className="brush-input" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">请假原因（可选）</label>
                  <textarea
                    name="reason"
                    rows="3"
                    className="brush-input"
                    placeholder="例如：出差、考试、临时有事"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitLeaveMutation.isLoading}
                  className="ink-button ink-button-primary"
                >
                  {submitLeaveMutation.isLoading ? '提交中...' : '确认请假'}
                </button>
              </form>
            </div>

            <div className="paper-card">
              <h3 className="font-bold mb-4">我的请假记录</h3>
              {leavesLoading ? (
                <div className="text-center py-6 text-ninja-gray">加载中...</div>
              ) : (myLeavesData || []).length > 0 ? (
                <div className="space-y-2">
                  {myLeavesData.map((leave) => (
                    <div key={leave.id} className="p-3 rounded-lg bg-paper-dark flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {leave.start_date} ~ {leave.end_date}
                        </p>
                        <p className="text-sm text-ninja-gray">{leave.reason || '无备注'}</p>
                      </div>
                      <span className={`ink-badge ${
                        leave.status === 'approved'
                          ? 'ink-badge-green'
                          : leave.status === 'rejected'
                            ? 'ink-badge-red'
                            : 'ink-badge-blue'
                      }`}>
                        {leave.status === 'approved' ? '已确认' : leave.status === 'rejected' ? '已拒绝' : '待审核'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-ninja-gray">暂无请假记录</div>
              )}
            </div>

            {(activeLeavesData || []).length > 0 && (
              <div className="paper-card">
                <h3 className="font-bold mb-4">当前请假中的成员</h3>
                <div className="space-y-1">
                  {(activeLeavesData || []).map((leave) => (
                    <div key={leave.id} className="text-sm text-ninja-gray">
                      {(leave.user?.display_name || leave.user?.username || '未知成员')}（{leave.start_date} ~ {leave.end_date}）
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showRecordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="paper-card w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">提交深渊记录</h3>
            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">记录日期</label>
                <input
                  name="record_date"
                  type="date"
                  required
                  className="brush-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">伤害分数</label>
                <input
                  name="damage_score"
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  className="brush-input"
                  placeholder="例如：85.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">排名（可选）</label>
                <input
                  name="rank"
                  type="number"
                  min="1"
                  className="brush-input"
                  placeholder="可不填"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">备注（可选）</label>
                <textarea
                  name="notes"
                  rows="2"
                  className="brush-input"
                  placeholder="其他说明..."
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="ink-button ink-button-primary flex-1">
                  提交
                </button>
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="ink-button flex-1"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="paper-card w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">添加成员到 {selectedTeam.team_name}</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <input type="hidden" name="team_id" value={selectedTeam.id} />
              
              <div>
                <label className="block text-sm font-medium mb-1">搜索成员</label>
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="brush-input"
                  placeholder="输入昵称/用户名/游戏ID"
                />
                <p className="text-xs text-ninja-gray mt-1">
                  共 {getAvailableMembers(selectedTeam).length} 人，可显示 {getFilteredMembers(selectedTeam).length} 人
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">选择成员</label>
                <select name="user_id" required className="brush-input">
                  <option value="">请选择家族成员</option>
                  {getFilteredMembers(selectedTeam).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.display_name || m.username} (ID: {m.game_id})
                    </option>
                  ))}
                </select>
                {getAvailableMembers(selectedTeam).length === 0 && (
                  <p className="text-sm text-ninja-gray mt-1">所有成员都已在该队伍中</p>
                )}
                {getAvailableMembers(selectedTeam).length > 0 && getFilteredMembers(selectedTeam).length === 0 && (
                  <p className="text-sm text-ninja-gray mt-1">没有匹配的成员，请调整搜索关键词</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">角色</label>
                <select name="role" className="brush-input">
                  <option value="member">队员</option>
                  {isAdmin && <option value="captain">队长</option>}
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="submit" className="ink-button ink-button-primary flex-1">
                  添加
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMemberModal(false);
                    setMemberSearch('');
                  }}
                  className="ink-button flex-1"
                >
                  取消
                </button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-ink-light">
              <h4 className="text-sm font-medium mb-2">当前队伍成员</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {selectedTeam.members?.map(m => (
                  <div key={m.id} className="text-sm text-ninja-gray flex items-center">
                    <span className={m.role === 'captain' ? 'text-accent-red font-medium' : ''}>
                      {m.role === 'captain' ? '👑' : '•'} {m.user?.display_name || m.user?.username}
                    </span>
                  </div>
                )) || <p className="text-sm text-ninja-gray">暂无成员</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Abyss;
