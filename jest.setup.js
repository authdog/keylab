const fetch = require('node-fetch');
const { Headers } = fetch;

if (!global.fetch) {
    global.fetch = fetch;
    global.Headers = Headers;
}