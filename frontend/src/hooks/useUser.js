import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getUserProfile,
  updateUserProfile,
  getUserGameStats,
  getUserAchievements,
  getUserActivity,
  getClanContributionRankings,
  updateUserPreferences,
  getUserNotifications,
  updateUserNotifications,
  syncGameData,
  getUsers,
  updateUserRole,
  mockUserGameStats,
  mockUserAchievements,
  mockUserActivity,
  mockClanContributionRankings
} from '../services/userService';

// 是否使用模拟数据（当后端API未就绪时）
const USE_MOCK_DATA = true;

// 获取用户信息
export const useUserProfile = (userId = null, options = {}) => {
  return useQuery(
    ['users', 'profile', userId],
    () => USE_MOCK_DATA ? Promise.resolve({}) : getUserProfile(userId),
    {
      staleTime: 10 * 60 * 1000, // 10分钟
      ...options,
    }
  );
};

// 获取用户游戏数据
export const useUserGameStats = (userId = null, options = {}) => {
  return useQuery(
    ['users', 'game-stats', userId],
    () => USE_MOCK_DATA ? Promise.resolve(mockUserGameStats) : getUserGameStats(userId),
    {
      staleTime: 30 * 60 * 1000, // 30分钟
      ...options,
    }
  );
};

// 获取用户成就
export const useUserAchievements = (userId = null, options = {}) => {
  return useQuery(
    ['users', 'achievements', userId],
    () => USE_MOCK_DATA ? Promise.resolve(mockUserAchievements) : getUserAchievements(userId),
    {
      staleTime: 60 * 60 * 1000, // 60分钟
      ...options,
    }
  );
};

// 获取用户活跃度数据
export const useUserActivity = (period = 'weekly', options = {}) => {
  return useQuery(
    ['users', 'activity', period],
    () => USE_MOCK_DATA ? Promise.resolve(mockUserActivity) : getUserActivity(period),
    {
      staleTime: 5 * 60 * 1000, // 5分钟
      ...options,
    }
  );
};

// 获取家族贡献排行榜
export const useClanContributionRankings = (limit = 20, options = {}) => {
  return useQuery(
    ['users', 'contributions', limit],
    () => USE_MOCK_DATA ? Promise.resolve(mockClanContributionRankings) : getClanContributionRankings(limit),
    {
      staleTime: 30 * 60 * 1000, // 30分钟
      ...options,
    }
  );
};

// 获取用户通知设置
export const useUserNotifications = (options = {}) => {
  return useQuery(
    ['users', 'notifications'],
    () => USE_MOCK_DATA ? Promise.resolve({}) : getUserNotifications(),
    {
      staleTime: 60 * 60 * 1000, // 60分钟
      ...options,
    }
  );
};

// 管理员：获取用户列表
export const useUsers = (params = {}, options = {}) => {
  return useQuery(
    ['users', 'list', params],
    () => USE_MOCK_DATA ? Promise.resolve([]) : getUsers(params),
    {
      staleTime: 5 * 60 * 1000, // 5分钟
      ...options,
    }
  );
};

// 更新用户信息
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation(updateUserProfile, {
    onSuccess: (data) => {
      // 用户信息更新成功后，重新获取用户信息
      queryClient.invalidateQueries(['users', 'profile']);
      // 如果更新了当前用户，也更新localStorage中的用户数据
      if (data?.user) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const currentUser = JSON.parse(storedUser);
          const updatedUser = { ...currentUser, ...data.user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    },
  });
};

// 更新用户偏好设置
export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation(updateUserPreferences, {
    onSuccess: () => {
      // 偏好设置更新成功后，重新获取用户信息
      queryClient.invalidateQueries(['users', 'profile']);
    },
  });
};

// 更新用户通知设置
export const useUpdateUserNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation(updateUserNotifications, {
    onSuccess: () => {
      // 通知设置更新成功后，重新获取通知设置
      queryClient.invalidateQueries(['users', 'notifications']);
    },
  });
};

// 同步游戏数据
export const useSyncGameData = () => {
  const queryClient = useQueryClient();

  return useMutation(syncGameData, {
    onSuccess: () => {
      // 游戏数据同步成功后，重新获取游戏数据和排行榜
      queryClient.invalidateQueries(['users', 'game-stats']);
      queryClient.invalidateQueries(['users', 'achievements']);
      queryClient.invalidateQueries(['users', 'contributions']);
    },
  });
};

// 管理员：更新用户角色
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ userId, role }) => updateUserRole(userId, role),
    {
      onSuccess: () => {
        // 用户角色更新成功后，重新获取用户列表
        queryClient.invalidateQueries(['users', 'list']);
      },
    }
  );
};