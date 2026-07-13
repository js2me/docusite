# Компонент \<ReactMark /\>

`<ReactMark />` — компонент для отображения инлайн-иконки React (орбита атома) в навигации, сайдбаре и тексте. Используется для визуальной маркировки React-специфичного API.

## Использование в навигации и сайдбаре

Добавьте строку `<ReactMark />` в поле `text` элемента навигации или сайдбара — docusite автоматически заменит её на SVG-иконку:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  nav: [
    { text: '<ReactMark /> Hooks', link: '/api/react-hooks' },
  ],
  sidebar: {
    '/': [
      {
        text: 'API',
        items: [
          { text: '<ReactMark /> Hooks', link: '/api/react-hooks' },
        ],
      },
    ],
  },
})
```

Docusite рекурсивно обходит все элементы `nav` и `sidebar` и заменяет `<ReactMark />` на инлайн SVG с классом `vp-sidebar-react-mark`.

## Использование в markdown

`<ReactMark />` доступен как глобальный Vue-компонент в markdown-файлах:

```md
## <ReactMark /> useViewModel

React-хук для управления ViewModel.
```

Компонент рендерится как инлайн `<span>` с SVG-иконкой, размером 1em, выровненный по вертикали.

## CSS-классы

| Класс | Контекст | Описание |
|---|---|---|
| `vp-inline-react-mark` | Prose / заголовки | Инлайн-иконка в тексте markdown |
| `vp-sidebar-react-mark` | Сайдбар / навигация | Иконка в преобразованном HTML-тексте |
| `vp-sidebar-react-icon` | Сайдбар / навигация | SVG-элемент иконки в сайдбаре |

В светлой теме к иконке в сайдбаре применяется фильтр `brightness(0.88) saturate(1.05)` для лучшей видимости.
