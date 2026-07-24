# Обзор API (v1)

## `defineConfig(config)`

```ts
import { defineConfig } from "docusite";

export default defineConfig({
  title: "My Project",
  description: "Документация проекта",
});
```

## Опции конфигурации (v1)

| Опция         | Тип         | По умолчанию | Описание               |
| ------------- | ----------- | ------------ | ---------------------- |
| `docsDir`     | `string`    | `'./docs'`   | Путь к директории docs |
| `title`       | `string`    | —            | Заголовок сайта        |
| `description` | `string`    | —            | Описание сайта         |
