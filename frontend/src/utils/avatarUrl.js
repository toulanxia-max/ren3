/**
 * 将用户 avatar_url（相对路径或绝对 URL）转为可在 <img> 中使用的地址。
 * cacheBust 用于更换头像后绕过浏览器缓存（通常传后端返回的 updated_at）。
 */
export function getApiOrigin() {
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
  return apiBase.replace(/\/api\/v1\/?$/, '');
}

export function buildAvatarSrc(avatarUrl, cacheBust) {
  if (!avatarUrl) return '';
  let url;
  if (/^https?:\/\//i.test(avatarUrl)) {
    url = avatarUrl;
  } else {
    const origin = getApiOrigin();
    const path = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
    url = `${origin}${path}`;
  }
  if (cacheBust == null || cacheBust === '') return url;
  const v = typeof cacheBust === 'number' ? cacheBust : String(cacheBust);
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(v)}`;
}
