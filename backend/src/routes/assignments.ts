import { Router } from 'express';
import { AssignmentsController } from '../controllers/assignmentsController';

const router = Router();

// Item Assignments
router.post('/', AssignmentsController.createAssignment);
router.get('/bills/:billId/assignments', AssignmentsController.getBillAssignments);
router.put('/:id', AssignmentsController.updateAssignment);
router.delete('/:id', AssignmentsController.deleteAssignment);

// Split Calculations
router.post('/bills/:billId/calculate', AssignmentsController.calculateSplits);
router.get('/bills/:billId/splits', AssignmentsController.getBillSplits);

export default router;
