export type SeoulApiType = 'xml' | 'xmlf' | 'xls' | 'json';
export interface SeoulRtmsClientConfig {
    apiKey: string;
    baseUrl?: string;
    timeoutMs?: number;
}
export interface SeoulRtmsRequestParams {
    type?: SeoulApiType;
    startIndex: number;
    endIndex: number;
    rcptYr?: string;
    cggCd?: string;
    cggNm?: string;
    stdgCd?: string;
    lotnoSe?: '1' | '2' | '3';
    lotnoSeNm?: string;
    mno?: string;
    sno?: string;
    bldgNm?: string;
    ctrtDay?: string;
    bldgUsg?: '아파트' | '단독다가구' | '연립다세대' | '오피스텔';
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
export declare class SeoulRtmsClient {
    private client;
    private logger;
    private config;
    private static readonly SERVICE_NAME;
    constructor(config: SeoulRtmsClientConfig);
    fetch(params: SeoulRtmsRequestParams): Promise<SeoulRtmsResponse>;
    private validatePaging;
}
