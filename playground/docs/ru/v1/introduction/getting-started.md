# Быстрый старт (v1)

Добро пожаловать в документацию **Docusite v1** (русская локаль).

## Установка (v1)

```bash
pnpm add -D docusite@1
```

## Конфигурация (v1)

```ts
import { defineConfig } from "docusite";

export default defineConfig({
  title: "My Project",
});
```

В v1 меньше опций — нет автогенерации brand colors, версионирования и llms.txt.

Эта страница лежит по пути `/ru/v1/...`: язык снаружи, версия внутри.
