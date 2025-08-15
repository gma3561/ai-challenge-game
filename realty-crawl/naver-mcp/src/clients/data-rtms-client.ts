import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/logger.js';

export interface DataRtmsClientConfig {
  serviceKey: string; // data.go.kr serviceKey (URL-encoded allowed)
  baseUrl?: string; // default https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev
  timeoutMs?: number; // default 10000
}

export interface AptTradeParams {
  LAWD_CD: string; // 법정동코드(5자리, 구 단위)
  DEAL_YMD: string; // 거래년월(YYYYMM)
  pageNo?: number;
  numOfRows?: number; // <= 1000
  type?: 'json' | 'xml';
}

export class DataRtmsClient {
  private client: AxiosInstance;
  private logger: Logger;
  private config: Required<DataRtmsClientConfig>;

  constructor(config: DataRtmsClientConfig) {
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

  async getAptTrades(params: AptTradeParams): Promise<any> {
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
    } catch (error) {
      this.logger.error('Data.go.kr RTMS apt trades error', error);
      throw error;
    }
  }
}
