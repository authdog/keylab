import {readTokenHeaders, getAlgorithmJwt} from './jwt'

const DUMMY_HS256_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"


it('extract properly token headers', async () => {
    const headers = readTokenHeaders(DUMMY_HS256_TOKEN);
    expect(headers).toBeTruthy();
    expect(headers.alg).toEqual("HS256");
    expect(headers.typ).toEqual("JWT");
});

it ('extract properly algorithm from token', async() => {
    expect(getAlgorithmJwt(DUMMY_HS256_TOKEN)).toEqual("HS256")
})

