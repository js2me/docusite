# Компонент \<VueMark /\>

`<VueMark />` — компонент для отображения инлайн-иконки Vue в навигации, сайдбаре и тексте. Используется для визуальной маркировки Vue-специфичного API.

## Использование в навигации и сайдбаре

Добавьте строку `<VueMark />` в поле `text` элемента навигации или сайдбара — docusite автоматически заменит её на SVG-иконку:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  nav: [
    { text: '<VueMark /> Composables', link: '/api/vue-composables' },
  ],
  sidebar: {
    '/': [
      {
        text: 'API',
        items: [
          { text: '<VueMark /> Composables', link: '/api/vue-composables' },
        ],
      },
    ],
  },
})
```

Docusite рекурсивно обходит все элементы `nav` и `sidebar` и заменяет `<VueMark />` на инлайн SVG с классом `vp-sidebar-vue-mark`.

## Использование в markdown

`<VueMark />` доступен как глобальный Vue-компонент в markdown-файлах:

```md
## <VueMark /> useViewModel

Vue-компосабл для управления ViewModel.
```

Компонент рендерится как инлайн `<span>` с SVG-иконкой, размером 1em, выровненный по вертикали.

Vue-компонент попадает в клиентский бандл темы только если `<VueMark />` реально используется в markdown (примеры в code fence не считаются). В `nav`/`sidebar` плейсхолдер всегда заменяется на инлайн SVG на этапе генерации конфига — отдельный Vue-компонент для этого не нужен.

## CSS-классы

| Класс | Контекст | Описание |
|---|---|---|
| `vp-inline-vue-mark` | Prose / заголовки | Инлайн-иконка в тексте markdown |
| `vp-sidebar-vue-mark` | Сайдбар / навигация | Иконка в преобразованном HTML-тексте |
| `vp-sidebar-vue-icon` | Сайдбар / навигация | SVG-элемент иконки в сайдбаре |

В светлой теме к иконке в сайдбаре применяется фильтр `brightness(0.88) saturate(1.05)` для лучшей видимости.
