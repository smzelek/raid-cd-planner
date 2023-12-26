import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { ApiErrorResponse, ApiSuccessResponse } from '../types';
import { logFunction } from '../utils';
import { raidtimers } from './controllers/raidtimers.controller';

const PORT = process.env.PORT || 8000;

const app = express();
app.use(cors());
app.use(express.json())
app.use(raidtimers);

function wrapResponseMiddleware(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    const newSend = function (this: any, data: any) {
        logFunction(wrapResponseMiddleware, 'wrapping json middleware')
        const formattedResponse: ApiSuccessResponse<any> = {
            status: res.statusCode,
            body: data
        };
        return originalSend.call(this, formattedResponse);
    }
    res.send = newSend;

    next();
}
app.use(wrapResponseMiddleware);

const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction): void => {
    logFunction(errorMiddleware, { err: error.toString(), stack: error.stack });
    const internalServerError: ApiErrorResponse = {
        error: "Internal Server Error",
        status: 500,
    };
    res.status(internalServerError.status).send(internalServerError);
};
app.use(errorMiddleware);

const startServer = () => {
    logFunction(startServer, `⚡️[server]: Server is running at http://localhost:${PORT}`);
};
app.listen(PORT, startServer);

