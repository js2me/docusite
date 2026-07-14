# <ReactMark /> Hooks (v1)

> **Note:** These hooks are deprecated in v2. Use the new `useDocusite()` composable instead.

## `useViewModel` (deprecated)

```ts
import { useViewModel } from 'docusite/react'

const vm = useViewModel(MyViewModel, { id: 1 })
```

## Migration to v2

Replace `useViewModel` with `useDocusite`:

```ts
// v1
const vm = useViewModel(MyViewModel, { id: 1 })

// v2
const vm = useDocusite(MyViewModel, { id: 1 })
```
