import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getAbyssSchedule,
  getAbyssTeams,
  getAbyssRankings,
  requestAbyssLeave,
  getMyAbyssLeaves,
  getAbyssStats,
  submitAbyssDamage,
  updateAbyssTeam,
  updateAbyssSchedule,
  mockAbyssSchedule,
  mockAbyssTeams,
  mockAbyssRankings
} from '../services/abyssService';

// 是否使用模拟数据（当后端API未就绪时）
const USE_MOCK_DATA = true;

// 获取本周深渊排表
export const useAbyssSchedule = (week = null, options = {}) => {
  return useQuery(
    ['abyss', 'schedule', week],
    () => USE_MOCK_DATA ? Promise.resolve(mockAbyssSchedule) : getAbyssSchedule(week),
    {
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      ...options,
    }
  );
};

// 获取深渊队伍列表
export const useAbyssTeams = (options = {}) => {
  return useQuery(
    ['abyss', 'teams'],
    () => USE_MOCK_DATA ? Promise.resolve(mockAbyssTeams) : getAbyssTeams(),
    {
      staleTime: 10 * 60 * 1000, // 10分钟
      ...options,
    }
  );
};

// 获取深渊伤害排行榜
export const useAbyssRankings = (limit = 20, options = {}) => {
  return useQuery(
    ['abyss', 'rankings', limit],
    () => USE_MOCK_DATA ? Promise.resolve(mockAbyssRankings) : getAbyssRankings(limit),
    {
      staleTime: 5 * 60 * 1000, // 5分钟
      ...options,
    }
  );
};

// 获取我的请假记录
export const useMyAbyssLeaves = (options = {}) => {
  return useQuery(
    ['abyss', 'leaves', 'my'],
    () => USE_MOCK_DATA ? Promise.resolve([]) : getMyAbyssLeaves(),
    {
      staleTime: 5 * 60 * 1000, // 5分钟
      ...options,
    }
  );
};

// 获取深渊统计数据
export const useAbyssStats = (options = {}) => {
  return useQuery(
    ['abyss', 'stats'],
    () => USE_MOCK_DATA ? Promise.resolve({}) : getAbyssStats(),
    {
      staleTime: 10 * 60 * 1000, // 10分钟
      ...options,
    }
  );
};

// 申请请假
export const useRequestAbyssLeave = () => {
  const queryClient = useQueryClient();

  return useMutation(requestAbyssLeave, {
    onSuccess: () => {
      // 请假成功后，重新获取请假记录
      queryClient.invalidateQueries(['abyss', 'leaves', 'my']);
    },
  });
};

// 提交深渊伤害记录
export const useSubmitAbyssDamage = () => {
  const queryClient = useQueryClient();

  return useMutation(submitAbyssDamage, {
    onSuccess: () => {
      // 伤害记录提交成功后，重新获取排行榜和统计数据
      queryClient.invalidateQueries(['abyss', 'rankings']);
      queryClient.invalidateQueries(['abyss', 'stats']);
    },
  });
};

// 管理员：调整深渊队伍
export const useUpdateAbyssTeam = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ teamId, teamData }) => updateAbyssTeam(teamId, teamData),
    {
      onSuccess: () => {
        // 队伍调整成功后，重新获取队伍列表
        queryClient.invalidateQueries(['abyss', 'teams']);
      },
    }
  );
};

// 管理员：更新深渊排表
export const useUpdateAbyssSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation(updateAbyssSchedule, {
    onSuccess: () => {
      // 排表更新成功后，重新获取排表
      queryClient.invalidateQueries(['abyss', 'schedule']);
    },
  });
};