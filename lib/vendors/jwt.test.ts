import {readTokenHeaders} from './jwt'

it('extract properly token headers', async () => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    const headers = readTokenHeaders(token);
    expect(headers).toBeTruthy();
    expect(headers.alg).toEqual("HS256");
    expect(headers.typ).toEqual("JWT");
})