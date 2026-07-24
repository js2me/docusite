# Быстрый старт

Добро пожаловать в **Docusite v2** — простой способ создать документацию для проекта.

## Установка

1. Установите docusite:

```bash
pnpm add -D docusite
```

2. Создайте `docusite.config.ts`:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  colors: { light: '#646cff', dark: '#535bf2' },
})
```

3. Добавьте скрипты в `package.json`:

```json
{
  "scripts": {
    "docs:dev": "docusite dev",
    "docs:build": "docusite build"
  }
}
```

4. Пишите markdown в `./docs/` и запускайте `pnpm docs:dev`.

Это playground-пример **i18n + версионирование**: актуальная русская документация на `/ru/`, старая — на `/ru/v1/`.
