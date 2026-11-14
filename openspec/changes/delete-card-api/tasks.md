# Tasks: delete-card-api

- [x] **1.** Исправить `deleteCard` в `server/services/cards.service.ts` — сравнение длин до переназначения `cards = newCards`.
- [x] **2.** Изменить маршрут в `server/routes/cards.router.ts` — `DELETE /cards/:id`.
- [x] **3.** Исправить контроллер в `server/controllers/cards.controller.ts` — `req.params.id`, `204` без тела, `404 JSON` при отсутствии карточки.
- [x] **4.** Добавить в `server/index.ts` общий 404 JSON и error-middleware 500 JSON (4 параметра) после роутов.
- [x] **5.** Проверить TypeScript (`tsc --noEmit`) и HTTP-сценарии (curl).
- [x] **6.** Удалить временный маршрут проверки 500 и проверить итоговый diff.
- [x] **7.** Убедиться, что `client/` не изменён.
- [x] **8.** Интерфейсная проверка с клиентской частью KAN-2 — выполнена пользователем вручную. Клиент KAN-2 (ветка `feature/delete-card`) подключён во временной интеграционной ветке `integration-test-delete-card` (worktree), сервер KAN-3 на порту 3001. Результат: карточка удаляется кнопкой ✕ и не возвращается после F5 без перезапуска сервера.
- [x] **9.** Создать `openspec/changes/delete-card-api/report.md` с фактическими результатами.

## HTTP-сценарии (из tasks.md п. 5)

Для тестов создаём карточку через POST и используем её реальный ID.

```bash
# Создать тестовую карточку
curl -s -X POST 'http://localhost:3001/cards' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Тестовая карточка","isDone":false,"isUrgent":false}'
# Запомнить ID из ответа

# Удалить тестовую карточку → 204
curl -s -w '\n%{http_code}' -X DELETE 'http://localhost:3001/cards/<test-id>'
# Ожидаемо: 204, пустое тело

# Повторное удаление → 404 JSON
curl -s -w '\n%{http_code}' -X DELETE 'http://localhost:3001/cards/<test-id>'
# Ожидаемо: 404, тело: {"error":"Карточка не найдена"}

# Удаление по неизвестному ID → 404 JSON
curl -s -w '\n%{http_code}' -X DELETE 'http://localhost:3001/cards/nonexistent-id'
# Ожидаемо: 404, тело: {"error":"Карточка не найдена"}

# Конкурирующие ID: path-id из пути, other-id в query и теле
curl -s -w '\n%{http_code}' -X DELETE \
  'http://localhost:3001/cards/1?id=2' \
  -H 'Content-Type: application/json' \
  -d '{"id":"2"}'
# Ожидаемо: 204, удалена карточка 1, карточка 2 сохранена

# Неизвестный маршрут GET → 404 JSON
curl -s -w '\n%{http_code}' 'http://localhost:3001/нет-такого-пути'
# Ожидаемо: 404, тело: {"error":"Такого пути нет: GET /нет-такого-пути"}

# Неизвестный маршрут POST → 404 JSON
curl -s -w '\n%{http_code}' -X POST 'http://localhost:3001/нет-такого-пути'
# Ожидаемо: 404, тело: {"error":"Такого пути нет: POST /нет-такого-пути"}

# DELETE /cards без ID → 404 JSON
curl -s -w '\n%{http_code}' -X DELETE 'http://localhost:3001/cards'
# Ожидаемо: 404, тело: {"error":"Такого пути нет: DELETE /cards"}

# Проверка Content-Type ответа 404
curl -s -D - -X DELETE 'http://localhost:3001/cards/nonexistent-id' | head -10
# Проверить: Content-Type: application/json; charset=utf-8
```
