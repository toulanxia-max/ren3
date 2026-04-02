import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getUpcomingEvents,
  createEvent,
  registerForEvent,
  getRedemptionCodes,
  generateRedemptionCode,
  getMyParticipations,
  getActivityStats,
  getActivityCalendar,
  updateRedemptionCode,
  deleteEvent,
  mockUpcomingEvents,
  mockRedemptionCodes,
  mockMyParticipations,
  mockActivityStats,
  mockActivityCalendar
} from '../services/activityService';

// 是否使用模拟数据（当后端API未就绪时）
const USE_MOCK_DATA = true;

// 获取近期活动
export const useUpcomingEvents = (options = {}) => {
  return useQuery(
    ['activities', 'events'],
    () => USE_MOCK_DATA ? Promise.resolve(mockUpcomingEvents) : getUpcomingEvents(),
    {
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      ...options,
    }
  );
};

// 获取兑换码列表
export const useRedemptionCodes = (options = {}) => {
  return useQuery(
    ['activities', 'codes'],
    () => USE_MOCK_DATA ? Promise.resolve(mockRedemptionCodes) : getRedemptionCodes(),
    {
      staleTime: 10 * 60 * 1000, // 10分钟
      ...options,
    }
  );
};

// 获取我的参与记录
export const useMyParticipations = (options = {}) => {
  return useQuery(
    ['activities', 'participations', 'my'],
    () => USE_MOCK_DATA ? Promise.resolve(mockMyParticipations) : getMyParticipations(),
    {
      staleTime: 10 * 60 * 1000, // 10分钟
      ...options,
    }
  );
};

// 获取活动统计数据
export const useActivityStats = (options = {}) => {
  return useQuery(
    ['activities', 'stats'],
    () => USE_MOCK_DATA ? Promise.resolve(mockActivityStats) : getActivityStats(),
    {
      staleTime: 10 * 60 * 1000, // 10分钟
      ...options,
    }
  );
};

// 获取活动日历
export const useActivityCalendar = (year, month, options = {}) => {
  return useQuery(
    ['activities', 'calendar', year, month],
    () => USE_MOCK_DATA ? Promise.resolve(mockActivityCalendar) : getActivityCalendar(year, month),
    {
      staleTime: 60 * 60 * 1000, // 60分钟
      ...options,
    }
  );
};

// 创建新活动
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation(createEvent, {
    onSuccess: () => {
      // 活动创建成功后，重新获取活动列表
      queryClient.invalidateQueries(['activities', 'events']);
      queryClient.invalidateQueries(['activities', 'calendar']);
    },
  });
};

// 报名参加活动
export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();

  return useMutation(registerForEvent, {
    onSuccess: () => {
      // 报名成功后，重新获取活动列表和参与记录
      queryClient.invalidateQueries(['activities', 'events']);
      queryClient.invalidateQueries(['activities', 'participations', 'my']);
      queryClient.invalidateQueries(['activities', 'stats']);
    },
  });
};

// 生成兑换码
export const useGenerateRedemptionCode = () => {
  const queryClient = useQueryClient();

  return useMutation(generateRedemptionCode, {
    onSuccess: () => {
      // 兑换码生成成功后，重新获取兑换码列表
      queryClient.invalidateQueries(['activities', 'codes']);
    },
  });
};

// 更新兑换码状态
export const useUpdateRedemptionCode = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ codeId, codeData }) => updateRedemptionCode(codeId, codeData),
    {
      onSuccess: () => {
        // 兑换码更新成功后，重新获取兑换码列表
        queryClient.invalidateQueries(['activities', 'codes']);
      },
    }
  );
};

// 删除活动
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteEvent, {
    onSuccess: () => {
      // 活动删除成功后，重新获取活动列表和日历
      queryClient.invalidateQueries(['activities', 'events']);
      queryClient.invalidateQueries(['activities', 'calendar']);
    },
  });
};