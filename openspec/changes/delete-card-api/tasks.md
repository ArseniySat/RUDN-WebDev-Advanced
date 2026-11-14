# Tasks: delete-card-api

- [ ] **1.** Исправить `deleteCard` в `server/services/cards.service.ts` — сравнение длин до переназначения `cards = newCards`.
- [ ] **2.** Изменить маршрут в `server/routes/cards.router.ts` — `DELETE /cards/:id`.
- [ ] **3.** Исправить контроллер в `server/controllers/cards.controller.ts` — `req.params.id`, `204` без тела, `404 JSON` при отсутствии карточки.
- [ ] **4.** Добавить в `server/index.ts` общий 404 JSON и error-middleware 500 JSON (4 параметра) после роутов.
- [ ] **5.** Проверить TypeScript (`tsc --noEmit`) и HTTP-сценарии (curl).
- [ ] **6.** Удалить временный маршрут проверки 500 и проверить итоговый diff.
- [ ] **7.** Убедиться, что `client/` не изменён.
- [ ] **8.** Отложенная проверка интерфейса с клиентской частью KAN-2 (зависит от подключения `feature/delete-card`).
- [ ] **9.** Создать `openspec/changes/delete-card-api/report.md` с фактическими результатами.

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
