# Баннеры

Docusite позволяет выводить баннеры на doc-страницах — объявления, предупреждения или подсказки. Баннеры показываются только на страницах документации (не на главной `layout: home`).

Есть два независимых источника баннеров:

- **Per-version баннеры** — разные баннеры для актуальной и каждой старой версии (настраиваются в `versions`);
- **Глобальные баннеры** — объявления на любых страницах по префиксу пути (настраиваются в `banners`).

Несколько баннеров на одной странице складываются вертикально.

## Глобальные баннеры

Поле `banners` верхнего уровня — массив баннеров, каждый из которых показывается на страницах, чей путь совпадает с `paths`.

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  banners: [
    // На всех doc-страницах
    { paths: '/', message: 'Мы нанимаем!', type: 'info', dismissible: true },
    // Только на страницах /beta/...
    { paths: '/beta/', message: 'Это бета-документация.', type: 'warning' },
    // На нескольких разделах сразу
    { paths: ['/api/', '/sdk/'], message: 'Сгенерировано автоматически.', type: 'tip' },
  ],
})
```

### `paths`

Префикс пути, по которому показывается баннер:

- `'/'` — все doc-страницы;
- `'/v2/'` — только страницы, путь которых начинается с `v2/`;
- массив — несколько префиксов одновременно.

Префикс матчится по `relativePath` страницы (без учёта локали), поэтому `paths: '/v2/'` сработает и на `/v2/foo.md`, и на `/ru/v2/foo.md`.

## Per-version баннеры

Помимо [версионирования](/guide/versioning), в `versions` можно задать баннеры для актуальной и старых версий:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  versions: {
    latest: '3.0.0',
    // Баннер на страницах актуальной версии
    latestBanner: {
      message: 'Вы читаете документацию актуальной версии ({versionLabel}).',
      type: 'info',
    },
    older: [
      {
        label: 'v2.x.x',
        link: '/v2/introduction/getting-started',
        // Свой баннер для этой старой версии
        banner: {
          message: 'Рекомендуем обновиться до {latestLabel}.',
          link: { text: 'К актуальной версии →', href: '{latestLink}' },
          type: 'warning',
        },
      },
      {
        label: 'v1.x.x',
        link: '/v1/introduction/getting-started',
        banner: {
          message: 'Эта версия устарела.',
          type: 'warning',
        },
      },
      {
        label: 'v0.x.x',
        link: '/v0/introduction/getting-started',
        banner: false, // явно отключить баннер для этой версии
      },
    ],
  },
})
```

`banner: false` явно отключает баннер для конкретной версии — полезно, если на уровне `versions` задан `oldVersionBanner` (fallback), а одну версию нужно исключить.

## Поля конфигурации

### `DocusiteBanner`

| Поле | Тип | По умолчанию | Описание |
|---|---|---|---|
| `message` | `string` | — | Текст баннера. Поддерживает плейсхолдеры (см. ниже) |
| `link` | `{ text, href }?` | — | Кнопка-ссылка (call-to-action). `href` тоже поддерживает плейсхолдеры |
| `type` | `'info' \| 'warning' \| 'tip'` | `'warning'` для версионных, `'info'` для глобальных | Визуальный стиль |
| `dismissible` | `boolean?` | `false` | Разрешить пользователю закрыть баннер (сохраняется в localStorage) |
| `dismissKey` | `string?` | авто | Ключ в localStorage для запоминания закрытия. Генерируется автоматически, если не задан |

### `DocusiteScopedBanner` (глобальные баннеры)

Расширяет `DocusiteBanner` полем `paths` (см. [выше](#paths)).

### Типы баннеров

| `type` | Иконка | Назначение |
|---|---|---|
| `info` | ℹ️ | Информационное сообщение |
| `warning` | ⚠️ | Предупреждение (по умолчанию для версионных) |
| `tip` | 💡 | Подсказка |

Каждый тип имеет свои цвета в светлой и тёмной темах.

## Плейсхолдеры

В `message` и `link.href` можно использовать плейсхолдеры:

| Плейсхолдер | Значение |
|---|---|
| `{latestLink}` | Ссылка на стартовую страницу актуальной версии (с учётом текущей локали) |
| `{latestLabel}` | Метка актуальной версии (например `v3.0.0`) |
| `{versionLabel}` | Метка текущей версии (для per-version баннеров; для `latestBanner` — метка актуальной) |

```ts
banner: {
  message: 'Вы читаете документацию версии {versionLabel}. Актуальная — {latestLabel}.',
  link: { text: 'Перейти →', href: '{latestLink}' },
}
```

## Закрываемые баннеры

При `dismissible: true` справа появляется кнопка `×`. После закрытия баннер больше не показывается пользователю — состояние сохраняется в `localStorage` под ключом `docusite-banner-dismissed:${dismissKey}`.

```ts
{
  paths: '/',
  message: 'Анонс конференции!',
  type: 'tip',
  dismissible: true,
  // dismissKey можно задать вручную, чтобы сбросить закрытие у всех пользователей
  dismissKey: 'conf-2026-announcement',
}
```

Изменение `dismissKey` (например, при обновлении текста анонса) сбрасывает закрытие — баннер снова покажется всем.

## Совместимость с `oldVersionBanner`

> `versions.oldVersionBanner` помечен как deprecated. Рекомендуется использовать `versions.latestBanner` и per-version `banner` на элементах `versions.older[]`.

Старая конфигурация `oldVersionBanner` продолжает работать как **fallback**: если у старой версии нет своего `banner`, применяется `oldVersionBanner`. При этом:

- `oldVersionBanner.message` становится сообщением баннера для таких версий;
- автоматически добавляется ссылка «View latest →» с `{latestLink}`;
- `type` по умолчанию `warning`.

```ts
versions: {
  latest: '3.0.0',
  older: [
    { label: 'v2.x.x', link: '/v2/introduction/getting-started', banner: { message: 'Своя подсказка' } },
    { label: 'v1.x.x', link: '/v1/introduction/getting-started' }, // нет banner → fallback на oldVersionBanner
  ],
  // Deprecated: fallback для версий без своего banner (v1.x.x выше)
  oldVersionBanner: {
    message: 'Вы читаете устаревшую версию. Перейдите на {latestLabel}.',
  },
}
```

При использовании `oldVersionBanner` выводится предупреждение в консоль сборки.

## Вместе с глобальными баннерами

Per-version и глобальные баннеры независимы и складываются на одной странице: первым идёт версионный баннер, затем глобальные в порядке объявления.

```ts
export default defineConfig({
  versions: {
    latest: '3.0.0',
    latestBanner: { message: 'Актуальная версия ({versionLabel}).', type: 'info' },
    older: [{ label: 'v2.x.x', link: '/v2/introduction/getting-started', banner: { message: 'Старая версия.', type: 'warning' } }],
  },
  banners: [
    { paths: '/', message: 'Мы нанимаем!', type: 'tip', dismissible: true },
  ],
})
```
