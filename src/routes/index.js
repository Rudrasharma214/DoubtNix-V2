import express from 'express';
import authRouter from './auth.routes';

const routes = express.Router();

routes.use('/auth', authRouter);

export default routes;