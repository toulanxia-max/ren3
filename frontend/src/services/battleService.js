import api from './api';

// 家族战系统API服务

// 获取近期家族战记录
export const getRecentBattles = async (limit = 10) => {
  try {
    const response = await api.get('/battles/recent', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('获取家族战记录失败:', error);
    throw error;
  }
};

// 获取家族战统计数据
export const getBattleStats = async () => {
  try {
    const response = await api.get('/battles/stats');
    return response.data;
  } catch (error) {
    console.error('获取家族战统计数据失败:', error);
    throw error;
  }
};

// 获取成员贡献排行榜
export const getContributorRankings = async () => {
  try {
    const response = await api.get('/battles/contributors');
    return response.data;
  } catch (error) {
    console.error('获取成员贡献排行榜失败:', error);
    throw error;
  }
};

// 获取对战安排
export const getBattleSchedule = async () => {
  try {
    const response = await api.get('/battles/schedule');
    return response.data;
  } catch (error) {
    console.error('获取对战安排失败:', error);
    throw error;
  }
};

// 添加家族战记录
export const addBattleRecord = async (battleData) => {
  try {
    const response = await api.post('/battles', battleData);
    return response.data;
  } catch (error) {
    console.error('添加家族战记录失败:', error);
    throw error;
  }
};

// 安排新的对战
export const scheduleBattle = async (scheduleData) => {
  try {
    const response = await api.post('/battles/schedule', scheduleData);
    return response.data;
  } catch (error) {
    console.error('安排对战失败:', error);
    throw error;
  }
};

// 获取我的家族战数据
export const getMyBattleStats = async () => {
  try {
    const response = await api.get('/battles/my-stats');
    return response.data;
  } catch (error) {
    console.error('获取我的家族战数据失败:', error);
    throw error;
  }
};

// 获取胜率趋势数据
export const getWinRateTrend = async () => {
  try {
    const response = await api.get('/battles/win-rate-trend');
    return response.data;
  } catch (error) {
    console.error('获取胜率趋势数据失败:', error);
    throw error;
  }
};

// 获取对战类型分布
export const getBattleTypeDistribution = async () => {
  try {
    const response = await api.get('/battles/type-distribution');
    return response.data;
  } catch (error) {
    console.error('获取对战类型分布失败:', error);
    throw error;
  }
};

// 更新出战名单
export const updateLineup = async (lineupData) => {
  try {
    const response = await api.put('/battles/lineup', lineupData);
    return response.data;
  } catch (error) {
    console.error('更新出战名单失败:', error);
    throw error;
  }
};

// 模拟数据（当后端API未就绪时使用）
export const mockRecentBattles = [
  { date: '2023-05-14', opponent: '影之家族', result: 'win', score: '3-1', duration: '25分钟' },
  { date: '2023-05-13', opponent: '风之忍团', result: 'win', score: '3-0', duration: '20分钟' },
  { date: '2023-05-12', opponent: '火麒麟家族', result: 'lose', score: '1-3', duration: '30分钟' },
  { date: '2023-05-11', opponent: '水影联盟', result: 'win', score: '3-2', duration: '35分钟' },
];

export const mockBattleStats = {
  total: 48,
  wins: 36,
  losses: 12,
  winRate: '75%',
  streak: 5,
  bestStreak: 8
};

export const mockContributorRankings = [
  { name: '火影', wins: 28, damage: '45.2M', mvp: 12 },
  { name: '水影', wins: 25, damage: '42.8M', mvp: 10 },
  { name: '风之忍', wins: 22, damage: '38.5M', mvp: 8 },
  { name: '忍者小明', wins: 20, damage: '35.1M', mvp: 6 },
];

export const mockBattleSchedule = [
  { date: '2023-05-17', opponent: '影之家族', time: '20:00', status: 'confirmed', notes: '注意对方主力忍者为火属性' },
  { date: '2023-05-20', opponent: '风之忍团', time: '19:30', status: 'pending', notes: '希望进行3v3表演赛' },
];

export const mockMyBattleStats = {
  participations: 15,
  wins: 12,
  totalDamage: '38.2M',
  mvpCount: 3
};

export const mockWinRateTrend = [65, 72, 68, 75, 80, 78, 82];

export const mockBattleTypeDistribution = [
  { type: '常规战', count: 32, percent: 67 },
  { type: '友谊赛', count: 10, percent: 21 },
  { type: '锦标赛', count: 6, percent: 12 },
];