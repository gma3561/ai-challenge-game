import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/logger.js';

export type SeoulApiType = 'xml' | 'xmlf' | 'xls' | 'json';

export interface SeoulRtmsClientConfig {
  apiKey: string;
  baseUrl?: string; // defaults to http://openapi.seoul.go.kr:8088
  timeoutMs?: number; // default 10000
}

export interface SeoulRtmsRequestParams {
  type?: SeoulApiType; // default 'json'
  startIndex: number; // START_INDEX
  endIndex: number; // END_INDEX
  rcptYr?: string; // RCPT_YR (YYYY)
  cggCd?: string; // CGG_CD (5-digit)
  cggNm?: string; // CGG_NM
  stdgCd?: string; // STDG_CD (5-digit)
  lotnoSe?: '1' | '2' | '3'; // LOTNO_SE
  lotnoSeNm?: string; // LOTNO_SE_NM
  mno?: string; // MNO (4-digit)
  sno?: string; // SNO (4-digit)
  bldgNm?: string; // BLDG_NM
  ctrtDay?: string; // CTRT_DAY (YYYYMMDD)
  bldgUsg?: '아파트' | '단독다가구' | '연립다세대' | '오피스텔'; // BLDG_USG
}

export interface SeoulRtmsResponse<T = any> {
  list_total_count?: number;
  RESULT?: {
    CODE?: string;
    MESSAGE?: string;
  };
  tbLnOpendataRtmsV?: {
    row?: T[];
  };
}

export class SeoulRtmsClient {
  private client: AxiosInstance;
  private logger: Logger;
  private config: Required<SeoulRtmsClientConfig>;

  private static readonly SERVICE_NAME = 'tbLnOpendataRtmsV';

  constructor(config: SeoulRtmsClientConfig) {
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

  async fetch(params: SeoulRtmsRequestParams): Promise<SeoulRtmsResponse> {
    const type: SeoulApiType = params.type ?? 'json';
    this.validatePaging(params.startIndex, params.endIndex);

    const segments: Array<string> = [
      encodeURIComponent(this.config.apiKey),
      type,
      SeoulRtmsClient.SERVICE_NAME,
      String(params.startIndex),
      String(params.endIndex),
    ];

    const optionalMap: Record<string, string | undefined> = {
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
      const { data } = await this.client.get<SeoulRtmsResponse>(path);
      return data;
    } catch (error) {
      this.logger.error('Seoul RTMS fetch error', error);
      throw error;
    }
  }

  private validatePaging(startIndex: number, endIndex: number): void {
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
