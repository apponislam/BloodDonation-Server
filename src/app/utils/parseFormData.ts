import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import ApiError from "../errors/ApiError";

export const parseFormDataJson = (fieldName: string = "data") => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.body[fieldName]) {
                const jsonData = JSON.parse(req.body[fieldName]);
                req.body = { ...req.body, ...jsonData };
                delete req.body[fieldName];
            }
            next();
        } catch (error) {
            const errorMessage = "Invalid JSON data format";
            const apiError = new ApiError(httpStatus.BAD_REQUEST, errorMessage);
            next(apiError);
        }
    };
};
