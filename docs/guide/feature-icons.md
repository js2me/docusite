# Иконки в карточках features

Docusite из коробки поддерживает иконки [Iconify](https://iconify.design/) на главной странице — в блоке `features` frontmatter. Под капотом используются [UnoCSS](https://unocss.dev/) и коллекция `@iconify-json/logos`.

Никакой дополнительной настройки не требуется: docusite автоматически подключает UnoCSS, сканирует markdown-файлы и генерирует нужные CSS-классы.

## Использование

В `docs/index.md` (или любом markdown с `layout: home`) укажите HTML-иконку в поле `icon`:

```yaml
---
layout: home

hero:
  name: My Project
  text: Документация
  tagline: Краткое описание

features:
  - title: MobX-based
    icon: <span class="i-logos:mobx"></span>
    details: Experience the power of MobX
  - title: TypeScript
    icon: <span class="i-logos:typescript-icon"></span>
    details: Out-of-box TypeScript support
  - title: VitePress Powered
    icon: <span class="i-logos:vitejs"></span>
    details: Built on top of VitePress
  - title: Emoji тоже работают
    icon: 🚀
    details: Можно использовать обычные emoji
---
```

## Формат классов

Иконки Iconify в UnoCSS записываются как `i-{коллекция}:{имя}`:

| Класс | Описание |
|---|---|
| `i-logos:mobx` | Логотип MobX |
| `i-logos:typescript-icon` | Логотип TypeScript |
| `i-logos:vitejs` | Логотип Vite / VitePress |
| `i-logos:react` | Логотип React |

Полный список имён — в [коллекции logos на Iconify](https://icon-sets.iconify.design/logos/).

::: tip
Имя иконки должно совпадать с именем в коллекции Iconify. Например, `i-logos:mobx`, а не `i-logos:mobx-icon` — последнее отсутствует в коллекции.
:::

## Кастомные иконки

Если нужна иконка с нестандартным именем (например, свой SVG), положите файл в `docs/public/` и добавьте CSS через [`customCss`](/guide/custom-css):

```css
/* styles/icons.css */
.i-logos\:mobx-icon {
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  background: url(/mobx.svg) no-repeat;
  background-size: 100% 100%;
}
```

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  customCss: ['./styles/icons.css'],
})
```

## Как это работает

При запуске `docusite dev` или `docusite build` docusite:

1. Добавляет плагин UnoCSS с `presetIcons` в сгенерированный `.vitepress/config.mts`
2. Сканирует все `.md` в `docs/` и собирает safelist классов вида `i-*`
3. Подключает `uno.css` в сгенерированную тему `.vitepress/theme/index.ts`
4. Внедряет базовые стили для `.VPFeature .icon` (размер, выравнивание)

Всё это происходит автоматически — в проекте не нужны `vite.config.ts`, UnoCSS-конфиг или ручная установка `@iconify-json/logos`.
