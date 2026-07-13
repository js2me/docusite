# Начало работы (v1)

> ⚠️ Вы просматриваете документацию для **v1**. [Перейти к последней версии →](/introduction/getting-started)

Добро пожаловать в документацию **Docusite v1**.

## Установка

```bash
pnpm add -D docusite@1
```

## Конфигурация

Создайте файл `docusite.config.ts`:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  description: 'Документация моего проекта',
})
```

## Добавление скриптов

```json
{
  "scripts": {
    "docs:dev": "docusite dev",
    "docs:build": "docusite build"
  }
}
```

## Ограничения v1

Версия v1 имеет ограниченный набор функций по сравнению с v2:

- Нет автогенерации брендовых цветов
- Нет селектора версий
- Нет генерации llms.txt
- Нет шаблонных переменных (content injections)
- Нет клиентских скриптов (runtime scripts)
- Нет компонента `<ReactMark />`
