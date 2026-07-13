# <ReactMark /> Hooks

React-specific hooks for integrating ViewModels with React components.

## `useViewModel`

Creates and manages a ViewModel instance within a React component.

```ts
import { useViewModel } from 'docusite/react'

const vm = useViewModel(MyViewModel, { id: 1 })
```

## <ReactMark /> `useCreateViewModel`

Alternative hook that gives more control over the ViewModel lifecycle.

```ts
import { useCreateViewModel } from 'docusite/react'

const vm = useCreateViewModel(() => new MyViewModel({ id: 1 }))
```
