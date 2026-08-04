# <ReactMark /> Хуки (v1)

> **Примечание:** эти хуки устарели в v2. Используйте новый composable `useDocusite()`.

## `useViewModel` (устарел)

```ts
import { useViewModel } from 'docusite/react'

const vm = useViewModel(MyViewModel, { id: 1 })
```

## Миграция на v2

Замените `useViewModel` на `useDocusite`:

```ts
// v1
const vm = useViewModel(MyViewModel, { id: 1 })

// v2
const vm = useDocusite(MyViewModel, { id: 1 })
```
