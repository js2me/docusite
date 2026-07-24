# Версионирование

Docusite поддерживает одновременное ведение документации для нескольких версий проекта. При включении версионирования в навигации появляется выпадающий список версий, а на страницах старых версий отображается баннер-предупреждение.

## Минимальный пример

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  versions: {
    latest: '2.0.0',
    older: [
      { label: 'v1.x.x', link: '/v1/introduction/getting-started' },
    ],
  },
})
```

## Структура директорий

Файлы разных версий размещаются в поддиректориях внутри `docs/`:

```
docs/
  index.md                        ← актуальная версия
  introduction/
    getting-started.md
  guide/
    configuration.md
  v1/                             ← старая версия
    introduction/
      getting-started.md
    guide/
      configuration.md
```

Префикс пути (например, `/v1/`) определяется вами — он используется в навигации, сайдбаре и для определения старых версий баннером.

## Навигация и сайдбар для каждой версии

При версионировании навигация и сайдбар настраиваются отдельно для каждой версии с помощью **path-keyed** конфигурации — ключами служат префиксы путей:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  nav: {
    '/': [
      { text: 'Guide', link: '/introduction/getting-started' },
    ],
    '/v1/': [
      { text: 'Guide', link: '/v1/introduction/getting-started' },
    ],
  },
  sidebar: {
    '/': [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/introduction/getting-started' },
        ],
      },
    ],
    '/v1/': [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/v1/introduction/getting-started' },
        ],
      },
    ],
  },
  versions: {
    latest: '2.0.0',
    older: [
      { label: 'v1.x.x', link: '/v1/introduction/getting-started' },
    ],
  },
})
```

Docusite автоматически преобразует path-keyed навигацию в VitePress-локали, поэтому каждая версия получает собственную навигацию и сайдбар.

## Поля конфигурации

### `DocusiteVersions`

| Поле | Тип | По умолчанию | Описание |
|---|---|---|---|
| `latest` | `string` | — | Метка актуальной версии, например `'7.2.1'` или `'v3.0.0'`. Если нет префикса `v`, он добавляется автоматически |
| `older` | `DocusiteVersion[]?` | — | Список старых версий |
| `oldVersionBanner` | `object?` | — | Настройка баннера на страницах старых версий |

### `DocusiteVersion`

| Поле | Тип | Описание |
|---|---|---|
| `label` | `string` | Отображаемое название версии, например `'v6.x.x'` |
| `link` | `string` | Ссылка на стартовую страницу версии, например `'/v6/introduction/getting-started'` |

## Баннер старой версии

Когда в `older` указаны старые версии, на страницах с путями, начинающимися с префикса версии (например `/v1/`), автоматически отображается баннер-предупреждение с предложением перейти на актуальную версию.

### Включение / отключение

```ts
export default defineConfig({
  versions: {
    latest: '2.0.0',
    older: [
      { label: 'v1.x.x', link: '/v1/introduction/getting-started' },
    ],
    oldVersionBanner: {
      show: false,  // скрыть баннер
    },
  },
})
```

По умолчанию `show: true`, если указаны `older` версии.

### Кастомное сообщение

В поле `message` можно задать свой текст, используя плейсхолдеры `{latestLink}` и `{latestLabel}`:

```ts
export default defineConfig({
  versions: {
    latest: '2.0.0',
    older: [
      { label: 'v1.x.x', link: '/v1/introduction/getting-started' },
    ],
    oldVersionBanner: {
      message: 'Вы читаете документацию устаревшей версии. Перейдите на {latestLabel}.',
    },
  },
})
```

| Плейсхолдер | Значение |
|---|---|
| `{latestLink}` | Ссылка на стартовую страницу актуальной версии |
| `{latestLabel}` | Метка актуальной версии (например `v2.0.0`) |

## Выпадающий список версий

Docusite автоматически добавляет в навигацию кнопку с текущей версией. При нажатии открывается выпадающий список со всеми версиями. Кнопка отображает метку текущей версии — если вы находитесь на странице старой версии (например `/v1/...`), кнопка покажет `v1.x.x`, иначе — метку актуальной версии.

## Вместе с i18n

Версионирование сочетается с [интернационализацией](/guide/i18n): **язык снаружи, версия внутри** (`/ru/v1/...`).

```
docs/
  introduction/getting-started.md      ← EN latest
  v1/introduction/getting-started.md   ← EN v1
  ru/
    introduction/getting-started.md    ← RU latest
    v1/introduction/getting-started.md ← RU v1
```

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  locales: {
    root: { label: 'English', lang: 'en' },
    ru: { label: 'Русский', lang: 'ru', link: '/ru/' },
  },
  nav: {
    '/': [{ text: 'Guide', link: '/introduction/getting-started' }],
    '/v1/': [{ text: 'Guide', link: '/v1/introduction/getting-started' }],
    '/ru/': [{ text: 'Гайд', link: '/ru/introduction/getting-started' }],
    '/ru/v1/': [{ text: 'Гайд', link: '/ru/v1/introduction/getting-started' }],
  },
  sidebar: {
    '/': [/* EN latest */],
    '/v1/': [/* EN v1 */],
    '/ru/': [/* RU latest */],
    '/ru/v1/': [/* RU v1 */],
  },
  versions: {
    latest: '2.0.0',
    // Ссылки older — только для root locale; для /ru/ префикс добавится сам
    older: [
      { label: 'v1.x.x', link: '/v1/introduction/getting-started' },
    ],
  },
})
```

Docusite:

- мержит path-keyed nav с i18n-локалями (не затирает `label` / `lang`);
- на `/ru/v1/...` показывает баннер и flyout для v1, а «latest» ведёт на `/ru/...`;
- в переключателе языков сохраняет текущую версию (`/v1/...` ↔ `/ru/v1/...`).

## Полный пример

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  nav: {
    '/': [
      { text: 'Guide', link: '/introduction/getting-started' },
      { text: 'API', link: '/api/overview' },
    ],
    '/v1/': [
      { text: 'Guide', link: '/v1/introduction/getting-started' },
      { text: 'API', link: '/v1/api/overview' },
    ],
  },
  sidebar: {
    '/': [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/introduction/getting-started' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/overview' },
        ],
      },
    ],
    '/v1/': [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/v1/introduction/getting-started' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/v1/api/overview' },
        ],
      },
    ],
  },
  versions: {
    latest: '2.0.0',
    older: [
      { label: 'v1.x.x', link: '/v1/introduction/getting-started' },
    ],
    oldVersionBanner: {
      show: true,
      message: 'You are viewing an older version. Switch to {latestLabel}.',
    },
  },
})
```
