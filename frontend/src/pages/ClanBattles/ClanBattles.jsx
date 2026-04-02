import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiTarget, FiAward, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { GiTrophy, GiBattleGear } from 'react-icons/gi';

const ClanBattles = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('recent');

  // 家族战记录（已清空）
  const recentBattles = [];

  // 战绩统计（已清空）
  const battleStats = {
    total: 0,
    wins: 0,
    losses: 0,
    winRate: '0%',
    streak: 0,
    bestStreak: 0
  };

  // 成员贡献（已清空）
  const topContributors = [];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="paper-card">
        <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
          <GiBattleGear className="mr-3 text-accent-red" />
          家族战系统
        </h1>
        <p className="text-ninja-gray">
          家族对战记录、战绩统计、成员贡献分析和战术讨论
        </p>
      </div>

      {/* 总体统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="paper-card text-center">
          <div className="text-2xl font-bold text-accent-red">{battleStats.total}</div>
          <div className="text-sm text-ninja-gray">总对战次数</div>
        </div>
        <div className="paper-card text-center">
          <div className="text-2xl font-bold text-accent-green">{battleStats.wins}</div>
          <div className="text-sm text-ninja-gray">胜利次数</div>
        </div>
        <div className="paper-card text-center">
          <div className="text-2xl font-bold text-accent-blue">{battleStats.winRate}</div>
          <div className="text-sm text-ninja-gray">胜率</div>
        </div>
        <div className="paper-card text-center">
          <div className="text-2xl font-bold text-accent-gold">{battleStats.streak}</div>
          <div className="text-sm text-ninja-gray">当前连胜</div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="paper-card">
        <div className="flex flex-wrap border-b border-ink-light mb-6">
          {[
            { id: 'recent', label: '近期对战', icon: <FiCalendar /> },
            { id: 'stats', label: '数据统计', icon: <FiBarChart2 /> },
            { id: 'ranking', label: '贡献排行', icon: <FiAward /> },
            { id: 'schedule', label: '对战安排', icon: <FiCalendar /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-accent-red text-accent-red'
                  : 'border-transparent text-ninja-gray hover:text-ink'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 近期对战 */}
        {activeTab === 'recent' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">近期对战记录</h2>
              {(user?.role === 'admin' || user?.role === 'captain') && (
                <button className="ink-button ink-button-primary">
                  添加对战记录
                </button>
              )}
            </div>

            {recentBattles.length > 0 ? (
              <div className="space-y-4">
                {recentBattles.map((battle, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-ink-light hover:border-accent-red transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold">{battle.date}</div>
                    <div className={`flex items-center ${
                      battle.result === 'win' ? 'text-green-600' :
                      battle.result === 'lose' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      <FiTarget className="mr-2" />
                      <span className="font-bold">{battle.result === 'win' ? '胜利' : '失败'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="text-center flex-1">
                      <div className="text-xl font-bold">我方</div>
                      <div className="text-2xl font-bold text-accent-blue mt-1">忍3家族</div>
                    </div>
                    <div className="text-center mx-4">
                      <div className="text-3xl font-bold">{battle.score}</div>
                      <div className="text-sm text-ninja-gray">比分</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-xl font-bold">对手</div>
                      <div className="text-2xl font-bold text-accent-red mt-1">{battle.opponent}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-ninja-gray">
                    <span>时长: {battle.duration}</span>
                    <button className="text-accent-blue hover:underline">
                      查看对战详情 →
                    </button>
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-ninja-gray">暂无家族战记录</div>
            )}
          </div>
        )}

        {/* 数据统计 */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">家族战数据统计</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 胜率趋势 */}
              <div className="paper-card">
                <h3 className="font-bold mb-4">月度胜率趋势</h3>
                <div className="h-48 flex items-end space-x-2">
                  {[0, 0, 0, 0, 0, 0, 0].map((rate, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-accent-blue rounded-t-lg transition-all hover:bg-accent-red"
                        style={{ height: `${rate}%` }}
                      />
                      <div className="text-xs text-ninja-gray mt-2">
                        第{idx + 1}周
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 对战类型分布 */}
              <div className="paper-card">
                <h3 className="font-bold mb-4">对战类型分布</h3>
                <div className="space-y-3">
                  {[
                    { type: '常规战', count: 0, percent: 0 },
                    { type: '友谊赛', count: 0, percent: 0 },
                    { type: '锦标赛', count: 0, percent: 0 },
                  ].map((item) => (
                    <div key={item.type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.type}</span>
                        <span>{item.count}场 ({item.percent}%)</span>
                      </div>
                      <div className="h-2 bg-paper-dark rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-red rounded-full"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 详细统计 */}
            <div className="paper-card">
              <h3 className="font-bold mb-4">详细统计</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">0</div>
                  <div className="text-sm text-ninja-gray">场均伤害</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">0</div>
                  <div className="text-sm text-ninja-gray">场均击杀</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">0</div>
                  <div className="text-sm text-ninja-gray">场均死亡</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">0</div>
                  <div className="text-sm text-ninja-gray">场均助攻</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 贡献排行 */}
        {activeTab === 'ranking' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">成员贡献排行榜</h2>
              <div className="text-sm text-ninja-gray">
                更新: 今天 06:00
              </div>
            </div>

            {topContributors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-light">
                    <th className="text-left py-3">排名</th>
                    <th className="text-left py-3">成员</th>
                    <th className="text-left py-3">胜场</th>
                    <th className="text-left py-3">总伤害</th>
                    <th className="text-left py-3">MVP次数</th>
                  </tr>
                </thead>
                <tbody>
                  {topContributors.map((contributor, idx) => (
                    <tr key={idx} className="border-b border-ink-light hover:bg-paper-dark">
                      <td className="py-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          idx === 0 ? 'bg-yellow-100 text-yellow-800 font-bold' :
                          idx === 1 ? 'bg-gray-100 text-gray-800' :
                          idx === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-paper-dark'
                        }`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="py-3 font-medium">{contributor.name}</td>
                      <td className="py-3">
                        <span className="font-bold text-accent-green">{contributor.wins}</span>
                      </td>
                      <td className="py-3">{contributor.damage}</td>
                      <td className="py-3">
                        <span className="ink-badge ink-badge-gold">{contributor.mvp}次</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-ninja-gray">暂无贡献排行数据</div>
            )}

            {/* 个人战绩 */}
            <div className="paper-card">
              <h3 className="font-bold mb-4">我的家族战数据</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3">
                  <div className="text-xl font-bold text-accent-blue">0</div>
                  <div className="text-sm text-ninja-gray">参与次数</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-xl font-bold text-accent-green">0</div>
                  <div className="text-sm text-ninja-gray">胜利次数</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-xl font-bold text-accent-red">0</div>
                  <div className="text-sm text-ninja-gray">总伤害</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-xl font-bold text-accent-gold">0</div>
                  <div className="text-sm text-ninja-gray">MVP次数</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 对战安排 */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">对战安排</h2>
              {(user?.role === 'admin' || user?.role === 'captain') && (
                <button className="ink-button ink-button-primary">
                  安排对战
                </button>
              )}
            </div>

            <div className="text-center py-8 text-ninja-gray">暂无对战安排数据</div>

            {/* 出战名单 */}
            <div className="paper-card">
              <h3 className="font-bold mb-4">下周出战名单</h3>
              <div className="text-sm text-ninja-gray">暂无出战名单</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClanBattles;