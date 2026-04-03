import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { buildAvatarSrc } from '../../utils/avatarUrl';
import { FiUser, FiSettings, FiKey, FiSave, FiTarget, FiPackage, FiUpload } from 'react-icons/fi';
import ClanLogo from '../../components/ClanLogo/ClanLogo';

const Profile = () => {
  const { user, logout, updateUser, refreshCurrentUser, api } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [form, setForm] = useState({
    display_name: '',
    email: '',
    signature: '',
    abyss_role_config: '',
    treasure_config: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      display_name: user.display_name || '',
      email: user.email || '',
      signature: user.signature || '',
      abyss_role_config: user.abyss_role_config || '',
      treasure_config: user.treasure_config || '',
    });
  }, [user]);

  const roleLabel = useMemo(() => {
    if (user?.role === 'admin') return '管理员';
    if (user?.role === 'captain') return '队长';
    return '成员';
  }, [user?.role]);

  const abyssRolePattern = /^(\d+[^/]+)(\/\d+[^/]+)*$/;
  const treasurePattern = /^\d+\+\d+$/;

  const abyssFormatValid = !form.abyss_role_config || abyssRolePattern.test(form.abyss_role_config.trim());
  const treasureFormatValid = !form.treasure_config || treasurePattern.test(form.treasure_config.trim());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** 与侧栏一致：只显示已保存到服务器的头像（不用本地选文件的 blob，避免「左边有图、侧栏没有」） */
  const savedAvatarSrc = useMemo(
    () => buildAvatarSrc(user?.avatar_url, user?.updated_at),
    [user?.avatar_url, user?.updated_at]
  );

  /** 设置页：仅用于「待上传」本地预览 */
  const [pendingAvatarBlobUrl, setPendingAvatarBlobUrl] = useState('');
  useEffect(() => {
    if (!avatarFile) {
      setPendingAvatarBlobUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(avatarFile);
    setPendingAvatarBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const handleSaveProfile = async () => {
    if (!form.display_name.trim()) {
      toast.error('显示名称不能为空');
      return;
    }
    if (!abyssFormatValid) {
      toast.error('深渊使用角色格式错误，应为 6水/6椒/6枭/6滴');
      return;
    }
    if (!treasureFormatValid) {
      toast.error('宝物情况格式错误，应为 3+3 或 0+0');
      return;
    }

    try {
      setSaving(true);
      const response = await api.put(`/users/${user.id}`, {
        display_name: form.display_name.trim(),
        email: form.email.trim(),
        signature: form.signature.trim(),
        abyss_role_config: form.abyss_role_config.trim(),
        treasure_config: form.treasure_config.trim(),
      });
      const updated = response?.data?.user || response?.user;
      if (updated) {
        updateUser(updated);
      } else {
        await refreshCurrentUser();
      }
      toast.success('个人中心已更新');
    } catch (error) {
      toast.error(error.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast.error('请先选择图片');
      return;
    }
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const response = await api.post('/users/avatar', formData);
      const updated = response?.data?.user || response?.user;
      if (updated) {
        updateUser(updated);
      }
      await refreshCurrentUser();
      setAvatarFile(null);
      toast.success('头像已更新');
    } catch (error) {
      toast.error(error.response?.data?.message || '头像上传失败');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="paper-card">
        <h1 className="text-3xl font-serif font-bold mb-2 flex items-center gap-3">
          <ClanLogo sizeClass="w-10 h-10" className="shadow" />
          个人中心
        </h1>
        <p className="text-ninja-gray">
          查看并维护个人资料与深渊配置
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 - 个人信息卡片 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 个人信息卡片 */}
          <div className="paper-card">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-accent-red to-accent-gold mx-auto mb-4 flex items-center justify-center overflow-hidden">
                {savedAvatarSrc ? (
                  <img src={savedAvatarSrc} alt="头像" className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="text-4xl text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold">{user?.display_name || '未知用户'}</h2>
              <p className="text-ninja-gray">@{user?.username || 'unknown'}</p>
              <div className="mt-2">
                <span className={`ink-badge ${
                  user?.role === 'admin' ? 'ink-badge-red' :
                  user?.role === 'captain' ? 'ink-badge-blue' :
                  'ink-badge'
                }`}>
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-ninja-gray">游戏ID</span>
                <span className="font-bold">{user?.game_id || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ninja-gray">加入家族</span>
                <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ninja-gray">深渊角色配置</span>
                <span className="font-bold text-accent-red">{user?.abyss_role_config || '未填写'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ninja-gray">宝物情况（忍术胧夜超）</span>
                <span className="font-bold text-accent-green">{user?.treasure_config || '未填写'}</span>
              </div>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="paper-card">
            <h3 className="font-bold mb-4 flex items-center">
              <FiSettings className="mr-2" />
              快捷操作
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('settings')}
                className="w-full text-left p-3 rounded-lg hover:bg-paper-dark transition-colors flex items-center"
              >
                <FiSettings className="mr-3 text-ninja-gray" />
                账户设置
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="w-full text-left p-3 rounded-lg hover:bg-paper-dark transition-colors flex items-center"
              >
                <FiSettings className="mr-3 text-ninja-gray" />
                编辑资料与深渊配置
              </button>
              <button
                onClick={() => {
                  if (window.confirm('确定要退出登录吗？')) {
                    logout();
                  }
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-accent-red transition-colors flex items-center"
              >
                <FiKey className="mr-3" />
                退出登录
              </button>
            </div>
          </div>
        </div>

        {/* 右侧 - 标签页内容 */}
        <div className="lg:col-span-2">
          <div className="paper-card">
            <div className="flex flex-wrap border-b border-ink-light mb-6">
              {[
                { id: 'overview', label: '概览', icon: <FiUser /> },
                { id: 'settings', label: '设置', icon: <FiSettings /> },
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

            {/* 概览 */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">我的深渊配置</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-ninja-gray mb-2 flex items-center">
                        <FiTarget className="mr-2" />
                        深渊使用角色
                      </div>
                      <div className="text-lg font-bold">
                        {form.abyss_role_config || '未填写'}
                      </div>
                      <div className="text-xs text-ninja-gray mt-1">
                        示例：6水/6椒/6枭/6滴
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-ninja-gray mb-2 flex items-center">
                        <FiPackage className="mr-2" />
                        宝物情况（忍术胧夜超）
                      </div>
                      <div className="text-lg font-bold">
                        {form.treasure_config || '未填写'}
                      </div>
                      <div className="text-xs text-ninja-gray mt-1">
                        示例：3+3 / 0+0
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-4">账号信息</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-paper-dark flex items-center justify-between">
                      <span className="text-ninja-gray">显示名称</span>
                      <span className="font-bold">{form.display_name || '-'}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-paper-dark flex items-center justify-between">
                      <span className="text-ninja-gray">邮箱</span>
                      <span className="font-bold">{form.email || '未填写'}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-paper-dark">
                      <div className="text-ninja-gray mb-1">个人签名</div>
                      <div className="font-bold break-all">{form.signature || '未填写'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 设置 */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">个人资料设置</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">头像上传（支持图片，2MB内）</label>
                      <div className="mb-3 p-3 rounded-lg border border-amber-300 bg-amber-50 text-sm text-amber-950">
                        <strong>重要：</strong>选好图片后必须再点右侧的<strong>「上传头像」</strong>，头像才会保存到服务器；只点页面底部的<strong>「保存更改」</strong>只会保存文字资料，<strong>不会上传图片</strong>。
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                          className="brush-input w-full"
                        />
                        <button
                          type="button"
                          onClick={handleAvatarUpload}
                          disabled={uploadingAvatar || !avatarFile}
                          className="ink-button flex items-center justify-center whitespace-nowrap"
                        >
                          <FiUpload className="mr-2" />
                          {uploadingAvatar ? '上传中...' : '上传头像'}
                        </button>
                      </div>
                      {pendingAvatarBlobUrl && (
                        <div className="flex items-center gap-3 mt-3 p-3 rounded-lg border-2 border-accent-red/40 bg-red-50">
                          <img
                            src={pendingAvatarBlobUrl}
                            alt=""
                            className="w-14 h-14 rounded-full object-cover border border-ink-light shrink-0"
                          />
                          <p className="text-sm text-ink leading-relaxed">
                            <strong className="text-accent-red">还没完成：</strong>请马上点上面的<strong>「上传头像」</strong>按钮；上传成功前，侧栏和资料卡只会显示旧头像或默认头像。
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">显示名称</label>
                      <input
                        type="text"
                        name="display_name"
                        className="brush-input w-full"
                        value={form.display_name}
                        onChange={handleChange}
                        placeholder="在网站显示的名称"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">邮箱地址</label>
                      <input
                        type="email"
                        name="email"
                        className="brush-input w-full"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="用于接收通知"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">个人签名</label>
                      <textarea
                        name="signature"
                        className="brush-input w-full h-24"
                        placeholder="介绍一下自己..."
                        value={form.signature}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-ink-light">
                  <h3 className="font-bold mb-4">深渊配置</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        深渊使用角色（格式：6水/6椒/6枭/6滴）
                      </label>
                      <input
                        type="text"
                        name="abyss_role_config"
                        className={`brush-input w-full ${!abyssFormatValid ? 'border-red-500' : ''}`}
                        value={form.abyss_role_config}
                        onChange={handleChange}
                        placeholder="6水/6椒/6枭/6滴"
                      />
                      {!abyssFormatValid && (
                        <p className="text-sm text-red-600 mt-1">格式错误，请按 6水/6椒/6枭/6滴 填写</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        宝物情况（忍术胧夜超，格式：3+3 或 0+0）
                      </label>
                      <input
                        type="text"
                        name="treasure_config"
                        className={`brush-input w-full ${!treasureFormatValid ? 'border-red-500' : ''}`}
                        value={form.treasure_config}
                        onChange={handleChange}
                        placeholder="3+3"
                      />
                      {!treasureFormatValid && (
                        <p className="text-sm text-red-600 mt-1">格式错误，请按 3+3 或 0+0 填写</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !abyssFormatValid || !treasureFormatValid}
                  className="ink-button ink-button-primary flex items-center"
                >
                  <FiSave className="mr-2" />
                  {saving ? '保存中...' : '保存更改'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="paper-card bg-gradient-to-r from-blue-50 to-green-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold mb-1">资料同步提醒</h3>
            <p className="text-sm text-ninja-gray">
              修改并保存后，成员配置将立即用于页面展示与管理。
            </p>
          </div>
          <button onClick={handleSaveProfile} className="ink-button" disabled={saving}>
            {saving ? '同步中...' : '立即保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;