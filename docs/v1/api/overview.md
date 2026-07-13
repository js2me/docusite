# API: Обзор (v1)

> ⚠️ Вы просматриваете документацию для **v1**. [Перейти к последней версии →](/api/define-config)

## `defineConfig(config)`

Типизированная функция конфигурации:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  description: 'Документация моего проекта',
})
```

## Опции конфигурации (v1)

| Опция | Тип | По умолчанию | Описание |
|---|---|---|---|
| `docsDir` | `string` | `'./docs'` | Путь к директории с документацией |
| `title` | `string` | — | Заголовок сайта |
| `description` | `string` | — | Описание сайта |
| `nav` | `NavItem[]` | — | Навигация в шапке сайта |
| `sidebar` | `Sidebar` | — | Боковое меню |

Для полного списка опций текущей версии см. [API: defineConfig](/api/define-config).
