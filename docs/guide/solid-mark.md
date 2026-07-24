# Компонент \<SolidMark /\>

`<SolidMark />` — компонент для отображения инлайн-иконки Solid в навигации, сайдбаре и тексте. Используется для визуальной маркировки Solid-специфичного API.

## Использование в навигации и сайдбаре

Добавьте строку `<SolidMark />` в поле `text` элемента навигации или сайдбара — docusite автоматически заменит её на SVG-иконку:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  nav: [
    { text: '<SolidMark /> Hooks', link: '/api/solid-hooks' },
  ],
  sidebar: {
    '/': [
      {
        text: 'API',
        items: [
          { text: '<SolidMark /> Hooks', link: '/api/solid-hooks' },
        ],
      },
    ],
  },
})
```

Docusite рекурсивно обходит все элементы `nav` и `sidebar` и заменяет `<SolidMark />` на инлайн SVG с классом `vp-sidebar-solid-mark`.

## Использование в markdown

`<SolidMark />` доступен как глобальный Vue-компонент в markdown-файлах:

```md
## <SolidMark /> createSignal

Solid-примитив для реактивного состояния.
```

Компонент рендерится как инлайн `<span>` с SVG-иконкой, размером 1em, выровненный по вертикали.

Vue-компонент попадает в клиентский бандл темы только если `<SolidMark />` реально используется в markdown (примеры в code fence не считаются). В `nav`/`sidebar` плейсхолдер всегда заменяется на инлайн SVG на этапе генерации конфига — отдельный Vue-компонент для этого не нужен.

## CSS-классы

| Класс | Контекст | Описание |
|---|---|---|
| `vp-inline-solid-mark` | Prose / заголовки | Инлайн-иконка в тексте markdown |
| `vp-sidebar-solid-mark` | Сайдбар / навигация | Иконка в преобразованном HTML-тексте |
| `vp-sidebar-solid-icon` | Сайдбар / навигация | SVG-элемент иконки в сайдбаре |

В светлой теме к иконке в сайдбаре применяется фильтр `brightness(0.88) saturate(1.05)` для лучшей видимости.
