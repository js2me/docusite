# Подстановка контента (шаблонные переменные)

Content injections позволяют внедрять динамические значения прямо в markdown-файлы через шаблонные переменные. Это полезно для подстановки версий, URL API и других значений, которые меняются между сборками.

## Встроенная переменная `packageJson`

Docusite автоматически читает `package.json` из корня проекта (там, где лежит `docusite.config.ts`) и добавляет его как переменную `packageJson`. Настраивать ничего не нужно — достаточно использовать в markdown:

```md
Имя пакета: @{packageJson.name}

Версия: @{packageJson.version}

Описание: @{packageJson.description}
```

Если `package.json` не найден или не удалось его распарсить, переменная `packageJson` не добавляется.

Чтобы переопределить встроенное значение, объявите `packageJson` в `contentInjections` — пользовательская запись имеет приоритет.

## Настройка

Определите переменные в конфигурации:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  contentInjections: [
    { key: 'version', value: { major: 2, minor: 0, full: '2.0.0' } },
    { key: 'api', value: { baseUrl: 'https://api.example.com' } },
  ],
})
```

## Использование в markdown

В любом markdown-файле используйте синтаксис `@{key}` или `@{key.path}`:

```md
Текущая версия: @{version.full}

API базовый URL: @{api.baseUrl}

Старшая версия: v@{version.major}
```

После обработки docusite заменит шаблоны на значения:

```md
Текущая версия: 2.0.0

API базовый URL: https://api.example.com

Старшая версия: v2
```

## Разрешение путей

Docusite поддерживает точечную нотацию для вложенных объектов:

- `@{version}` → весь объект, JSON-сериализованный (с HTML-экранированием фигурных скобок)
- `@{version.full}` → `"2.0.0"`
- `@{version.major}` → `2`
- `@{api.baseUrl}` → `"https://api.example.com"`
- `@{packageJson.name}` → `"my-project"`
- `@{packageJson.version}` → `"1.2.3"`

## Поддерживаемые типы значений

Значение (`value`) может быть любым JSON-сериализуемым типом:

- `string` — строка
- `number` — число
- `boolean` — логическое значение
- `object` — объект (с поддержкой вложенности через точечную нотацию)
- `array` — массив

## Как это работает

Docusite внедряет Vite-плагин, который на этапе сборки и разработки ищет паттерн `@{key.path}` в markdown-файлах и заменяет его на соответствующее значение из конфигурации.
