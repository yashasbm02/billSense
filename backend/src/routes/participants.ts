import { Router } from 'express';
import { ParticipantsController } from '../controllers/participantsController';

const router = Router();

// Participants Management
router.get('/bills/:billId/participants', ParticipantsController.getBillParticipants);
router.post('/bills/:billId/participants', ParticipantsController.addParticipant);
router.put('/:id', ParticipantsController.updateParticipant);
router.delete('/:id', ParticipantsController.removeParticipant);

export default router;
