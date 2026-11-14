# Design: delete-card-api

## Обзор

Исправление серверной части удаления карточки в рамках архитектуры
`routes → controllers → services`. Четыре файла в `server/`, `client/`
не изменяется.

---

## 1. Изменения в четырёх файлах

### `server/routes/cards.router.ts`

**Было:**

```ts
cardsRouter.delete('/cards', remove);
```

**Стало:**

```ts
cardsRouter.delete('/cards/:id', remove);
```

Единственное изменение — добавление сегмента `:id` в путь.
Это единственный маршрут, который меняется в роутере.

---

### `server/controllers/cards.controller.ts`

**Функция `remove` полностью заменяется:**

**Было:**

```ts
export function remove(req: Request, res: Response) {
    const id = req.query.id?.toString();

    if (!id) {
        res.sendStatus(400);
        return;
    }

    const isDeleted = deleteCard(id);

    if (!isDeleted) {
        res.sendStatus(404);
    } else {
        res.sendStatus(204);
    }
}
```

**Стало:**

```ts
import type { Request, Response } from "express";

export function remove(
    req: Request<{ id: string }>,
    res: Response
) {
    const id = req.params.id;

    const isDeleted = deleteCard(id);

    if (!isDeleted) {
        res.status(404).json({ error: 'Карточка не найдена' });
        return;
    }

    res.status(204).end();
}
```

Изменения:
- `req.query.id` → `req.params.id` — чтение из пути
- `Request<{ id: string }>` — типизация параметра пути
- `res.sendStatus(400)` / `res.sendStatus(404)` →
  `res.status(404).json({ error: "..." })` —
  `sendStatus` отправляет текст (не HTML), но спецификация требует JSON
- `res.sendStatus(204)` → `res.status(204).end()` —
  явное завершение ответа без тела
- Удалена проверка `if (!id)` — `DELETE /cards` без `:id`
  не совпадает с маршрутом `DELETE /cards/:id` и попадает
  в общий 404-обработчик в `index.ts`

---

### `server/services/cards.service.ts`

**Функция `deleteCard` полностью заменяется:**

**Было:**

```ts
export function deleteCard(id: string) {
    const newCards = cards.filter(card => card.id !== id);
    cards = newCards;
    return newCards.length !== cards.length;
}
```

**Стало:**

```ts
export function deleteCard(id: string) {
    const before = cards.length;
    const newCards = cards.filter(card => card.id !== id);
    cards = newCards;
    return newCards.length !== before;
}
```

**Причина бага:** `filter` всегда создаёт новый массив.
После `cards = newCards` обе переменные `newCards` и `cards`
указывают на один и тот же объект. `newCards.length !== cards.length`
всегда `false`, даже если карточка была удалена. Фикс — сохранить
`before` до переназначения.

**Обработка неизвестного ID:** `filter` создаёт новый массив даже
при отсутствии совпадения — элементы те же, длина та же.
Возвращаемое булево значение различает успешное удаление
(`true`, длина уменьшилась) и отсутствие карточки (`false`, длина не изменилась).

---

### `server/index.ts`

**Было:**

```ts
import express from 'express';
import { cardsRouter } from './routes/cards.router.ts';
const app = express();

app.use(express.json());
app.use(cardsRouter);

app.listen(3001, () => {
    console.log('Сервер запущен: http://localhost:3001');
});
```

**Стало:**

```ts
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { cardsRouter } from './routes/cards.router.ts';
const app = express();

app.use(express.json());
app.use(cardsRouter);

// Общий обработчик 404 — после всех роутов
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: `Такого пути нет: ${req.method} ${req.url}` });
});

// Обработчик непредвиденных ошибок — 4 параметра
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Что-то сломалось на сервере' });
});

app.listen(3001, () => {
    console.log('Сервер запущен: http://localhost:3001');
});
```

Добавлены два middleware после `cardsRouter`.

---

## 2. Порядок регистрации middleware

```
express.json()          ← разбирает тело запроса (до роутов)
cardsRouter             ← GET /cards, POST /cards, DELETE /cards/:id
404-обработчик          ← ловит всё, что не совпало с роутами
error-обработчик (4×)   ← ловит ошибки, брошенные роутами выше
```

Критичные аспекты порядка:

1. `express.json()` — **до** роутов. Иначе `req.body` будет `undefined`
   в момент, когда `POST /cards` попытается его прочитать.
2. `cardsRouter` — **до** 404-обработчика. Иначе 404-обработчик
   перехватит все запросы, включая `GET /cards`.
3. 404-обработчик — **до** error-обработчика.
4. Error-обработчик — **после источников ошибок**. Express обходит
   обработчики в порядке регистрации; при ошибке обычные middleware
   пропускаются, и Express ищет error-handler среди зарегистрированных
   после места броска.

---

## 3. Типизация обработчика ошибок

```ts
import type { NextFunction, Request, Response } from "express";

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Что-то сломалось на сервере' });
});
```

Express отличает error-middleware от обычного middleware по **количеству
параметров**: ровно четыре. Три параметра — обычный middleware, он
никогда не сработает на ошибку.

Типизация с `import type` — без рантайм-затрат, совместимо с
`"type": "module"` и `allowImportingTsExtensions`.

---

## 4. Альтернативные варианты

### Альтернатива: обработка 404 внутри cardsRouter

```ts
cardsRouter.use((req, res) => {
    res.status(404).json({ error: `Такого пути нет: ${req.method} ${req.url}` });
});
```

**Почему отклонена:** `cardsRouter` подключён в `index.ts` без префикса,
поэтому `router.use()` внутри него тоже может перехватить `DELETE /cards`
без ID. Общий 404 в `index.ts` выбирается для размещения **после всех**
роутеров, включая будущие.

### Альтернатива: `res.sendStatus(204)` вместо `res.status(204).end()`

**Почему отклонена:** `sendStatus(204)` отправляет пустой ответ, но
`res.status(204).end()` — явная запись завершения ответа без тела,
что соответствует спецификации HTTP для 204 No Content.

### Альтернатива: исключение в сервисе при отсутствии карточки

```ts
export function deleteCard(id: string) {
    const idx = cards.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Карточка не найдена');
    cards.splice(idx, 1);
}
```

**Почему отклонена:** исключения в сервисе не запрещены архитектурой.
Для ожидаемого отсутствия карточки достаточно `false`; отдельный тип
ошибки и преобразование его в 404 здесь избыточны. Синхронное
исключение Express перехватывает самостоятельно, но для ожидаемого
сценария «карточка не найдена» булево значение проще и прозрачнее.

---

## 5. Проверка требований через HTTP

Все проверки выполняются через `curl` без изменения клиентского кода.
HTTP-проверки запланированы и будут выполнены после реализации.
Валидация OpenSpec не проверяет приложение.

### Удаление существующей карточки

```bash
# 1. Получить список карточек
curl -s http://localhost:3001/cards

# 2. Удалить карточку (подставить реальный ID из шага 1)
curl -s -o /dev/null -w "%{http_code}" -X DELETE 'http://localhost:3001/cards/1'
# Ожидаемый ответ: 204

# 3. Проверить, что карточка удалена
curl -s http://localhost:3001/cards
# Удалённая карточка отсутствует в ответе
```

### 404 JSON при удалении несуществующей карточки

```bash
curl -s -w '\n%{http_code}' -X DELETE 'http://localhost:3001/cards/nonexistent-id'
# Ожидаемый ответ: 404, тело: {"error":"Карточка не найдена"}
```

### Повторное удаление

```bash
# Создать карточку для теста (если все три уже удалены)
curl -s -X POST 'http://localhost:3001/cards' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Тестовая карточка","isDone":false,"isUrgent":false}'

# Первый DELETE → 204
curl -s -w '\n%{http_code}' -X DELETE 'http://localhost:3001/cards/<id>'
# Второй DELETE → 404 JSON
curl -s -w '\n%{http_code}' -X DELETE 'http://localhost:3001/cards/<id>'
# Сервер не упал, продолжает отвечать на GET /cards
```

### Конкурирующие ID из пути, query и тела

```bash
# path-id и other-id — разные существующие карточки
# DELETE /cards/<path-id>?id=<other-id> с телом {"id":"<other-id>"}
curl -s -w '\n%{http_code}' -X DELETE \
  'http://localhost:3001/cards/1?id=2' \
  -H 'Content-Type: application/json' \
  -d '{"id":"2"}'
# Ожидаемый ответ: 204, удалена карточка 1, карточка 2 сохранена
```

### Неизвестные маршруты — JSON вместо HTML

```bash
curl -s -w '\n%{http_code}' 'http://localhost:3001/нет-такого-пути'
# Ожидаемый ответ: 404, тело: {"error":"Такого пути нет: GET /нет-такого-пути"}

curl -s -w '\n%{http_code}' -X POST 'http://localhost:3001/нет-такого-пути'
# Ожидаемый ответ: 404, тело: {"error":"Такого пути нет: POST /нет-такого-пути"}

curl -s -w '\n%{http_code}' -X DELETE 'http://localhost:3001/cards'
# Ожидаемый ответ: 404, тело: {"error":"Такого пути нет: DELETE /cards"}
```

### Проверка тела ответов

```bash
# 204 — пустое тело
curl -s -w '\n%{http_code}' -X DELETE 'http://localhost:3001/cards/<id>'
# Проверить: после статуса тело пустое

# 404 — непустое поле error
curl -s -X DELETE 'http://localhost:3001/cards/nonexistent-id'
# Проверить: тело содержит {"error":"..."} с непустой строкой
```

### Сохранение остальных карточек

```bash
# Удалить одну карточку
curl -s -X DELETE 'http://localhost:3001/cards/1'

# Проверить, что остальные карточки содержат нужные данные
curl -s 'http://localhost:3001/cards'
# Проверить: в ответе присутствуют карточки с id "2" и "3",
# их title и isDone не изменились
```

### Срабатывание обработчика 500

Для проверки error-middleware нужно вызвать код, который бросает
неперехваченную ошибку. Временный маршрут размещается **ДО** общего
404 и error-handler, чтобы перехватить ошибку до них:

```bash
# 1. Временный маршрут — ДО app.use(cardsRouter) и ДО 404/error-handler:
# app.get('/__test-500', () => { throw new Error('test'); });

# 2. Перезапустить сервер (сохранение файла → node --watch перезапустит)

# 3. Проверить
curl -s -w '\n%{http_code}' 'http://localhost:3001/__test-500'
# Ожидаемый ответ: 500, тело: {"error":"Что-то сломалось на сервере"}

# 4. Удалить маршрут из index.ts

# 5. Перезапустить сервер (сохранение → перезапуск)

# 6. Убедиться, что маршрут больше не доступен
curl -s -w '\n%{http_code}' 'http://localhost:3001/__test-500'
# Ожидаемый ответ: 404 (перехвачен общим 404-обработчиком)

# 7. Убедиться, что маршрут отсутствует в итоговом коде
# grep '__test-500' server/index.ts — должен вернуть пустой результат

# Примечание: сохранение файлов перезапускает сервер и сбрасывает данные
# (все карточки восстанавливаются до начальных трёх).
```

---

## 6. Отложенная проверка через интерфейс

Клиентская кнопка удаления и функция `deleteCard` добавлены в PR #6
(ветка `feature/delete-card`), который ещё не слит в `main`.

Полная проверка через интерфейс (нажать кнопку ✕ → карточка исчезает
→ F5 → карточка не возвращается) откладывается до подключения клиента
KAN-2, возможно в отдельной временной ветке без переноса клиентских
изменений в ветку KAN-3.
