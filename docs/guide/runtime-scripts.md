# Клиентские скрипты (runtime)

Опция `runtimeScript` позволяет выполнить JavaScript-код только в браузере (не во время SSR). Тело функции встраивается в сгенерированную тему VitePress.

## Использование

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  runtimeScript: () => {
    console.log('Hello from docusite runtime!')
  },
})
```

## Как это работает

1. Docusite извлекает тело стрелочной функции как строку
2. Встраивает его в метод `enhanceApp()` сгенерированной темы
3. Оборачивает в проверку `if (!import.meta.env.SSR)` — код выполняется только в браузере

Генерируемый код выглядит примерно так:

```ts
enhanceApp() {
  if (!import.meta.env.SSR) {
    console.log('Hello from docusite runtime!')
  }
}
```

## Динамические импорты

Динамические импорты внутри `runtimeScript` разрешаются относительно `docs/.vitepress/theme/`:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  runtimeScript: () => {
    void import('my-devtools').then((m) => m.loadDevtools())
  },
})
```

## Примеры использования

### Аналитика

```ts
runtimeScript: () => {
  window.plausible = window.plausible || function() {
    (window.plausible.q = window.plausible.q || []).push(arguments)
  }
  const s = document.createElement('script')
  s.src = 'https://plausible.io/js/script.js'
  s.dataset.domain = 'myproject.dev'
  document.head.appendChild(s)
}
```

### Кастомные DOM-манипуляции

```ts
runtimeScript: () => {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded')
  })
}
```

::: warning
`runtimeScript` принимает только стрелочную функцию `() => void`. Обычные функции и `async` не поддерживаются.
:::
