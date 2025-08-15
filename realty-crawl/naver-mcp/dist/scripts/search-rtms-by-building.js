#!/usr/bin/env tsx
import { config } from 'dotenv';
import { SeoulRtmsClient } from '../clients/seoul-rtms-client.js';
config();
async function main() {
    const apiKey = process.env.SEOUL_OPENAPI_KEY || process.argv[2];
    const query = process.argv[3];
    const cggCd = process.argv[4]; // optional
    const startYear = Number(process.argv[5] || 2019);
    const endYear = Number(process.argv[6] || new Date().getFullYear());
    if (!apiKey || !query) {
        console.error('Usage: pnpm rtms:search <API_KEY> <QUERY> [CGG_CD] [START_YEAR] [END_YEAR]');
        process.exit(1);
    }
    const client = new SeoulRtmsClient({ apiKey });
    const results = [];
    for (let year = endYear; year >= startYear; year -= 1) {
        for (let pageStart = 1; pageStart <= 1000; pageStart += 200) {
            const pageEnd = Math.min(pageStart + 199, pageStart + 999);
            const res = await client.fetch({
                type: 'json',
                startIndex: pageStart,
                endIndex: pageEnd,
                rcptYr: String(year),
                cggCd,
            });
            const rows = res?.tbLnOpendataRtmsV?.row || [];
            for (const row of rows) {
                const name = row?.BLDG_NM || '';
                if (name.includes(query) || name.replace(/\s+/g, '').includes(query.replace(/\s+/g, ''))) {
                    results.push(row);
                }
            }
            // Heuristic break if no rows returned
            if (!rows.length)
                break;
        }
    }
    console.log(JSON.stringify({ count: results.length, items: results }, null, 2));
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=search-rtms-by-building.js.map