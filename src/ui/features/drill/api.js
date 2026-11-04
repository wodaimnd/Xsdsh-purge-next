// @ts-check
// Transport keeps the legacy endpoint and response contract.
/** @param {{op: string, [key: string]: unknown}} req */
const api = (req) => fetch('/redteam/api', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(req),
}).then((res) => res.json())

export { api };
