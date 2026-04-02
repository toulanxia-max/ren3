import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getRecentBattles,
  getBattleStats,
  getContributorRankings,
  getBattleSchedule,
  addBattleRecord,
  scheduleBattle,
  getMyBattleStats,
  getWinRateTrend,
  getBattleTypeDistribution,
  updateLineup,
  mockRecentBattles,
  mockBattleStats,
  mockContributorRankings,
  mockBattleSchedule,
  mockMyBattleStats,
  mockWinRateTrend,
  mockBattleTypeDistribution
} from '../services/battleService';

// 是否使用模拟数据（当后端API未就绪时）
const USE_MOCK_DATA = true;

// 获取近期家族战记录
export const useRecentBattles = (limit = 10, options = {}) => {
  return useQuery(
    ['battles', 'recent', limit],
    () => USE_MOCK_DATA ? Promise.resolve(mockRecentBattles) : getRecentBattles(limit),
    {
      staleTime: 10 * 60 * 1000, // 10分钟
      cacheTime: 30 * 60 * 1000, // 30分钟
      ...options,
    }
  );
};

// 获取家族战统计数据
export const useBattleStats = (options = {}) => {
  return useQuery(
    ['battles', 'stats'],
    () => USE_MOCK_DATA ? Promise.resolve(mockBattleStats) : getBattleStats(),
    {
      staleTime: 30 * 60 * 1000, // 30分钟
      ...options,
    }
  );
};

// 获取成员贡献排行榜
export const useContributorRankings = (options = {}) => {
  return useQuery(
    ['battles', 'contributors'],
    () => USE_MOCK_DATA ? Promise.resolve(mockContributorRankings) : getContributorRankings(),
    {
      staleTime: 30 * 60 * 1000, // 30分钟
      ...options,
    }
  );
};

// 获取对战安排
export const useBattleSchedule = (options = {}) => {
  return useQuery(
    ['battles', 'schedule'],
    () => USE_MOCK_DATA ? Promise.resolve(mockBattleSchedule) : getBattleSchedule(),
    {
      staleTime: 5 * 60 * 1000, // 5分钟
      ...options,
    }
  );
};

// 获取我的家族战数据
export const useMyBattleStats = (options = {}) => {
  return useQuery(
    ['battles', 'my-stats'],
    () => USE_MOCK_DATA ? Promise.resolve(mockMyBattleStats) : getMyBattleStats(),
    {
      staleTime: 10 * 60 * 1000, // 10分钟
      ...options,
    }
  );
};

// 获取胜率趋势数据
export const useWinRateTrend = (options = {}) => {
  return useQuery(
    ['battles', 'win-rate-trend'],
    () => USE_MOCK_DATA ? Promise.resolve(mockWinRateTrend) : getWinRateTrend(),
    {
      staleTime: 60 * 60 * 1000, // 60分钟
      ...options,
    }
  );
};

// 获取对战类型分布
export const useBattleTypeDistribution = (options = {}) => {
  return useQuery(
    ['battles', 'type-distribution'],
    () => USE_MOCK_DATA ? Promise.resolve(mockBattleTypeDistribution) : getBattleTypeDistribution(),
    {
      staleTime: 60 * 60 * 1000, // 60分钟
      ...options,
    }
  );
};

// 添加家族战记录
export const useAddBattleRecord = () => {
  const queryClient = useQueryClient();

  return useMutation(addBattleRecord, {
    onSuccess: () => {
      // 记录添加成功后，重新获取相关数据
      queryClient.invalidateQueries(['battles', 'recent']);
      queryClient.invalidateQueries(['battles', 'stats']);
      queryClient.invalidateQueries(['battles', 'contributors']);
      queryClient.invalidateQueries(['battles', 'win-rate-trend']);
      queryClient.invalidateQueries(['battles', 'type-distribution']);
    },
  });
};

// 安排新的对战
export const useScheduleBattle = () => {
  const queryClient = useQueryClient();

  return useMutation(scheduleBattle, {
    onSuccess: () => {
      // 对战安排成功后，重新获取对战安排
      queryClient.invalidateQueries(['battles', 'schedule']);
    },
  });
};

// 更新出战名单
export const useUpdateLineup = () => {
  const queryClient = useQueryClient();

  return useMutation(updateLineup, {
    onSuccess: () => {
      // 出战名单更新成功后，重新获取对战安排
      queryClient.invalidateQueries(['battles', 'schedule']);
    },
  });
};