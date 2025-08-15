export interface DataRtmsClientConfig {
    serviceKey: string;
    baseUrl?: string;
    timeoutMs?: number;
}
export interface AptTradeParams {
    LAWD_CD: string;
    DEAL_YMD: string;
    pageNo?: number;
    numOfRows?: number;
    type?: 'json' | 'xml';
}
export declare class DataRtmsClient {
    private client;
    private logger;
    private config;
    constructor(config: DataRtmsClientConfig);
    getAptTrades(params: AptTradeParams): Promise<any>;
}
