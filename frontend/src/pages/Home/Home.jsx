import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../contexts/AuthContext';
import {
  FiUsers, FiTarget, FiCalendar,
  FiTrendingUp, FiAward, FiClock, FiStar, FiRefreshCw
} from 'react-icons/fi';
import { GiScrollUnfurled, GiStoneBlock } from 'react-icons/gi';
import ClanLogo from '../../components/ClanLogo/ClanLogo';
import { toast } from 'react-hot-toast';

const Home = () => {
  const { user, isCaptain } = useAuth();
  const queryClient = useQueryClient();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailType, setDetailType] = useState('');
  const [expandedTeamIds, setExpandedTeamIds] = useState([]);
  const [weeklyForm, setWeeklyForm] = useState({
    element_order: '',
    weekly_code: ''
  });

  const queryOpts = {
    staleTime: 15000,
    refetchOnWindowFocus: true,
    retry: 1,
  };

  const { data: usersList = [], isLoading: usersLoading, isFetching: usersFetching } = useQuery(
    'users-list',
    () => api.get('/users').then((res) => res.data?.users || []),
    queryOpts
  );

  const { data: abyssTeams = [], isLoading: teamsLoading, isFetching: teamsFetching } = useQuery(
    'abyss-teams',
    () =>
      api.get('/abyss/teams').then((res) => {
        const raw = res?.data?.teams ?? res?.teams;
        return Array.isArray(raw) ? raw : [];
      }),
    queryOpts
  );

  const { data: abyssRecords = [], isLoading: recordsLoading, isFetching: recordsFetching } = useQuery(
    'abyss-records',
    () => api.get('/abyss/records').then((res) => res.data?.records || []),
    queryOpts
  );

  const { data: battlesList = [], isLoading: battlesLoading, isFetching: battlesFetching } = useQuery(
    'battles-list-all',
    () => api.get('/battles').then((res) => res.data?.battles || []),
    queryOpts
  );

  const stats = useMemo(
    () => ({
      memberCount: Array.isArray(usersList) ? usersList.length : 0,
      teamCount: Array.isArray(abyssTeams) ? abyssTeams.length : 0,
      abyssRecordCount: Array.isArray(abyssRecords) ? abyssRecords.length : 0,
      battleCount: Array.isArray(battlesList) ? battlesList.length : 0,
    }),
    [usersList, abyssTeams, abyssRecords, battlesList]
  );

  const isLoading = usersLoading || teamsLoading || recordsLoading || battlesLoading;
  const isFetching = usersFetching || teamsFetching || recordsFetching || battlesFetching;

  const membersData = usersList;
  const teamsData = abyssTeams;

  const refetchDashboard = () => {
    queryClient.invalidateQueries('users-list');
    queryClient.invalidateQueries('abyss-teams');
    queryClient.invalidateQueries('abyss-records');
    queryClient.invalidateQueries('battles-list-all');
  };

  const { data: weeklyConfig } = useQuery(
    'home-weekly-config',
    () => api.get('/abyss/weekly-config').then((res) => res.data || {})
  );

  useEffect(() => {
    if (!weeklyConfig) return;
    setWeeklyForm({
      element_order: weeklyConfig.element_order || '',
      weekly_code: weeklyConfig.weekly_code || ''
    });
  }, [weeklyConfig]);

  const updateWeeklyConfigMutation = useMutation(
    (payload) => api.put('/abyss/weekly-config', payload),
    {
      onSuccess: () => {
        toast.success('本周配置更新成功');
        queryClient.invalidateQueries('home-weekly-config');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || '更新失败');
      }
    }
  );

  const handleUpdateWeeklyConfig = (e) => {
    e.preventDefault();
    updateWeeklyConfigMutation.mutate({
      element_order: weeklyForm.element_order.trim(),
      weekly_code: weeklyForm.weekly_code.trim()
    });
  };

  const statsData = [
    { 
      label: '家族成员', 
      value: isLoading ? '...' : stats.memberCount, 
      icon: <FiUsers />, 
      color: 'accent-blue' 
    },
    { 
      label: '深渊队伍', 
      value: isLoading ? '...' : stats.teamCount, 
      icon: <GiStoneBlock />, 
      color: 'accent-red' 
    },
    { 
      label: '深渊记录', 
      value: isLoading ? '...' : stats.abyssRecordCount, 
      icon: <FiTrendingUp />, 
      color: 'accent-green' 
    },
    { 
      label: '家族战', 
      value: isLoading ? '...' : stats.battleCount, 
      icon: <FiTarget />, 
      color: 'accent-gold' 
    },
  ];

  const quickActions = [
    { title: '深渊排表', description: '查看本周深渊队伍安排', icon: <GiScrollUnfurled />, path: '/abyss', color: 'red' },
    { title: 'SS+猎杀', description: '提交猎杀截图或查看任务', icon: <FiTarget />, path: '/hunts', color: 'blue' },
    { title: '家族战', description: '查看对战记录和战绩', icon: <FiTarget />, path: '/battles', color: 'gold' },
    { title: '活动日历', description: '查看近期家族活动', icon: <FiCalendar />, path: '/activities', color: 'green' },
  ];

  const openDetail = (type) => {
    setDetailType(type);
    if (type !== 'teams') {
      setExpandedTeamIds([]);
    }
    setShowDetailModal(true);
  };

  const toggleTeamExpanded = (teamId) => {
    setExpandedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => refetchDashboard()}
          disabled={isFetching}
          className="flex items-center text-sm text-ninja-gray hover:text-ink transition-colors"
        >
          <FiRefreshCw className={`mr-1 ${isFetching ? 'animate-spin' : ''}`} />
          刷新数据
        </button>
      </div>

      <div className="paper-card bg-gradient-to-r from-ink to-ink-dark text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">
              欢迎回来，{user?.display_name || user?.username || '忍者'}！
            </h1>
            <p className="text-paper opacity-90">
              本周四象顺序：<span className="font-bold text-accent-red">{weeklyConfig?.element_order || '未设置'}</span>
            </p>
            <p className="text-paper opacity-90 mt-1">
              本周兑换码：<span className="font-bold text-accent-gold">{weeklyConfig?.weekly_code || '未设置'}</span>
            </p>
            {isCaptain && (
              <p className="text-sm text-accent-gold mt-1">管理模式</p>
            )}
          </div>
          <div className="mt-4 md:mt-0">
            <ClanLogo sizeClass="w-28 h-28 md:w-32 md:h-32" className="shadow-lg ring-2 ring-white/20" />
          </div>
        </div>
      </div>

      {isCaptain && (
        <div className="paper-card">
          <h2 className="text-xl font-serif font-bold mb-4">本周首页配置（队长/管理员）</h2>
          <form onSubmit={handleUpdateWeeklyConfig} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">本周四象顺序</label>
              <input
                type="text"
                className="brush-input w-full"
                value={weeklyForm.element_order}
                onChange={(e) => setWeeklyForm((prev) => ({ ...prev, element_order: e.target.value }))}
                placeholder="例如：青龙/白虎/朱雀/玄武"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">本周兑换码</label>
              <input
                type="text"
                className="brush-input w-full"
                value={weeklyForm.weekly_code}
                onChange={(e) => setWeeklyForm((prev) => ({ ...prev, weekly_code: e.target.value }))}
                placeholder="例如：N3WEEK2026"
                required
              />
            </div>
            <button
              type="submit"
              disabled={updateWeeklyConfigMutation.isLoading}
              className="ink-button ink-button-primary"
            >
              {updateWeeklyConfigMutation.isLoading ? '保存中...' : '保存本周配置'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              if (stat.label === '家族成员') openDetail('members');
              if (stat.label === '深渊队伍') openDetail('teams');
            }}
            className={`paper-card animate-slide-in text-left w-full ${
              stat.label === '家族成员' || stat.label === '深渊队伍' ? 'hover:border-accent-red border border-ink-light' : ''
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ninja-gray">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                {(stat.label === '家族成员' || stat.label === '深渊队伍') && (
                  <p className="text-xs text-accent-blue mt-1">点击查看详情</p>
                )}
              </div>
              <div className={`text-3xl text-${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="paper-card">
        <h2 className="text-xl font-serif font-bold mb-4 flex items-center">
          <FiStar className="mr-2 text-accent-gold" />
          快速操作
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="group p-4 rounded-lg border border-ink-light hover:border-accent-red transition-all duration-200 hover:shadow-lg"
            >
              <div className={`text-3xl text-accent-${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="font-bold text-lg mb-1">{action.title}</h3>
              <p className="text-sm text-ninja-gray">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="paper-card">
          <h2 className="text-xl font-serif font-bold mb-4 flex items-center">
            <FiClock className="mr-2 text-accent-blue" />
            使用指南
          </h2>
          <div className="space-y-3">
            <div className="flex items-start p-3 rounded-lg bg-paper-dark">
              <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center mr-3 font-bold">1</div>
              <div>
                <div className="font-bold">完善个人信息</div>
                <div className="text-sm text-ninja-gray">在个人中心设置游戏ID和显示名称</div>
              </div>
            </div>
            <div className="flex items-start p-3 rounded-lg bg-paper-dark">
              <div className="w-8 h-8 rounded-full bg-accent-red/20 text-accent-red flex items-center justify-center mr-3 font-bold">2</div>
              <div>
                <div className="font-bold">查看深渊排表</div>
                <div className="text-sm text-ninja-gray">在深渊系统查看本周队伍安排</div>
              </div>
            </div>
            <div className="flex items-start p-3 rounded-lg bg-paper-dark">
              <div className="w-8 h-8 rounded-full bg-accent-gold/20 text-accent-gold flex items-center justify-center mr-3 font-bold">3</div>
              <div>
                <div className="font-bold">参与SS+猎杀</div>
                <div className="text-sm text-ninja-gray">上传截图获取猎杀任务</div>
              </div>
            </div>
            <div className="flex items-start p-3 rounded-lg bg-paper-dark">
              <div className="w-8 h-8 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center mr-3 font-bold">4</div>
              <div>
                <div className="font-bold">记录家族战</div>
                <div className="text-sm text-ninja-gray">查看对战记录和战绩统计</div>
              </div>
            </div>
          </div>
        </div>

        <div className="paper-card">
          <h2 className="text-xl font-serif font-bold mb-4 flex items-center">
            <FiAward className="mr-2 text-accent-gold" />
            深渊排行榜
          </h2>
          <div className="text-center py-8 text-ninja-gray">
            <GiStoneBlock className="text-5xl mx-auto mb-3 opacity-50" />
            <p>暂无排行榜数据</p>
            <p className="text-sm mt-1">完成深渊挑战后自动生成</p>
          </div>
          <div className="mt-4 text-center">
            <Link to="/abyss" className="text-accent-blue hover:underline text-sm">
              前往深渊系统 →
            </Link>
          </div>
        </div>
      </div>

      <div className="paper-card">
        <h2 className="text-xl font-serif font-bold mb-4">系统公告</h2>
        <div className="p-4 bg-gradient-to-r from-accent-gold/10 to-accent-red/10 rounded-lg">
          <div className="text-center py-4">
            <p className="text-lg font-bold text-ink">欢迎使用紫川家族管理系统</p>
            <p className="text-sm text-ninja-gray mt-2">
              {user?.role === 'admin' 
                ? '您是管理员，可以管理所有功能模块' 
                : '如有问题请在家族群内反馈'}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-ninja-gray p-4">
        <p>紫川家族管理系统 v1.0.0</p>
        <p className="mt-1">最后更新: {new Date().toLocaleDateString('zh-CN')}</p>
      </div>

      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="paper-card w-full max-w-3xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {detailType === 'members' ? '家族成员列表' : '深渊队伍列表'}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="ink-button"
              >
                关闭
              </button>
            </div>

            <div className="overflow-y-auto max-h-[62vh]">
              {detailType === 'members' && (
                <div className="space-y-2">
                  {(membersData || []).map((member) => (
                    <div key={member.id} className="p-3 rounded-lg bg-paper-dark flex items-center justify-between">
                      <div>
                        <div className="font-bold">
                          {member.display_name || member.username}
                          <span className="text-sm text-ninja-gray ml-2">
                            （宝物: {member.treasure_config || '未填写'}，配置: {member.abyss_role_config || '未填写'}）
                          </span>
                        </div>
                        <div className="text-sm text-ninja-gray">ID: {member.game_id}</div>
                      </div>
                      <span className={`ink-badge ${
                        member.role === 'admin' ? 'ink-badge-red' :
                        member.role === 'captain' ? 'ink-badge-blue' : 'ink-badge'
                      }`}>
                        {member.role === 'admin' ? '管理员' : member.role === 'captain' ? '队长' : '成员'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {detailType === 'teams' && (
                <div className="space-y-3">
                  {(teamsData || []).map((team) => (
                    <div key={team.id} className="p-3 rounded-lg bg-paper-dark">
                      <button
                        type="button"
                        onClick={() => toggleTeamExpanded(team.id)}
                        className="w-full flex items-center justify-between mb-2 text-left"
                      >
                        <div className="font-bold text-accent-red">{team.team_name}</div>
                        <div className="text-sm text-ninja-gray">
                          {team.members?.length || 0} 人 {expandedTeamIds.includes(team.id) ? '▲' : '▼'}
                        </div>
                      </button>
                      <div className="text-sm text-ninja-gray">
                        队长：{team.members?.find((m) => m.role === 'captain')?.user?.display_name || '暂无'}
                      </div>
                      {expandedTeamIds.includes(team.id) && (
                        <div className="mt-3 pt-3 border-t border-ink-light space-y-1">
                          {(team.members || []).length > 0 ? (
                            (team.members || []).map((member) => (
                              <div key={member.id} className="text-sm text-ninja-gray flex items-center justify-between">
                                <span>
                                  {member.role === 'captain' ? '👑 ' : '• '}
                                  {member.user?.display_name || member.user?.username || '未知成员'}
                                </span>
                                <span>ID: {member.user?.game_id || '-'}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-ninja-gray">暂无成员</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
