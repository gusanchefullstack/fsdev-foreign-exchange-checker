# Contract: Browser storage (localStorage)

All keys are prefixed `fx:v1:`. Values are JSON. Every read is wrapped in try/catch and
shape-validated. If it's invalid or missing, the default is used and the bad value is overwritten
on the next write (FR-039). If storage throws (private mode, quota), the app keeps working in
memory.

| Key | Shape | Default | Written when |
|-----|-------|---------|--------------|
| `fx:v1:favorites` | `{from: string; to: string; pinnedAt: number}[]` | `[]` | pin/unpin |
| `fx:v1:log` | `{id; timestamp; from; to; sendAmount; receivedAmount; rate}[]` (≤100, newest first) | `[]` | log, delete, clear, undo |
| `fx:v1:activeTab` | `"history" \| "compare" \| "favorites" \| "log"` | `"history"` | tab change |
| `fx:v1:theme` | `"dark" \| "light"` | `"dark"` | theme toggle |
| `fx:v1:rates` | `{date; latest; previous; fetchedAt}` | none | each successful snapshot fetch |

Clear all writes `[]` immediately. Undo writes the restored array back. So closing the tab during
the undo window finalizes the clear (spec FR-036).

Validation rules: currency codes match `/^[A-Z]{3}$/`, numbers are finite and non-negative, and
entries that fail validation are dropped individually rather than discarding the whole list.
