export interface IValidateJwtCredentials {
    // HS256
    secret?: string;
    // RS256
    domainUri?: string;
    jwksUri?: string;
}
