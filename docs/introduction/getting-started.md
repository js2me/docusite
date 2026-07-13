# Начало работы

**Docusite** — простой инструмент для создания документации на базе VitePress. Вместо ручной настройки VitePress с кучей бойлерплейта (`.vitepress/config.mts`, файлы темы, плагины, CSS-переменные), вы пишете один файл `docusite.config.ts` — и docusite генерирует всё за вас.

## Предварительные требования

- **Node.js** >= 20
- **pnpm** (рекомендуется) или npm/yarn

## Установка

Установите docusite как зависимость для разработки:

```bash
pnpm add -D docusite
```

## Создание конфигурации

Создайте файл `docusite.config.ts` в корне проекта:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  description: 'Документация моего проекта',
  colors: { light: '#646cff', dark: '#535bf2' },
})
```

## Добавление скриптов

Добавьте скрипты в `package.json`:

```json
{
  "scripts": {
    "docs:dev": "docusite dev",
    "docs:build": "docusite build",
    "docs:preview": "docusite preview"
  }
}
```

## Создание документации

Создайте директорию `docs/` и добавьте первый markdown-файл:

```bash
mkdir docs
```

Создайте `docs/index.md` — главную страницу:

```md
---
layout: home

hero:
  name: My Project
  text: Документация
  tagline: Описание моего проекта
  actions:
    - theme: brand
      text: Начать
      link: /introduction/getting-started
---
```

Создайте `docs/introduction/getting-started.md`:

```md
# Начало работы

Добро пожаловать в документацию My Project!
```

## Запуск сервера разработки

```bash
pnpm docs:dev
```

Откройте URL, указанный в консоли (обычно `http://localhost:5173`), чтобы увидеть ваш сайт документации.

## Сборка для продакшена

```bash
pnpm docs:build
```

Собранный сайт будет доступен в `docs/.vitepress/dist/`.

## Что дальше?

- [Конфигурация](/guide/configuration) — полный список опций `docusite.config.ts`
- [Фирменные цвета](/guide/brand-colors) — настройка цветов и CSS
- [Версионирование](/guide/versioned-docs) — поддержка нескольких версий документации
