#!/usr/bin/env tsx
import { config } from 'dotenv';
import { SeoulRtmsClient } from '../clients/seoul-rtms-client.js';
config();
async function main() {
    const keyFromEnv = process.env.SEOUL_OPENAPI_KEY;
    const apiKey = keyFromEnv || process.argv[2];
    if (!apiKey) {
        console.error('Usage: pnpm rtms <API_KEY> [START] [END] [YYYY] [CGG_CD] [BLDG_NM] [BLDG_USG]');
        process.exit(1);
    }
    const start = Number(process.argv[3] || 1);
    const end = Number(process.argv[4] || 10);
    const rcptYr = process.argv[5];
    const cggCd = process.argv[6];
    const bldgNm = process.argv[7];
    const bldgUsg = process.argv[8];
    const client = new SeoulRtmsClient({ apiKey });
    const res = await client.fetch({
        type: 'json',
        startIndex: start,
        endIndex: end,
        rcptYr,
        cggCd,
        bldgNm,
        bldgUsg,
    });
    console.log(JSON.stringify(res, null, 2));
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=fetch-rtms.js.map