# Data Model: More algorithms

No persisted user data. The planning objects are the waves, the
algorithms they add, and the published contract they must preserve.

## Wave

| Field | Meaning |
| --- | --- |
| id | `1` ML-DSA-65, `2` ML-DSA-44 and ML-DSA-87, `3` content-encryption names |
| order | Must ship in id order. A later wave may start only after the previous one is green. |
| caller_visible | `yes` for all three. Each requires a versioning note of "additive" and a matching `llm-docs` edit. |
| depends_on | Previous wave id, or none for wave 1 |
| exit_check | Commands in [quickstart.md](./quickstart.md) for that wave |
| manual_edit | Wave 1 and 2: `llm-docs/portable-algorithms.md` and `llm-docs/runtime-compatibility.md`. Wave 3: `llm-docs/api.md`. |

### State

`planned` → `in progress` → `green` → `shipped`

A wave moves to `green` only when its exit check passes and
[contracts/algorithms.md](./contracts/algorithms.md) still holds.
`shipped` means the change is on `main`. Later waves do not reopen it
except to fix a regression they caused.

## Signature algorithm

| Field | Meaning |
| --- | --- |
| name | `ML-DSA-65` in wave 1. `ML-DSA-44` and `ML-DSA-87` in wave 2. |
| job | Key generation, sign, and verify through the existing published jobs. |
| key | AKP JWK. `alg` required. `pub` required. `priv` is the 32-byte seed and only on private keys. |
| context | Empty string. Not a caller option in these waves. |
| mismatch | Verification fails when the required name differs from the name that signed the token. |

## Content-encryption algorithm

| Field | Meaning |
| --- | --- |
| name | `A128GCM`, `A192GCM`, `A256GCM`, `A128CBC-HS256`, `A192CBC-HS384`, `A256CBC-HS512` |
| job | Value a caller may pass as the existing encryption `enc` field. |
| acceptance | The field stays a string. A value outside this list that already works stays accepted. |

## Published contract

Not redefined here. The contract is the behavior already described in:

- [llm-docs/getting-started.md](../../llm-docs/getting-started.md)
- [llm-docs/api.md](../../llm-docs/api.md)
- [llm-docs/runtime-compatibility.md](../../llm-docs/runtime-compatibility.md)
- [llm-docs/portable-algorithms.md](../../llm-docs/portable-algorithms.md)
- [llm-docs/migration.md](../../llm-docs/migration.md)

Vulnerability intake stays in [SECURITY.md](../../SECURITY.md). It is not restated here.

Invariants that waves must preserve are listed in
[contracts/algorithms.md](./contracts/algorithms.md).

## Validation rules

- A wave cannot be `green` if getting-started examples need edits.
- `caller_visible: yes` is invalid unless `manual_edit` names a page.
- Wave 1 cannot add ML-DSA-44, ML-DSA-87, or content-encryption names.
- Wave 2 cannot add a new dependency or a PEM encoding.
- Wave 3 cannot change `enc` from a string to a closed list.
- No wave may log a private seed, token, or other private key material.
