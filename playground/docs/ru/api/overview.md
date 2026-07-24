# Обзор API

Страница справочника API (русская локаль, latest).
Текущая версия: **@{version.full}** (v@{version.major}.@{version.minor}).  
Базовый URL API: @{api.baseUrl}

## `defineConfig(config)`

Типобезопасный хелпер конфигурации.

```ts
import { defineConfig } from "docusite";

export default defineConfig({
  title: "My Project",
  description: "Документация проекта",
});
```
