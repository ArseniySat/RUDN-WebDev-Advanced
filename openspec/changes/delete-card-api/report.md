# Report: delete-card-api

## Что изменено

### Серверная часть (`server/`)

| Файл | Изменение |
|---|---|
| `services/cards.service.ts` | `deleteCard`: сохранение `before = cards.length` до переназначения `cards = newCards` — баг-фикс, `filter` всегда создаёт новый массив |
| `routes/cards.router.ts` | `DELETE /cards` → `DELETE /cards/:id` — чтение ID из пути |
| `controllers/cards.controller.ts` | `remove`: `req.query.id` → `req.params.id`; `sendStatus(204/404)` → `status(204).end()` / `status(404).json({error})` |
| `index.ts` | Добавлены два middleware после `cardsRouter`: 404 JSON для неизвестных путей, error-middleware (4 параметра) для 500 JSON |

### Документация (`openspec/changes/delete-card-api/`)

| Файл | Изменение |
|---|---|
| `design.md` | Удалены дубликаты: двойной `import express` и двойной error-middleware (повреждено ручной правкой) |
| `tasks.md` | Заменён verbose-формат на короткий чек-лист с чекбоксами, HTTP-сценарии используют созданные тестовые карточки |

### Клиент (`client/`)

Не изменён — ни один файл не затронут.

---

## Выполненные проверки

### TypeScript

```
./node_modules/.bin/tsc --noEmit
```
Результат: **PASS** — ноль ошибок компиляции.

### HTTP-сценарии

| # | Сценарий | Статус |
|---|---|---|
| 1 | Создание карточки POST → 201, получение ID | **PASS** |
| 2 | Удаление созданной карточки DELETE /cards/:id → 204, пустое тело | **PASS** |
| 3 | GET после удаления — карточка отсутствует | **PASS** |
| 4 | Остальные карточки (id "1", "2", "3") сохранены без изменений | **PASS** |
| 5 | Повторное удаление → 404 JSON (`{"error":"Карточка не найдена"}`) | **PASS** |
| 6 | Удаление по неизвестному ID → 404 JSON | **PASS** |
| 7 | Конкурирующие ID: path-id удалён, query/body-id сохранён | **PASS** |
| 8 | GET /нет-такого-пути → 404 JSON, Content-Type: application/json | **PASS** |
| 9 | POST /нет-такого-пути → 404 JSON | **PASS** |
| 10 | DELETE /cards без ID → 404 JSON | **PASS** |
| 11 | Временный маршрут → 500 JSON, Content-Type: application/json | **PASS** |
| 12 | GET /cards работает после 500 | **PASS** |
| 13 | Сервер не падает после 404 | **PASS** |

---

## Невыполненные проверки

| # | Проверка | Причина |
|---|---|---|
| 1 | Интерфейсная проверка: кнопка ✕ → карточка исчезает → F5 → не возвращается | Зависит от подключения клиентской части KAN-2 (ветка `feature/delete-card`, PR #6). Не проверялась через curl |

---

## Коммиты в ветке `feature/delete-card-api`

1. `aab6b68` — docs: fix design.md duplicates and shorten tasks.md
2. `bf77c87` — feat(server): fix delete-card API — DELETE /cards/:id with 204/404 JSON
