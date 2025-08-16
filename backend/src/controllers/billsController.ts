import { Request, Response } from 'express';
import pool from '../database/connection';
import { CreateBillRequest, Bill } from '@billsense/shared';

export class BillsController {
  static async createBill(req: Request, res: Response): Promise<void> {
    try {
      const { name, total_amount, tax_amount, tip_amount, image_url, created_by }: CreateBillRequest = req.body;

      const query = `
        INSERT INTO bills (name, total_amount, tax_amount, tip_amount, image_url, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await pool.query(query, [
        name,
        total_amount,
        tax_amount || 0,
        tip_amount || 0,
        image_url,
        created_by
      ]);

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating bill:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create bill'
      });
    }
  }

  static async getBill(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get bill with all related data
      const billQuery = `
        SELECT b.*, u.name as creator_name
        FROM bills b
        LEFT JOIN users u ON b.created_by = u.id
        WHERE b.id = $1
      `;

      const itemsQuery = `
        SELECT * FROM bill_items WHERE bill_id = $1 ORDER BY id
      `;

      const participantsQuery = `
        SELECT * FROM bill_participants WHERE bill_id = $1 ORDER BY id
      `;

      const assignmentsQuery = `
        SELECT * FROM item_assignments WHERE bill_item_id IN (
          SELECT id FROM bill_items WHERE bill_id = $1
        )
      `;

      const splitsQuery = `
        SELECT * FROM bill_splits WHERE bill_id = $1
      `;

      const [billResult, itemsResult, participantsResult, assignmentsResult, splitsResult] = await Promise.all([
        pool.query(billQuery, [id]),
        pool.query(itemsQuery, [id]),
        pool.query(participantsQuery, [id]),
        pool.query(assignmentsQuery, [id]),
        pool.query(splitsQuery, [id])
      ]);

      if (billResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
        return;
      }

      const bill: Bill = {
        ...billResult.rows[0],
        items: itemsResult.rows,
        participants: participantsResult.rows,
        assignments: assignmentsResult.rows,
        splits: splitsResult.rows
      };

      res.json({
        success: true,
        data: bill
      });
    } catch (error) {
      console.error('Error fetching bill:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bill'
      });
    }
  }

  static async updateBill(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, total_amount, tax_amount, tip_amount } = req.body;

      const query = `
        UPDATE bills 
        SET name = $1, total_amount = $2, tax_amount = $3, tip_amount = $4
        WHERE id = $5
        RETURNING *
      `;

      const result = await pool.query(query, [
        name,
        total_amount,
        tax_amount,
        tip_amount,
        id
      ]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
        return;
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating bill:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update bill'
      });
    }
  }

  static async deleteBill(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const query = 'DELETE FROM bills WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Bill deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting bill:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete bill'
      });
    }
  }

  static async getAllBills(req: Request, res: Response): Promise<void> {
    try {
      const query = `
        SELECT b.*, u.name as creator_name
        FROM bills b
        LEFT JOIN users u ON b.created_by = u.id
        ORDER BY b.created_at DESC
      `;

      const result = await pool.query(query);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching bills:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bills'
      });
    }
  }
}
