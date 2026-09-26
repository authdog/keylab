# Data Model: Next modernization waves

No persisted user data. The planning objects are the waves and the
published contract they must preserve.

## Wave

| Field | Meaning |
| --- | --- |
| id | `1` surface, `2` checks, `3` environments, `4` tooling |
| order | Must ship in id order. A later wave may start only after the previous one is green. |
| caller_visible | `no` for these four waves. A `yes` requires a versioning note and a matching `llm-docs` edit. |
| depends_on | Previous wave id, or none for wave 1 |
| exit_check | Commands in [quickstart.md](./quickstart.md) for that wave |
| manual_edit | Which `llm-docs` page, if any. Empty means do not touch the manual. |

### State

`planned` → `in progress` → `green` → `shipped`

A wave moves to `green` only when its exit check passes and
[contracts/compatibility.md](./contracts/compatibility.md) still holds.
`shipped` means the change is on `main`. Later waves do not reopen it
except to fix a regression they caused.

## Published contract

Not redefined here. The contract is the behavior already described in:

- [llm-docs/getting-started.md](../../llm-docs/getting-started.md)
- [llm-docs/api.md](../../llm-docs/api.md)
- [llm-docs/runtime-compatibility.md](../../llm-docs/runtime-compatibility.md)
- [llm-docs/portable-algorithms.md](../../llm-docs/portable-algorithms.md)
- [llm-docs/migration.md](../../llm-docs/migration.md)

Invariants that waves must preserve are listed in
[contracts/compatibility.md](./contracts/compatibility.md).

## Validation rules

- A wave cannot be `green` if getting-started examples need edits.
- `caller_visible: yes` is invalid unless `manual_edit` names a page.
- Wave 4 cannot remove a dependency that a script still imports.
- Wave 2 cannot include a test-runner upgrade.
