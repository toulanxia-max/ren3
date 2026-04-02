import api from './api';

// SS+猎杀系统API服务

// 获取今日猎杀任务
export const getHuntTasks = async () => {
  try {
    const response = await api.get('/hunts/tasks');
    return response.data;
  } catch (error) {
    console.error('获取猎杀任务失败:', error);
    throw error;
  }
};

// 上传猎杀截图
export const uploadHuntScreenshot = async (formData) => {
  try {
    const response = await api.post('/hunts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('上传猎杀截图失败:', error);
    throw error;
  }
};

// 提交猎杀记录
export const submitHuntRecord = async (recordData) => {
  try {
    const response = await api.post('/hunts/records', recordData);
    return response.data;
  } catch (error) {
    console.error('提交猎杀记录失败:', error);
    throw error;
  }
};

// 获取猎杀历史记录
export const getHuntHistory = async (limit = 20) => {
  try {
    const response = await api.get('/hunts/history', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('获取猎杀历史失败:', error);
    throw error;
  }
};

// 获取猎杀统计数据
export const getHuntStats = async () => {
  try {
    const response = await api.get('/hunts/stats');
    return response.data;
  } catch (error) {
    console.error('获取猎杀统计数据失败:', error);
    throw error;
  }
};

// 分配猎杀任务
export const assignHuntTask = async (taskId, assignee) => {
  try {
    const response = await api.put(`/hunts/tasks/${taskId}/assign`, { assignee });
    return response.data;
  } catch (error) {
    console.error('分配猎杀任务失败:', error);
    throw error;
  }
};

// 更新猎杀任务进度
export const updateHuntTaskProgress = async (taskId, progress) => {
  try {
    const response = await api.put(`/hunts/tasks/${taskId}/progress`, { progress });
    return response.data;
  } catch (error) {
    console.error('更新猎杀任务进度失败:', error);
    throw error;
  }
};

// 获取BOSS分布数据
export const getBossDistribution = async () => {
  try {
    const response = await api.get('/hunts/distribution');
    return response.data;
  } catch (error) {
    console.error('获取BOSS分布数据失败:', error);
    throw error;
  }
};

// 获取猎手排行榜
export const getHunterRankings = async () => {
  try {
    const response = await api.get('/hunts/rankings');
    return response.data;
  } catch (error) {
    console.error('获取猎手排行榜失败:', error);
    throw error;
  }
};

// 模拟数据（当后端API未就绪时使用）
export const mockHuntTasks = [
  { id: 1, target: '雷龙', level: 'SS+', time: '14:30', assignedTo: '忍者小明', status: 'completed', progress: 100 },
  { id: 2, target: '冰凤凰', level: 'SS+', time: '16:00', assignedTo: '影之忍者', status: 'in_progress', progress: 60 },
  { id: 3, target: '火麒麟', level: 'SS+', time: '18:30', assignedTo: '风之忍', status: 'pending', progress: 0 },
  { id: 4, target: '土玄武', level: 'SS+', time: '20:15', assignedTo: '未分配', status: 'unassigned', progress: 0 },
];

export const mockHuntHistory = [
  { date: '2023-05-14', target: '雷龙', hunter: '火影', time: '2分45秒', reward: 'S级宝物' },
  { date: '2023-05-13', target: '冰凤凰', hunter: '水影', time: '3分10秒', reward: 'A级碎片×5' },
  { date: '2023-05-12', target: '火麒麟', hunter: '风之忍', time: '2分55秒', reward: 'SS级材料' },
  { date: '2023-05-11', target: '土玄武', hunter: '忍者小明', time: '4分20秒', reward: 'S级忍具' },
];

export const mockHuntStats = {
  totalHunts: 130,
  successRate: '92%',
  averageTime: '2分58秒',
  totalRewards: '48个S级宝物',
};

export const mockBossDistribution = [
  { boss: '雷龙', count: 45, percent: 35 },
  { boss: '冰凤凰', count: 38, percent: 29 },
  { boss: '火麒麟', count: 32, percent: 25 },
  { boss: '土玄武', count: 15, percent: 11 },
];

export const mockHunterRankings = [
  { name: '火影', hunts: 28, efficiency: '2分45秒' },
  { name: '水影', hunts: 25, efficiency: '2分50秒' },
  { name: '风之忍', hunts: 22, efficiency: '2分55秒' },
  { name: '忍者小明', hunts: 20, efficiency: '3分10秒' },
];