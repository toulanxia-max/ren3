/* 占位：避免开发时请求 /service-worker.js 被 proxy 到后端返回 JSON 404 */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
