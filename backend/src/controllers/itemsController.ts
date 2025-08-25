import { Request, Response } from 'express';
import pool from '../database/connection';
import { CreateBillItemRequest } from '../types/bill.types';

export class ItemsController {
  static async getBillItems(req: Request, res: Response): Promise<void> {
    try {
      const { billId } = req.params;

      const query = `
        SELECT bi.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', ia.id,
                     'participant_id', ia.participant_id,
                     'participant_name', bp.name,
                     'share_percentage', ia.share_percentage
                   )
                 ) FILTER (WHERE ia.id IS NOT NULL), 
                 '[]'::json
               ) as assignments
        FROM bill_items bi
        LEFT JOIN item_assignments ia ON bi.id = ia.bill_item_id
        LEFT JOIN bill_participants bp ON ia.participant_id = bp.id
        WHERE bi.bill_id = $1
        GROUP BY bi.id
        ORDER BY bi.id
      `;

      const result = await pool.query(query, [billId]);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching bill items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bill items'
      });
    }
  }

  static async addBillItem(req: Request, res: Response): Promise<void> {
    try {
      const { billId } = req.params;
      const { name, price, quantity }: CreateBillItemRequest = req.body;

      const query = `
        INSERT INTO bill_items (bill_id, name, price, quantity)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const result = await pool.query(query, [
        billId,
        name,
        price,
        quantity || 1
      ]);

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error adding bill item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add bill item'
      });
    }
  }

  static async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, price, quantity } = req.body;

      const query = `
        UPDATE bill_items 
        SET name = $1, price = $2, quantity = $3
        WHERE id = $4
        RETURNING *
      `;

      const result = await pool.query(query, [name, price, quantity, id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Item not found'
        });
        return;
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update item'
      });
    }
  }

  static async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const query = 'DELETE FROM bill_items WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Item not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete item'
      });
    }
  }

  static async bulkAddItems(req: Request, res: Response): Promise<void> {
    const client = await pool.connect();
    
    try {
      const { billId } = req.params;
      const { items }: { items: CreateBillItemRequest[] } = req.body;

      await client.query('BEGIN');

      const insertedItems = [];
      
      for (const item of items) {
        const query = `
          INSERT INTO bill_items (bill_id, name, price, quantity)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        
        const result = await client.query(query, [
          billId,
          item.name,
          item.price,
          item.quantity || 1
        ]);
        
        insertedItems.push(result.rows[0]);
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: insertedItems
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error bulk adding items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add items'
      });
    } finally {
      client.release();
    }
  }
}
