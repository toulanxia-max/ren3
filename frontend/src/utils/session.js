/** 本地是否为可用的 JWT 形态（排除 localStorage 被写成字符串 "undefined" 等） */
export function storedSessionTokenOk() {
  const t = localStorage.getItem('token');
  if (!t || t === 'undefined' || t === 'null') return false;
  return t.split('.').length === 3;
}
