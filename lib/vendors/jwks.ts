import {default as fetch} from 'node-fetch'
const https = require('https');

export const jwksClient = async ({
    jwksUri,
    verifySsl
}) => {

    const httpsAgent = new https.Agent({
        rejectUnauthorized: verifySsl,
    });

    return await fetch(jwksUri, {
        method: 'GET',
        // headers: headers,
        // body: body,
        agent: httpsAgent,
    })
    .then((res) => res.json())
    .catch((err) =>  console.log(err))
}