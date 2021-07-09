import { jwksClient, createKeyStore, generateKeyFromStore } from "."
import * as nock from "nock"

const tenantUuid = "d84ddef4-81dd-4ce6-9594-03ac52cac367"
const applicationUuid = "b867db48-4e11-4cae-bb03-086dc97c8ddd"
const AUTHDOG_API_ROOT = "https://api.authdog.xyz"

it("initiate properly jwksClient", async () => {
    const store = createKeyStore()
    const keyGenerated = await generateKeyFromStore(store)
    const regExpPathAppJwks = new RegExp(
        `api\/v1\/${tenantUuid}\/${applicationUuid}\/.well-known\/jwks.json*`
    )

    nock(AUTHDOG_API_ROOT)
        .persist()
        .get(regExpPathAppJwks)
        .reply(200, {
            keys: [keyGenerated],
        })

    const res = await jwksClient({
        jwksUri: `${AUTHDOG_API_ROOT}/api/v1/${tenantUuid}/${applicationUuid}/.well-known/jwks.json`,
        verifySsl: false,
    })

    expect(res.keys).toBeTruthy()
    expect(res.keys.length).toEqual(1)
})
