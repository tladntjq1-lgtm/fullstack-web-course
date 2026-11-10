// 환경별로 달라지는 "공개 가능한" 설정만 둡니다.
// ⚠️ 이 파일은 Browser로 그대로 전달되므로 Secret(DB 비밀번호, Private API Key 등)을 절대 넣지 않습니다.
window.APP_CONFIG = {
  ENV: 'development',
  API_BASE_URL: 'http://localhost:8016',
};

// 운영 환경 예시 (배포 시 이 파일만 교체)
// window.APP_CONFIG = {
//   ENV: 'production',
//   API_BASE_URL: 'https://api.example.com',
// };