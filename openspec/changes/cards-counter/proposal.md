## Why

Пользователь канбан-доски не видит, сколько карточек содержится на доске. Это затрудняет быструю оценку объёма задач и прогресса. Счётчик рядом с заголовком даёт мгновенную визуальную обратную связь без необходимости открывать колонку.

## What Changes

- Рядом с названием «Канбан-доска» в шапке приложения отображается число карточек на доске, например: «Канбан-доска (4)».

## Capabilities

### New Capabilities
- `board-header-counter`: отображение счётчика карточек в заголовке доски.

### Modified Capabilities
<!-- Нет изменяемых существующих спецификаций. -->

## Impact

- `client/src/components/BoardHeader/BoardHeader.tsx` — добавить prop `cardCount: number` и отобразить его.
- `client/src/components/BoardHeader/BoardHeader.module.css` — возможно добавить стили для бейджа/счётчика.
- `client/src/App.tsx` — передать `cards.length` в `BoardHeader`.
