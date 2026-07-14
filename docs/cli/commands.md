# CLI команды

Docusite предоставляет CLI-команды для инициализации, разработки, сборки и предпросмотра документации.

## `docusite init`

Создаёт стартовый файл `docusite.config.ts` в текущей директории с примером конфигурации.

```bash
docusite init
```

Если файл конфигурации (`docusite.config.ts`, `.mts`, `.js` или `.mjs`) уже существует — команда завершится с ошибкой.

Созданный файл содержит базовую конфигурацию с плейсхолдер-ссылками, которые нужно заменить на реальные:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  description: 'My project documentation',
  colors: {
    light: '#646cff',
    dark: '#535bf2',
  },
  nav: [
    { text: 'Guide', link: '/introduction/getting-started' },
    { text: 'API', link: '/api/overview' },
  ],
  sidebar: {
    '/': [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/introduction/getting-started' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: 'Overview', link: '/api/overview' },
        ],
      },
    ],
  },
  search: 'local',
  github: 'https://github.com/user/repo',
})
```

## `docusite dev [root]`

Запускает сервер разработки с горячей перезагрузкой.

```bash
docusite dev
docusite dev ./docs --port 8080
```

| Аргумент | Описание |
|---|---|
| `[root]` | Корневая директория проекта (по умолчанию — текущая) |

| Опция | По умолчанию | Описание |
|---|---|---|
| `--port` | `5173` | Порт сервера разработки |

## `docusite build [root]`

Собирает сайт документации для продакшена.

```bash
docusite build
```

| Аргумент | Описание |
|---|---|
| `[root]` | Корневая директория проекта (по умолчанию — текущая) |

Результат сборки сохраняется в `docs/.vitepress/dist/`.

## `docusite preview [root]`

Запускает локальный сервер для предпросмотра собранного сайта.

```bash
docusite preview
docusite preview --port 8080
```

| Аргумент | Описание |
|---|---|
| `[root]` | Корневая директория проекта (по умолчанию — текущая) |

| Опция | По умолчанию | Описание |
|---|---|---|
| `--port` | `4173` | Порт сервера предпросмотра |

## Внутренний процесс

Каждая команда выполняет одни и те же шаги:

1. **Загрузка конфигурации** — ищет `docusite.config.ts` (или `.mts`/`.js`/`.mjs`) в корне проекта, загружает с помощью `jiti`
2. **Определение директории docs** — по умолчанию `./docs`, переопределяется через `docsDir`
3. **Трансформация конфигурации** — преобразует `DocusiteConfig` в стандартный `UserConfig` VitePress
4. **Запись файлов VitePress** — создаёт `.vitepress/` внутри директории docs, записывает `config.mts`, файлы темы и CSS
5. **Запуск VitePress** — вызывает соответствующее API VitePress (dev-сервер, сборка или preview)

## Скрипты package.json

Рекомендуемые скрипты:

```json
{
  "scripts": {
    "docs:dev": "docusite dev",
    "docs:build": "docusite build",
    "docs:preview": "docusite preview"
  }
}
```
