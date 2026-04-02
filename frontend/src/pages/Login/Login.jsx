import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { GiSpinningSword } from 'react-icons/gi';
import ClanLogo from '../../components/ClanLogo/ClanLogo';
import { motion } from 'framer-motion';

// 表单验证规则
const loginSchema = yup.object().shape({
  username: yup.string().required('请输入用户名'),
  password: yup.string().required('请输入密码'),
});

const registerSchema = yup.object().shape({
  game_id: yup.string().required('请输入游戏ID').min(3, '游戏ID至少3个字符').max(50, '游戏ID最多50个字符'),
  username: yup.string().required('请输入用户名').min(3, '用户名至少3个字符').max(50, '用户名最多50个字符'),
  password: yup.string().required('请输入密码').min(6, '密码至少6个字符'),
  confirmPassword: yup.string()
    .required('请确认密码')
    .oneOf([yup.ref('password'), null], '两次密码不一致'),
  display_name: yup.string().required('请输入显示名称').max(50, '显示名称最多50个字符'),
  email: yup.string().email('邮箱格式不正确').optional(),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 登录表单
  const { register: loginRegister, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  // 注册表单
  const { register: regRegister, handleSubmit: handleRegisterSubmit, formState: { errors: regErrors }, reset } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onLogin = async (data) => {
    setIsLoading(true);
    const result = await login(data.username, data.password);
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    }
  };

  const onRegister = async (data) => {
    setIsLoading(true);
    const { confirmPassword, ...registerData } = data;
    const result = await register(registerData);
    setIsLoading(false);

    if (result.success) {
      setIsLoginMode(true);
      reset();
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-paper">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* 登录卡片 */}
        <div className="paper-card animate-paper-fade">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <ClanLogo sizeClass="w-24 h-24" className="shadow-lg mx-auto" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-ink">紫川家族网站</h1>
            <p className="text-ninja-gray mt-2">忍3 · 家族成员登录</p>
          </div>

          {/* 模式切换 */}
          <div className="flex mb-6">
            <button
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-3 text-center font-serif font-bold transition-colors ${
                isLoginMode
                  ? 'border-b-2 border-accent-red text-accent-red'
                  : 'text-ninja-gray hover:text-ink'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-3 text-center font-serif font-bold transition-colors ${
                !isLoginMode
                  ? 'border-b-2 border-accent-red text-accent-red'
                  : 'text-ninja-gray hover:text-ink'
              }`}
            >
              注册
            </button>
          </div>

          {/* 登录表单 */}
          {isLoginMode ? (
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  用户名 / 游戏ID / 邮箱
                </label>
                <input
                  type="text"
                  {...loginRegister('username')}
                  className="brush-input"
                  placeholder="请输入用户名、游戏ID或邮箱"
                />
                {loginErrors.username && (
                  <p className="mt-1 text-sm text-accent-red">{loginErrors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  密码
                </label>
                <input
                  type="password"
                  {...loginRegister('password')}
                  className="brush-input"
                  placeholder="请输入密码"
                />
                {loginErrors.password && (
                  <p className="mt-1 text-sm text-accent-red">{loginErrors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="ink-button ink-button-primary w-full py-3 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <GiSpinningSword className="animate-spin mr-2" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => alert('请联系管理员重置密码')}
                  className="text-sm text-accent-blue hover:underline"
                >
                  忘记密码？
                </button>
              </div>
            </form>
          ) : (
            /* 注册表单 */
            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  游戏ID *
                </label>
                <input
                  type="text"
                  {...regRegister('game_id')}
                  className="brush-input"
                  placeholder="游戏内ID，用于身份验证"
                />
                {regErrors.game_id && (
                  <p className="mt-1 text-sm text-accent-red">{regErrors.game_id.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    用户名 *
                  </label>
                  <input
                    type="text"
                    {...regRegister('username')}
                    className="brush-input"
                    placeholder="登录用户名"
                  />
                  {regErrors.username && (
                    <p className="mt-1 text-sm text-accent-red">{regErrors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    显示名称 *
                  </label>
                  <input
                    type="text"
                    {...regRegister('display_name')}
                    className="brush-input"
                    placeholder="在网站显示的名称"
                  />
                  {regErrors.display_name && (
                    <p className="mt-1 text-sm text-accent-red">{regErrors.display_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  邮箱 (可选)
                </label>
                <input
                  type="email"
                  {...regRegister('email')}
                  className="brush-input"
                  placeholder="用于接收通知"
                />
                {regErrors.email && (
                  <p className="mt-1 text-sm text-accent-red">{regErrors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    密码 *
                  </label>
                  <input
                    type="password"
                    {...regRegister('password')}
                    className="brush-input"
                    placeholder="至少6个字符"
                  />
                  {regErrors.password && (
                    <p className="mt-1 text-sm text-accent-red">{regErrors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    确认密码 *
                  </label>
                  <input
                    type="password"
                    {...regRegister('confirmPassword')}
                    className="brush-input"
                    placeholder="再次输入密码"
                  />
                  {regErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-accent-red">{regErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="text-sm text-ninja-gray p-3 bg-paper-dark rounded-lg">
                <p className="font-bold mb-1">注册说明：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>请使用真实的游戏ID</li>
                  <li>注册后需要管理员审核</li>
                  <li>每个游戏ID只能注册一次</li>
                  <li>请妥善保管密码</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="ink-button ink-button-secondary w-full py-3"
              >
                {isLoading ? '注册中...' : '注册'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-sm text-accent-blue hover:underline"
                >
                  已有账号？立即登录
                </button>
              </div>
            </form>
          )}

          {/* 底部说明 */}
          <div className="mt-8 pt-6 border-t border-ink-light text-center text-sm text-ninja-gray">
            <p>本网站仅供《忍者必须死3》家族内部使用</p>
            <p className="mt-1">如有问题请联系家族管理员</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;