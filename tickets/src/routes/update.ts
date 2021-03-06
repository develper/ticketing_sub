import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  requireAuth,
  NotFoundError,
  NotAuthorizedError
} from '@bkticketing/common';

import { Ticket } from '../models/ticket';
import mongoose from 'mongoose';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('title is required'),
    body('price').isFloat({ gt: 0 })
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticketId = req.params.id;

    if (!mongoose.isValidObjectId(ticketId)) {
      throw new NotFoundError();
    }
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId != req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price
    });

    await ticket.save();

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
