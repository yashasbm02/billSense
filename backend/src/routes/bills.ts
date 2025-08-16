import { Router } from 'express';
import { BillsController } from '../controllers/billsController';

const router = Router();

// Bill Management
router.post('/', BillsController.createBill);
router.get('/', BillsController.getAllBills);
router.get('/:id', BillsController.getBill);
router.put('/:id', BillsController.updateBill);
router.delete('/:id', BillsController.deleteBill);

export default router;
