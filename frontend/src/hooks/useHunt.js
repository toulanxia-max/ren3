import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getHuntTasks,
  uploadHuntScreenshot,
  submitHuntRecord,
  getHuntHistory,
  getHuntStats,
  assignHuntTask,
  updateHuntTaskProgress,
  getBossDistribution,
  getHunterRankings,
  mockHuntTasks,
  mockHuntHistory,
  mockHuntStats,
  mockBossDistribution,
  mockHunterRankings
} from '../services/huntService';

// 是否使用模拟数据（当后端API未就绪时）
const USE_MOCK_DATA = true;

// 获取今日猎杀任务
export const useHuntTasks = (options = {}) => {
  return useQuery(
    ['hunts', 'tasks'],
    () => USE_MOCK_DATA ? Promise.resolve(mockHuntTasks) : getHuntTasks(),
    {
      staleTime: 2 * 60 * 1000, // 2分钟（猎杀任务更新频繁）
      cacheTime: 5 * 60 * 1000, // 5分钟
      ...options,
    }
  );
};

// 获取猎杀历史记录
export const useHuntHistory = (limit = 20, options = {}) => {
  return useQuery(
    ['hunts', 'history', limit],
    () => USE_MOCK_DATA ? Promise.resolve(mockHuntHistory) : getHuntHistory(limit),
    {
      staleTime: 5 * 60 * 1000, // 5分钟
      ...options,
    }
  );
};

// 获取猎杀统计数据
export const useHuntStats = (options = {}) => {
  return useQuery(
    ['hunts', 'stats'],
    () => USE_MOCK_DATA ? Promise.resolve(mockHuntStats) : getHuntStats(),
    {
      staleTime: 10 * 60 * 1000, // 10分钟
      ...options,
    }
  );
};

// 获取BOSS分布数据
export const useBossDistribution = (options = {}) => {
  return useQuery(
    ['hunts', 'distribution'],
    () => USE_MOCK_DATA ? Promise.resolve(mockBossDistribution) : getBossDistribution(),
    {
      staleTime: 30 * 60 * 1000, // 30分钟
      ...options,
    }
  );
};

// 获取猎手排行榜
export const useHunterRankings = (options = {}) => {
  return useQuery(
    ['hunts', 'rankings'],
    () => USE_MOCK_DATA ? Promise.resolve(mockHunterRankings) : getHunterRankings(),
    {
      staleTime: 30 * 60 * 1000, // 30分钟
      ...options,
    }
  );
};

// 上传猎杀截图
export const useUploadHuntScreenshot = () => {
  const queryClient = useQueryClient();

  return useMutation(uploadHuntScreenshot, {
    onSuccess: () => {
      // 截图上传成功后，重新获取任务列表
      queryClient.invalidateQueries(['hunts', 'tasks']);
    },
  });
};

// 提交猎杀记录
export const useSubmitHuntRecord = () => {
  const queryClient = useQueryClient();

  return useMutation(submitHuntRecord, {
    onSuccess: () => {
      // 猎杀记录提交成功后，重新获取历史记录和统计数据
      queryClient.invalidateQueries(['hunts', 'history']);
      queryClient.invalidateQueries(['hunts', 'stats']);
      queryClient.invalidateQueries(['hunts', 'distribution']);
      queryClient.invalidateQueries(['hunts', 'rankings']);
    },
  });
};

// 分配猎杀任务
export const useAssignHuntTask = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ taskId, assignee }) => assignHuntTask(taskId, assignee),
    {
      onSuccess: () => {
        // 任务分配成功后，重新获取任务列表
        queryClient.invalidateQueries(['hunts', 'tasks']);
      },
    }
  );
};

// 更新猎杀任务进度
export const useUpdateHuntTaskProgress = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ taskId, progress }) => updateHuntTaskProgress(taskId, progress),
    {
      onSuccess: () => {
        // 进度更新成功后，重新获取任务列表
        queryClient.invalidateQueries(['hunts', 'tasks']);
      },
    }
  );
};