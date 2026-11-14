import { createCard, deleteCard, getAllCards } from "../services/cards.service.ts";
import type { Request, Response } from "express";

export function get(req: Request, res: Response) {
    const ourCards = getAllCards();
    
    res.json(ourCards);
}

export function post(req: Request, res: Response) {
    const title = req.body.title;
    const newCard = createCard(title);

    res.status(201).json(newCard);
}

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