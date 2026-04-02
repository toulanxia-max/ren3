import api from './api';

// 用户管理API服务

// 获取用户信息
export const getUserProfile = async (userId = null) => {
  try {
    const endpoint = userId ? `/users/${userId}` : '/users/profile';
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

// 更新用户信息
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    console.error('更新用户信息失败:', error);
    throw error;
  }
};

// 获取用户游戏数据
export const getUserGameStats = async (userId = null) => {
  try {
    const endpoint = userId ? `/users/${userId}/game-stats` : '/users/game-stats';
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('获取用户游戏数据失败:', error);
    throw error;
  }
};

// 获取用户成就
export const getUserAchievements = async (userId = null) => {
  try {
    const endpoint = userId ? `/users/${userId}/achievements` : '/users/achievements';
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('获取用户成就失败:', error);
    throw error;
  }
};

// 获取用户活跃度数据
export const getUserActivity = async (period = 'weekly') => {
  try {
    const response = await api.get('/users/activity', { params: { period } });
    return response.data;
  } catch (error) {
    console.error('获取用户活跃度数据失败:', error);
    throw error;
  }
};

// 获取家族贡献排行榜
export const getClanContributionRankings = async (limit = 20) => {
  try {
    const response = await api.get('/users/contributions', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('获取家族贡献排行榜失败:', error);
    throw error;
  }
};

// 更新用户偏好设置
export const updateUserPreferences = async (preferences) => {
  try {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('更新用户偏好设置失败:', error);
    throw error;
  }
};

// 获取用户通知设置
export const getUserNotifications = async () => {
  try {
    const response = await api.get('/users/notifications');
    return response.data;
  } catch (error) {
    console.error('获取用户通知设置失败:', error);
    throw error;
  }
};

// 更新用户通知设置
export const updateUserNotifications = async (notifications) => {
  try {
    const response = await api.put('/users/notifications', notifications);
    return response.data;
  } catch (error) {
    console.error('更新用户通知设置失败:', error);
    throw error;
  }
};

// 同步游戏数据
export const syncGameData = async () => {
  try {
    const response = await api.post('/users/sync-game-data');
    return response.data;
  } catch (error) {
    console.error('同步游戏数据失败:', error);
    throw error;
  }
};

// 管理员：获取用户列表
export const getUsers = async (params = {}) => {
  try {
    const response = await api.get('/users', { params });
    return response.data;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
};

// 管理员：更新用户角色
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('更新用户角色失败:', error);
    throw error;
  }
};

// 模拟数据（当后端API未就绪时使用）
export const mockUserGameStats = {
  level: 150,
  rank: '影忍',
  joinDate: '2022-08-15',
  totalDays: 285,
  favoriteWeapon: '雷剑·麒麟',
  favoriteCharacter: '苍牙',
  abyssAvgDamage: '87.5M',
  huntSuccessRate: '92%',
  battleWinRate: '78%'
};

export const mockUserAchievements = [
  { id: 1, title: '深渊征服者', description: '连续3周深渊伤害排名前10', date: '2023-05-14', icon: 'stone' },
  { id: 2, title: 'SS+猎杀大师', description: '成功猎杀10次SS+BOSS', date: '2023-05-12', icon: 'target' },
  { id: 3, title: '家族战英雄', description: '单次家族战MVP次数达5次', date: '2023-05-10', icon: 'sword' },
  { id: 4, title: '活动达人', description: '连续参与10次家族活动', date: '2023-05-08', icon: 'calendar' },
];

export const mockUserActivity = {
  weeklyLogins: 12,
  weeklyActivities: 5,
  unreadMessages: 3,
  pendingTasks: 8
};

export const mockClanContributionRankings = [
  { name: '火影', contribution: 2850, rank: 1 },
  { name: '水影', contribution: 2420, rank: 2 },
  { name: '风之忍', contribution: 1980, rank: 3 },
  { name: '忍者小明', contribution: 1250, rank: 15 },
];