# <ReactMark /> Хуки

React-хуки для интеграции ViewModel с компонентами (русская локаль).

## `useViewModel`

Создаёт и управляет экземпляром ViewModel внутри React-компонента.

```ts
import { useViewModel } from 'docusite/react'

const vm = useViewModel(MyViewModel, { id: 1 })
```
