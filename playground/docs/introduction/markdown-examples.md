# Markdown Examples

Примеры встроенных custom containers и алертов VitePress.

## Custom Containers

::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

## Custom Titles

::: info Информация
Блок info с кастомным заголовком.
:::

::: tip Полезно знать
Блок tip с кастомным заголовком.
:::

::: warning Внимание
Блок warning с кастомным заголовком.
:::

::: danger STOP
Danger zone, do not proceed.
:::

::: details Нажми, чтобы раскрыть
```ts
export const hello = 'world'
```
:::

::: details Открыто по умолчанию {open}
Этот блок details открыт сразу благодаря атрибуту `open`.
:::

## GitHub-flavored Alerts

> [!NOTE]
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.
