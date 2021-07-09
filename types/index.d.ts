export interface CustomReqExpress {
    originalUrl?: string
    method?: string
    headers?: {
        authorization?: string
        "access-control-request-headers"?: string
    }
}

export interface CustomResExpress {}

export interface CustomMiddlewareExpress {
    unless?: Function
}
