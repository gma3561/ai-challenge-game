import axios from 'axios';
import { Logger } from '../utils/logger.js';
export class SeoulRtmsClient {
    client;
    logger;
    config;
    static SERVICE_NAME = 'tbLnOpendataRtmsV';
    constructor(config) {
        this.logger = new Logger();
        this.config = {
            baseUrl: config.baseUrl ?? 'http://openapi.seoul.go.kr:8088',
            timeoutMs: config.timeoutMs ?? 10000,
            apiKey: config.apiKey,
        };
        this.client = axios.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeoutMs,
        });
    }
    async fetch(params) {
        const type = params.type ?? 'json';
        this.validatePaging(params.startIndex, params.endIndex);
        const segments = [
            encodeURIComponent(this.config.apiKey),
            type,
            SeoulRtmsClient.SERVICE_NAME,
            String(params.startIndex),
            String(params.endIndex),
        ];
        const optionalMap = {
            RCPT_YR: params.rcptYr,
            CGG_CD: params.cggCd,
            CGG_NM: params.cggNm,
            STDG_CD: params.stdgCd,
            LOTNO_SE: params.lotnoSe,
            LOTNO_SE_NM: params.lotnoSeNm,
            MNO: params.mno,
            SNO: params.sno,
            BLDG_NM: params.bldgNm,
            CTRT_DAY: params.ctrtDay,
            BLDG_USG: params.bldgUsg,
        };
        for (const [k, v] of Object.entries(optionalMap)) {
            if (v !== undefined && v !== '') {
                segments.push(encodeURIComponent(k));
                segments.push(encodeURIComponent(String(v)));
            }
        }
        const path = '/' + segments.join('/');
        try {
            this.logger.info('Seoul RTMS request', { path });
            const { data } = await this.client.get(path);
            return data;
        }
        catch (error) {
            this.logger.error('Seoul RTMS fetch error', error);
            throw error;
        }
    }
    validatePaging(startIndex, endIndex) {
        if (!Number.isInteger(startIndex) || !Number.isInteger(endIndex)) {
            throw new Error('START_INDEX and END_INDEX must be integers');
        }
        if (startIndex <= 0 || endIndex <= 0) {
            throw new Error('START_INDEX and END_INDEX must be positive');
        }
        if (endIndex < startIndex) {
            throw new Error('END_INDEX must be >= START_INDEX');
        }
        const window = endIndex - startIndex;
        if (window >= 1000) {
            throw new Error('Request window must be < 1000 (max 1000 rows per request)');
        }
    }
}
//# sourceMappingURL=seoul-rtms-client.js.map