export interface IJwksClient {
    jwksUri?: string // required for RS256
    domainUri?: string // required when domainUri doesn't match jwksUri's host
    verifySsl?: boolean // set it to true if you're using self-signed certificate in local environment
}
