## Tasks

- [x] 1. Проверить наличие React Query провайдеров в корне проекта

**Файлы:** `client/src/main.tsx` (или `client/src/main.ts`)

Убедиться, что `QueryClientProvider` обёрнут вокруг `<App>`, а `@tanstack/react-query` установлен в `package.json`. Если провайдер отсутствует — добавить обёртку.

**Проверка:** Приложение запускается без ошибок `React Query must be used inside QueryClientProvider`.

---

- [ ] 2. Сделать NewCardForm контролируемым

**Файлы:** `client/src/components/NewCardForm/NewCardForm.tsx`

- Добавить `import { useState } from "react"`.
- Создать состояние: `const [title, setTitle] = useState("")`.
- Привязать `value={title}` и `onChange={(e) => setTitle(e.target.value)}` к `<input>`.
- Заменить `type="button"` на `type="submit"` у `<button>`.
- Обернуть форму в `<form onSubmit={...}>` с `event.preventDefault()`.

**Проверка:** При вводе текста в поле оно отображает введённые символы. При очистке поля — значение сбрасывается.

---

- [ ] 3. Добавить валидацию и блокировку кнопки при пустом вводе

**Файлы:** `client/src/components/NewCardForm/NewCardForm.tsx`

- В обработчике `onSubmit` добавить проверку: `const trimmedTitle = title.trim(); if (!trimmedTitle) return;`.
- Добавить `disabled={isPending || !title.trim()}` на кнопку.
- Добавить `disabled={isPending}` на `<input>`, пока идёт запрос.

**Проверка:**
- Пустое поле — кнопка «Добавить» выглядит неактивной (полупрозрачная, курсор `not-allowed`).
- Введены только пробелы — кнопка остаётся неактивной.
- Введён текст — кнопка становится активной.

---

- [ ] 4. Подключить `useMutation` для создания карточки на сервере

**Файлы:** `client/src/components/NewCardForm/NewCardForm.tsx`

- Импортировать `useMutation`, `useQueryClient` из `@tanstack/react-query`.
- Импортировать `createCard` из `../../api/cards`.
- Создать мутацию: `const { mutate, isPending } = useMutation({ mutationFn: createCard, onSuccess: () => { setTitle(""); queryClient.invalidateQueries({ queryKey: ["cards"] }); } })`.
- В `onSubmit` вызывать `mutate(trimmedTitle)` вместо прямой отправки.

**Проверка:** После ввода названия и нажатия «Добавить» карточка отправляется на сервер (появляется в списке). Поле ввода очищается.

---

- [ ] 5. Подключить серверную загрузку карточек в App.tsx

**Файлы:** `client/src/App.tsx`

- Импортировать `useQuery` из `@tanstack/react-query`.
- Импортировать `fetchCards` из `./api/cards`.
- Заменить хардкод-массив на `const { data: cards = [], isLoading, isError } = useQuery({ queryKey: ["cards"], queryFn: fetchCards })`.
- Добавить состояния загрузки: `<p>Загрузка…</p>` и `<p>Не удалось загрузить.</p>`.

**Проверка:** При загрузке страницы карточки загружаются с сервера. После добавления новой карточки в форме — она сразу появляется на доске без перезагрузки.

---

- [ ] 6. Итоговая проверка всех сценариев

**Файлы:** нет изменений

**Проверка в браузере:**

| Сценарий | Действие | Ожидаемый результат |
|---|---|---|
| Пустое поле | Открыть доску, кнопка «Добавить» неактивна | Кнопка полупрозрачная, курсор `not-allowed` |
| Только пробелы | Ввести «   », попытаться нажать | Кнопка неактивна, карточка не создана |
| Обычное название | Ввести «Тест», нажать «Добавить» | Карточка появляется на доске, поле очищается |
| Обновление страницы | Перезагрузить страницу (`F5`) | Добавленные карточки сохраняются (загружаются с сервера) |
