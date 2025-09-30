const app = require('./app');
const config = require('./config');

const PORT = config.port || 3001;

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});