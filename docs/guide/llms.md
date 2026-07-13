# Генерация llms.txt

Docusite автоматически генерирует файлы `llms.txt` и `llms-full.txt` — стандарт для LLM-дружественной документации. Это позволяет AI-ассистентам и LLM эффективно потреблять вашу документацию.

## Базовое использование

По умолчанию генерация включена (`llms: true`):

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  llms: true,
})
```

При этом:
- Создаётся `/llms.txt` — краткий индекс документации
- Создаётся `/llms-full.txt` — полная документация в текстовом виде
- В навигацию добавляется ссылка «LLM, AI docs 🤖»

## Отключение

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  llms: false,
})
```

## Расширенная настройка

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  llms: {
    llmsTxt: true,           // генерировать llms.txt (по умолчанию: true)
    llmsFullTxt: true,       // генерировать llms-full.txt (по умолчанию: true)
    ignoreFiles: ['**/drafts/**'],  // глоб-шаблоны для исключения файлов
    ignoreFrontmatter: true, // убирать frontmatter из вывода (по умолчанию: true)
    description: 'Документация My Project',  // описание для llms.txt
  },
})
```

### Поля DocusiteLlmsOptions

| Поле | Тип | По умолчанию | Описание |
|---|---|---|---|
| `llmsTxt` | `boolean?` | `true` | Генерировать llms.txt |
| `llmsFullTxt` | `boolean?` | `true` | Генерировать llms-full.txt |
| `ignoreFiles` | `string[]?` | — | Глоб-шаблоны файлов для исключения |
| `ignoreFrontmatter` | `boolean?` | `true` | Удалять frontmatter из вывода |
| `description` | `string?` | — | Описание проекта для llms.txt |

## Как это работает

### В режиме разработки

Docusite внедряет кастомный Vite-плагин, который перехватывает запросы к `/llms.txt` и `/llms-full.txt` и генерирует содержимое на лету — рекурсивно сканируя директорию `docs/` на наличие `.md`-файлов.

### В продакшене

Используется плагин `vitepress-plugin-llms`, который генерирует файлы на этапе сборки.
