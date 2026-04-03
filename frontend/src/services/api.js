import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    // FormData 必须由浏览器自动设置 multipart boundary；默认的 application/json 会导致上传失败
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;

    // 处理常见的HTTP错误
    if (response) {
      switch (response.status) {
        case 401: {
          // 登录/注册：由页面处理，勿清 token、勿跳转
          const reqUrl = error.config?.url || '';
          const isAuthEntry =
            reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register');
          // /auth/me：初始化或登录后校验失败时只清会话，勿整页跳转（否则无法区分「密码错」与「令牌未带到后端」）
          const isSessionProbe = reqUrl.includes('/auth/me');
          if (!isAuthEntry) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!isSessionProbe) {
              window.location.href = '/login';
            }
          }
          break;
        }
        case 403:
          // 禁止访问
          console.error('权限不足');
          break;
        case 404:
          // 资源不存在
          console.error('请求的资源不存在');
          break;
        case 500:
          // 服务器错误
          console.error('服务器内部错误');
          break;
        default:
          console.error(`请求错误: ${response.status}`);
      }
    } else {
      // 网络错误
      console.error('网络错误，请检查连接');
    }

    return Promise.reject(error);
  }
);

export default api;