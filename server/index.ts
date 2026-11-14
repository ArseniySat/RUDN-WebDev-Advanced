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