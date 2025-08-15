#!/usr/bin/env tsx
import { config } from 'dotenv';
import { DataRtmsClient } from '../clients/data-rtms-client.js';
config();
async function main() {
    const keyFromEnv = process.env.DATA_GO_KR_SERVICE_KEY;
    const serviceKey = keyFromEnv || process.argv[2];
    if (!serviceKey) {
        console.error('Usage: pnpm data:rtms <SERVICE_KEY> <LAWD_CD> <DEAL_YMD> [pageNo] [numOfRows]');
        process.exit(1);
    }
    const LAWD_CD = process.argv[3] || '11680'; // 강남구 예시
    const DEAL_YMD = process.argv[4] || '202501';
    const pageNo = Number(process.argv[5] || 1);
    const numOfRows = Number(process.argv[6] || 10);
    const client = new DataRtmsClient({ serviceKey });
    const res = await client.getAptTrades({ LAWD_CD, DEAL_YMD, pageNo, numOfRows, type: 'json' });
    console.log(JSON.stringify(res, null, 2));
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=fetch-data-rtms.js.map