# Changelog

Docusite автоматически добавляет ссылку на CHANGELOG в навигацию сайта.

## Варианты настройки

### `true` — ссылка по умолчанию

Добавляет ссылку «CHANGELOG» на `/changelog` в навигацию:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  changelog: true,
})
```

### Строка — кастомная ссылка

Укажите произвольный URL для ссылки:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  changelog: 'https://github.com/user/repo/releases',
})
```

### Объект — копирование файла

Docusite скопирует указанный `CHANGELOG.md` в `docs/changelog.md` при сборке и добавит ссылку в навигацию. Сгенерированный файл не нужно коммитить — docusite добавляет `changelog.md` в `docs/.gitignore` автоматически.

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  changelog: {
    src: '../CHANGELOG.md',       // путь к файлу (относительно корня проекта)
    link: '/changelog',            // необязательно, по умолчанию '/changelog'
  },
})
```

| Поле | Тип | По умолчанию | Описание |
|---|---|---|---|
| `src` | `string` | — | Путь к файлу CHANGELOG.md (относительно корня проекта) |
| `link` | `string?` | `'/changelog'` | Путь ссылки в навигации |

### `false` — скрыть

Убирает ссылку на CHANGELOG из навигации:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  changelog: false,
})
```
