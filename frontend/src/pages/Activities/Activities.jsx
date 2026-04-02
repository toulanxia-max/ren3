import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiCalendar, FiPlus, FiGift, FiUsers, FiCheckCircle, FiClock, FiStar } from 'react-icons/fi';
import { GiScrollUnfurled, GiPresent } from 'react-icons/gi';

const Activities = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');

  // 活动数据（已清空）
  const upcomingEvents = [];

  // 兑换码数据（已清空）
  const redemptionCodes = [];

  // 参与记录（已清空）
  const myParticipations = [];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="paper-card">
        <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
          <GiScrollUnfurled className="mr-3 text-accent-red" />
          活动管理系统
        </h1>
        <p className="text-ninja-gray">
          家族活动安排、兑换码管理、参与记录和日历视图
        </p>
      </div>

      {/* 标签页 */}
      <div className="paper-card">
        <div className="flex flex-wrap border-b border-ink-light mb-6">
          {[
            { id: 'calendar', label: '活动日历', icon: <FiCalendar /> },
            { id: 'create', label: '创建活动', icon: <FiPlus /> },
            { id: 'codes', label: '兑换码管理', icon: <FiGift /> },
            { id: 'participation', label: '参与记录', icon: <FiUsers /> },
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

        {/* 活动日历 */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">近期活动</h2>
              <div className="text-sm text-ninja-gray">
                2023年5月
              </div>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {upcomingEvents.map((event) => (
                <div key={event.id} className="paper-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-lg">{event.title}</div>
                    <div className={`ink-badge ${
                      event.status === 'open' ? 'ink-badge-green' :
                      event.status === 'full' ? 'ink-badge-red' :
                      'ink-badge-gold'
                    }`}>
                      {event.status === 'open' ? '可报名' : '已满员'}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <FiCalendar className="mr-2 text-ninja-gray" />
                      {event.date} {event.time}
                    </div>
                    <div className="flex items-center text-sm">
                      <FiUsers className="mr-2 text-ninja-gray" />
                      参与: {event.participants}/{event.maxParticipants}人
                    </div>
                    <div className="flex items-center text-sm">
                      <FiClock className="mr-2 text-ninja-gray" />
                      地点: {event.location}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {event.status === 'open' && (
                      <button className="ink-button ink-button-primary flex-1">
                        立即报名
                      </button>
                    )}
                    <button className="ink-button flex-1">
                      查看详情
                    </button>
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-ninja-gray">暂无活动数据</div>
            )}

            {/* 日历视图 */}
            <div className="paper-card">
              <h3 className="font-bold mb-4">本月活动日历</h3>
              <div className="grid grid-cols-7 gap-2">
                {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
                  <div key={day} className="text-center py-2 text-sm font-bold text-ninja-gray">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <div
                    key={day}
                    className="min-h-20 p-2 border border-ink-light rounded"
                  >
                    <div className="text-sm font-bold">{day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 创建活动 */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">创建新活动</h2>
              <p className="text-ninja-gray mb-6">
                {(user?.role === 'admin' || user?.role === 'captain')
                  ? '作为管理员，您可以创建新的家族活动'
                  : '您没有创建活动的权限，请联系管理员'}
              </p>
            </div>

            {(user?.role === 'admin' || user?.role === 'captain') ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">活动标题</label>
                  <input type="text" className="brush-input w-full" placeholder="例如：家族聚餐、战术讨论等" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">活动日期</label>
                    <input type="date" className="brush-input w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">活动时间</label>
                    <input type="time" className="brush-input w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">活动地点</label>
                  <input type="text" className="brush-input w-full" placeholder="例如：家族YY频道、游戏内、家族群等" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">最大参与人数</label>
                    <input type="number" className="brush-input w-full" placeholder="0表示不限人数" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">活动类型</label>
                    <select className="brush-input w-full">
                      <option value="">选择类型</option>
                      <option value="meeting">会议/讨论</option>
                      <option value="training">培训/指导</option>
                      <option value="competition">比赛/竞速</option>
                      <option value="social">社交活动</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">活动描述</label>
                  <textarea className="brush-input w-full h-32" placeholder="详细描述活动内容、要求等..." />
                </div>

                <button className="ink-button ink-button-primary w-full">
                  创建活动
                </button>
              </div>
            ) : (
              <div className="text-center p-8 bg-paper-dark rounded-lg">
                <FiStar className="text-4xl text-ninja-gray mx-auto mb-4" />
                <p className="text-ninja-gray">您需要管理员或队长权限才能创建活动</p>
              </div>
            )}
          </div>
        )}

        {/* 兑换码管理 */}
        {activeTab === 'codes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">兑换码管理</h2>
              {(user?.role === 'admin' || user?.role === 'captain') && (
                <button className="ink-button ink-button-primary">
                  生成兑换码
                </button>
              )}
            </div>

            {redemptionCodes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-light">
                    <th className="text-left py-3">兑换码</th>
                    <th className="text-left py-3">描述</th>
                    <th className="text-left py-3">使用情况</th>
                    <th className="text-left py-3">有效期</th>
                    <th className="text-left py-3">状态</th>
                    <th className="text-left py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptionCodes.map((code, idx) => (
                    <tr key={idx} className="border-b border-ink-light hover:bg-paper-dark">
                      <td className="py-3 font-mono font-bold">{code.code}</td>
                      <td className="py-3">{code.description}</td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <div className="w-full bg-paper-dark rounded-full h-2 mr-2">
                            <div
                              className="bg-accent-blue h-full rounded-full"
                              style={{ width: `${(code.uses / code.maxUses) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{code.uses}/{code.maxUses}</span>
                        </div>
                      </td>
                      <td className="py-3">{code.expiry}</td>
                      <td className="py-3">
                        <span className={`ink-badge ${
                          code.status === 'active' ? 'ink-badge-green' :
                          code.status === 'used' ? 'ink-badge-red' :
                          'ink-badge-gold'
                        }`}>
                          {code.status === 'active' ? '可用' : '已用完'}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(code.code);
                            alert(`兑换码 ${code.code} 已复制到剪贴板！`);
                          }}
                          className="text-accent-blue hover:underline text-sm"
                          disabled={code.status !== 'active'}
                        >
                          复制
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-ninja-gray">暂无兑换码数据</div>
            )}

            {/* 兑换码使用说明 */}
            <div className="paper-card bg-gradient-to-r from-blue-50 to-green-50">
              <h3 className="font-bold mb-2">兑换码使用说明</h3>
              <ul className="list-disc list-inside space-y-1 text-ninja-gray">
                <li>兑换码在游戏内"设置-兑换码"处使用</li>
                <li>每个兑换码每人只能使用一次</li>
                <li>兑换码有使用次数限制，先到先得</li>
                <li>请勿在公开场合分享兑换码</li>
                <li>过期兑换码将自动失效</li>
              </ul>
            </div>
          </div>
        )}

        {/* 参与记录 */}
        {activeTab === 'participation' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">我的活动参与记录</h2>
              <div className="text-sm text-ninja-gray">
                共参与 <span className="font-bold">{myParticipations.length}</span> 次活动
              </div>
            </div>

            {myParticipations.length > 0 ? (
              <div className="space-y-4">
                {myParticipations.map((participation, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-ink-light hover:border-accent-red transition-colors">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      participation.status === 'completed' ? 'bg-green-100 text-green-800' :
                      participation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {participation.status === 'completed' ? <FiCheckCircle /> : <FiClock />}
                    </div>
                    <div>
                      <div className="font-bold">{participation.event}</div>
                      <div className="text-sm text-ninja-gray">
                        {participation.date} • {participation.role}
                      </div>
                    </div>
                  </div>
                  <div className={`ink-badge ${
                    participation.status === 'completed' ? 'ink-badge-green' :
                    participation.status === 'pending' ? 'ink-badge-gold' :
                    'ink-badge'
                  }`}>
                    {participation.status === 'completed' ? '已参与' : '待参与'}
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-ninja-gray">暂无参与记录</div>
            )}

            {/* 参与统计 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="paper-card text-center">
                <div className="text-2xl font-bold text-accent-red">0</div>
                <div className="text-sm text-ninja-gray">本月参与次数</div>
              </div>
              <div className="paper-card text-center">
                <div className="text-2xl font-bold text-accent-blue">0%</div>
                <div className="text-sm text-ninja-gray">活动参与率</div>
              </div>
              <div className="paper-card text-center">
                <div className="text-2xl font-bold text-accent-green">0</div>
                <div className="text-sm text-ninja-gray">协助组织次数</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 活动提示 */}
      <div className="paper-card">
        <h3 className="font-bold mb-3 flex items-center">
          <GiPresent className="mr-2 text-accent-red" />
          活动参与小贴士
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold mb-2 text-accent-red">报名提醒</h4>
            <ul className="list-disc list-inside space-y-1 text-ninja-gray">
              <li>活动开始前30分钟停止报名</li>
              <li>如需取消报名请提前联系队长</li>
              <li>多次无故缺席将影响后续报名</li>
              <li>重要活动请提前10分钟到场</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-accent-blue">奖励机制</h4>
            <ul className="list-disc list-inside space-y-1 text-ninja-gray">
              <li>参与活动可获得家族贡献度</li>
              <li>协助组织活动有额外奖励</li>
              <li>连续参与活动有累积奖励</li>
              <li>特殊活动有专属兑换码奖励</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activities;