const CACHE_NAME = 'greenbean-coffee-v1';

// 앱의 핵심 에셋들
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.webmanifest',
  '/images/logo.svg',
  '/images/icons/icon-192x192.png',
  '/images/icons/apple-touch-icon.png'
];

// 설치 이벤트 - 캐시 준비
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(CORE_ASSETS);
      })
  );
});

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// 페치 이벤트 - 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에서 찾으면 캐시된 응답 반환
        if (response) {
          return response;
        }

        // 캐시에 없으면 네트워크로 요청
        return fetch(event.request)
          .then(networkResponse => {
            // 이미지나 폰트 등 중요 에셋은 캐시에 추가
            if (event.request.url.includes('/images/') ||
                event.request.url.includes('/fonts/')) {
              
              // 응답을 복제해서 캐시에 저장 (스트림은 한 번만 사용 가능)
              const responseToCache = networkResponse.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return networkResponse;
          })
          .catch(() => {
            // 오프라인이고 캐시도 없는 경우, 기본 오프라인 페이지 제공
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});