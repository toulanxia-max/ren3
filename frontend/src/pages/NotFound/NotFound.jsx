import React from 'react';
import { Link } from 'react-router-dom';
import { GiSpinningSword } from 'react-icons/gi';
import { FiHome } from 'react-icons/fi';
import ClanLogo from '../../components/ClanLogo/ClanLogo';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-paper">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* 水墨风格404 */}
        <div className="relative mb-8">
          <div className="text-9xl font-serif font-bold text-ink opacity-10">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <GiSpinningSword className="text-6xl text-accent-red animate-spin" />
          </div>
        </div>

        <div className="paper-card max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <ClanLogo sizeClass="w-20 h-20" className="shadow-md mx-auto" />
          </div>

          <h1 className="text-3xl font-serif font-bold mb-4">页面未找到</h1>
          <p className="text-ninja-gray mb-6">
            您访问的页面不存在或链接已失效。
          </p>

          <div className="space-y-4">
            <Link
              to="/"
              className="ink-button ink-button-primary w-full flex items-center justify-center"
            >
              <FiHome className="mr-2" />
              返回首页
            </Link>

            <div className="text-sm text-ninja-gray">
              <p className="mb-2">或者尝试以下页面：</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/abyss" className="ink-badge hover:bg-accent-red hover:text-white transition-colors">
                  深渊系统
                </Link>
                <Link to="/hunts" className="ink-badge hover:bg-accent-blue hover:text-white transition-colors">
                  SS+猎杀
                </Link>
                <Link to="/battles" className="ink-badge hover:bg-accent-green hover:text-white transition-colors">
                  家族战
                </Link>
                <Link to="/activities" className="ink-badge hover:bg-accent-gold hover:text-white transition-colors">
                  活动管理
                </Link>
              </div>
            </div>
          </div>

          {/* 水墨风格装饰 */}
          <div className="mt-8 pt-6 border-t border-ink-light">
            <p className="text-sm text-ninja-gray">
              「忍者之道，在于随机应变」
            </p>
            <p className="text-xs text-ninja-light-gray mt-1">
              紫川家族网站 • 错误代码: 404
            </p>
          </div>
        </div>

        <motion.div
          animate={{ x: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-8 flex justify-center opacity-60"
        >
          <ClanLogo sizeClass="w-14 h-14" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;