import type { NextFunction, Request, Response } from "express";

export function checkCard(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const title = req.body?.title;

    if (typeof title !== "string" || title.trim().length === 0) {
        res.status(400).json({
            error: "Название должно быть непустой строкой",
        });
        return;
    }

    req.body.title = title.trim();
    next();
}