import api from './api';

// 活动管理系统API服务

// 获取近期活动
export const getUpcomingEvents = async () => {
  try {
    const response = await api.get('/activities/events');
    return response.data;
  } catch (error) {
    console.error('获取近期活动失败:', error);
    throw error;
  }
};

// 创建新活动
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/activities/events', eventData);
    return response.data;
  } catch (error) {
    console.error('创建活动失败:', error);
    throw error;
  }
};

// 报名参加活动
export const registerForEvent = async (eventId) => {
  try {
    const response = await api.post(`/activities/events/${eventId}/register`);
    return response.data;
  } catch (error) {
    console.error('报名活动失败:', error);
    throw error;
  }
};

// 获取兑换码列表
export const getRedemptionCodes = async () => {
  try {
    const response = await api.get('/activities/codes');
    return response.data;
  } catch (error) {
    console.error('获取兑换码列表失败:', error);
    throw error;
  }
};

// 生成兑换码
export const generateRedemptionCode = async (codeData) => {
  try {
    const response = await api.post('/activities/codes', codeData);
    return response.data;
  } catch (error) {
    console.error('生成兑换码失败:', error);
    throw error;
  }
};

// 获取我的参与记录
export const getMyParticipations = async () => {
  try {
    const response = await api.get('/activities/participations/my');
    return response.data;
  } catch (error) {
    console.error('获取我的参与记录失败:', error);
    throw error;
  }
};

// 获取活动统计数据
export const getActivityStats = async () => {
  try {
    const response = await api.get('/activities/stats');
    return response.data;
  } catch (error) {
    console.error('获取活动统计数据失败:', error);
    throw error;
  }
};

// 获取活动日历
export const getActivityCalendar = async (year, month) => {
  try {
    const response = await api.get('/activities/calendar', { params: { year, month } });
    return response.data;
  } catch (error) {
    console.error('获取活动日历失败:', error);
    throw error;
  }
};

// 更新兑换码状态
export const updateRedemptionCode = async (codeId, codeData) => {
  try {
    const response = await api.put(`/activities/codes/${codeId}`, codeData);
    return response.data;
  } catch (error) {
    console.error('更新兑换码状态失败:', error);
    throw error;
  }
};

// 删除活动
export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/activities/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('删除活动失败:', error);
    throw error;
  }
};

// 模拟数据（当后端API未就绪时使用）
export const mockUpcomingEvents = [
  { id: 1, title: '家族聚餐', date: '2023-05-20', time: '19:00', location: '家族YY频道', participants: 28, maxParticipants: 50, status: 'open' },
  { id: 2, title: '新人指导课', date: '2023-05-21', time: '20:30', location: '游戏内', participants: 15, maxParticipants: 30, status: 'open' },
  { id: 3, title: '深渊竞速赛', date: '2023-05-22', time: '21:00', location: '深渊挑战', participants: 40, maxParticipants: 40, status: 'full' },
  { id: 4, title: '家族战战术讨论', date: '2023-05-23', time: '20:00', location: '家族群', participants: 22, maxParticipants: 50, status: 'open' },
];

export const mockRedemptionCodes = [
  { code: 'NINJA2023SPRING', description: '春季礼包', uses: 45, maxUses: 100, expiry: '2023-06-30', status: 'active' },
  { code: 'CLANMAY2023', description: '五月家族礼包', uses: 12, maxUses: 50, expiry: '2023-05-31', status: 'active' },
  { code: 'SSPLUSREWARD', description: 'SS+猎杀奖励', uses: 30, maxUses: 30, expiry: '2023-05-25', status: 'used' },
  { code: 'ABYSSCHAMP', description: '深渊冠军礼包', uses: 8, maxUses: 10, expiry: '2023-06-15', status: 'active' },
];

export const mockMyParticipations = [
  { event: '深渊挑战周赛', date: '2023-05-14', role: '参赛者', status: 'completed' },
  { event: 'SS+猎杀训练', date: '2023-05-13', role: '学员', status: 'completed' },
  { event: '家族战战术课', date: '2023-05-12', role: '参与者', status: 'completed' },
  { event: '新人欢迎会', date: '2023-05-10', role: '协助者', status: 'completed' },
];

export const mockActivityStats = {
  monthlyParticipations: 12,
  participationRate: '85%',
  organizedEvents: 3,
  upcomingEvents: 4
};

export const mockActivityCalendar = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  events: [
    i === 19 ? { title: '家族聚餐', type: 'social' } : null,
    i === 20 ? { title: '新人指导', type: 'training' } : null,
    i === 21 ? { title: '深渊竞速', type: 'competition' } : null,
    i === 22 ? { title: '战术讨论', type: 'meeting' } : null,
  ].filter(Boolean)
}));