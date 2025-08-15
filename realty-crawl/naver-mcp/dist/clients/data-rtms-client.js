import axios from 'axios';
import { Logger } from '../utils/logger.js';
export class DataRtmsClient {
    client;
    logger;
    config;
    constructor(config) {
        this.logger = new Logger();
        this.config = {
            baseUrl: config.baseUrl ?? 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev',
            timeoutMs: config.timeoutMs ?? 10000,
            serviceKey: config.serviceKey,
        };
        this.client = axios.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeoutMs,
        });
    }
    async getAptTrades(params) {
        const { LAWD_CD, DEAL_YMD, pageNo = 1, numOfRows = 10, type = 'json' } = params;
        try {
            this.logger.info('Data.go.kr RTMS apt trades request', { LAWD_CD, DEAL_YMD, pageNo, numOfRows });
            const { data } = await this.client.get('/getRTMSDataSvcAptTradeDev', {
                params: {
                    serviceKey: this.config.serviceKey,
                    LAWD_CD,
                    DEAL_YMD,
                    pageNo,
                    numOfRows,
                    _type: type,
                },
            });
            return data;
        }
        catch (error) {
            this.logger.error('Data.go.kr RTMS apt trades error', error);
            throw error;
        }
    }
}
//# sourceMappingURL=data-rtms-client.js.map