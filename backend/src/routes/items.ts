import { Router } from 'express';
import { ItemsController } from '../controllers/itemsController';

const router = Router();

// Items Management
router.get('/bills/:billId/items', ItemsController.getBillItems);
router.post('/bills/:billId/items', ItemsController.addBillItem);
router.post('/bills/:billId/items/bulk', ItemsController.bulkAddItems);
router.put('/:id', ItemsController.updateItem);
router.delete('/:id', ItemsController.deleteItem);

export default router;
