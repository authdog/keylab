import {jwksClient} from '../lib/vendors'
import * as nock from "nock";

const tenantUuid = "d84ddef4-81dd-4ce6-9594-03ac52cac367"
const applicationUuid = "b867db48-4e11-4cae-bb03-086dc97c8ddd"

it('initiate properly jwksClient', async () => {

    // TODO: generate keys, inject in the mocked response

    const regExpPathAppJwks = new RegExp(`api\/v1\/${tenantUuid}\/${applicationUuid}\/.well-known\/jwks.json*`)

    nock("https://api.authdog.xyz")
    .persist()
    .get(regExpPathAppJwks)
    .reply(200,     {
        keys: [
          {
            kty: 'RSA',
            kid: 'LtQ8v6tdhTycscqav6FsIqjmdUpHNx0dli_q17A4lek',
            use: 'sig',
            alg: 'RS256',
            x5c: '',
            x5t: '',
            x5u: '',
            key_ops: '',
            n: 'dVJSTFFEcEpPc01xS0E4eUtadlpSTUNUNXhWSjBodnZfd2w1Vm1qeGhrX1RNbTh1ZGdwdnBYYWRYeU5WSGxwQTVzdzdGOEFFWFBaUGFZY1VuQXhpQW0xUTAzUzBLWkJNMWRQTjRaY2JnX1pOcjFJRG8zRDJzMVlHTjlGaTFEUnJjVXg2THgwSXgyRm9TWjJoLU1MS3NSME1CS1ZVdDl5NWlwaHVCT3pvZzh4el9CLWZZYlhMRzRLbkNXQjk2aGxBTzVwUjlZbHFHN1hVTWZqSlBnNVNJWW9EVlFab2lMalIyMHVWVktjUVZyOVZqVklMZEpvdEhndWlLMWFncHc0NXdQTHZJdnB3N24zVnpTTEM2dW5xVjlsZjY4aG9NOFRiMGxweXV4djBjeER6RDNDZ3o3WjlHak5jdEZnLVhacjQxdjk3R0kxN2RIUjJZTGRVZzl6SnBR',
            e: 'AQAB',
            key_id: 'GC8skJWjSX8y5x3rLsRFLmbzqoRw6ALSwp1muUibeHk'
          }
        ]
      }
  );


    const res = await jwksClient({
        // domainUri: '',
        jwksUri: `https://api.authdog.xyz/api/v1/${tenantUuid}/${applicationUuid}/.well-known/jwks.json`,
        verifySsl: false
    })
    

    expect(res.keys).toBeTruthy()
    expect(res.keys.length).toEqual(1)
});