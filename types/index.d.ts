export interface CustomReqExpress {
    originalUrl?: string;
    method?: string;
    headers?: {
        authorization?: string
    };
}

export interface CustomResExpress {
}

export interface CustomMiddlewareExpress {
    unless?: Function;
}