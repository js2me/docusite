# Пользовательский CSS

Опция `customCss` позволяет внедрить дополнительные CSS-файлы в сайт документации. Используйте её, когда настроек `colors` и CSS-переменных VitePress недостаточно.

## Использование

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  customCss: [
    './styles/custom.css',
    './styles/overrides.css',
  ],
})
```

Укажите массив путей к CSS-файлам. Пути разрешаются относительно корня проекта.

## Когда использовать

- Добавление кастомных шрифтов
- Переопределение стилей конкретных компонентов
- Добавление анимаций, не предусмотренных docusite
- Стилизация кастомных Vue-компонентов

## Пример

```css
/* styles/custom.css */

/* Кастомный шрифт */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --vp-font-family-base: 'Inter', sans-serif;
}

/* Переопределение стиля карточек */
.VPFeature .icon {
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
}
```

## Как это работает

Docusite внедряет каждый указанный CSS-файл как Vite-плагин, который подключает файлы к сборке.

::: tip
Сначала попробуйте добиться нужного результата через CSS-переменные VitePress и опцию `colors`. Используйте `customCss` только когда этих инструментов недостаточно.

Для иконок в карточках features на главной странице обычно достаточно встроенной поддержки Iconify — см. [Иконки features](/guide/feature-icons).
:::
