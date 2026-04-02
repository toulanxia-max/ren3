import api from './api';

// 深渊系统API服务

// 获取本周深渊排表
export const getAbyssSchedule = async (week = null) => {
  try {
    const params = week ? { week } : {};
    const response = await api.get('/abyss/schedule', { params });
    return response.data;
  } catch (error) {
    console.error('获取深渊排表失败:', error);
    throw error;
  }
};

// 获取深渊队伍列表
export const getAbyssTeams = async () => {
  try {
    const response = await api.get('/abyss/teams');
    return response.data;
  } catch (error) {
    console.error('获取深渊队伍失败:', error);
    throw error;
  }
};

// 获取深渊伤害排行榜
export const getAbyssRankings = async (limit = 20) => {
  try {
    const response = await api.get('/abyss/rankings', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('获取深渊排行榜失败:', error);
    throw error;
  }
};

// 申请请假
export const requestAbyssLeave = async (leaveData) => {
  try {
    const response = await api.post('/abyss/leave', leaveData);
    return response.data;
  } catch (error) {
    console.error('申请请假失败:', error);
    throw error;
  }
};

// 获取我的请假记录
export const getMyAbyssLeaves = async () => {
  try {
    const response = await api.get('/abyss/leaves/my');
    return response.data;
  } catch (error) {
    console.error('获取请假记录失败:', error);
    throw error;
  }
};

// 获取深渊统计数据
export const getAbyssStats = async () => {
  try {
    const response = await api.get('/abyss/stats');
    return response.data;
  } catch (error) {
    console.error('获取深渊统计数据失败:', error);
    throw error;
  }
};

// 提交深渊伤害记录
export const submitAbyssDamage = async (damageData) => {
  try {
    const response = await api.post('/abyss/damage', damageData);
    return response.data;
  } catch (error) {
    console.error('提交深渊伤害失败:', error);
    throw error;
  }
};

// 管理员：调整深渊队伍
export const updateAbyssTeam = async (teamId, teamData) => {
  try {
    const response = await api.put(`/abyss/teams/${teamId}`, teamData);
    return response.data;
  } catch (error) {
    console.error('调整深渊队伍失败:', error);
    throw error;
  }
};

// 管理员：更新深渊排表
export const updateAbyssSchedule = async (scheduleData) => {
  try {
    const response = await api.post('/abyss/schedule/update', scheduleData);
    return response.data;
  } catch (error) {
    console.error('更新深渊排表失败:', error);
    throw error;
  }
};

// 模拟数据（当后端API未就绪时使用）
export const mockAbyssSchedule = [
  { date: '2023-05-15', team: '第1队', members: 10, status: 'completed' },
  { date: '2023-05-16', team: '第2队', members: 9, status: 'completed' },
  { date: '2023-05-17', team: '第3队', members: 10, status: 'scheduled' },
  { date: '2023-05-18', team: '第4队', members: 8, status: 'scheduled' },
  { date: '2023-05-19', team: '第5队', members: 10, status: 'scheduled' },
];

export const mockAbyssTeams = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `第${i + 1}队`,
  captain: `队长${i + 1}`,
  members: Array.from({ length: 10 }, (_, j) => `成员${i * 10 + j + 1}`),
  status: i < 8 ? 'active' : 'inactive'
}));

export const mockAbyssRankings = Array.from({ length: 20 }, (_, i) => ({
  rank: i + 1,
  name: `忍者玩家${i + 1}`,
  damage: (100 - i * 2.5).toFixed(2),
  team: `第${Math.floor(i / 2) + 1}队`,
  improvement: i % 3 === 0 ? '↑' : i % 3 === 1 ? '↓' : '-'
}));