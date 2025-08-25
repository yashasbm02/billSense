import { Request, Response } from 'express';
import pool from '../database/connection';
import { CreateAssignmentRequest } from '../types/bill.types';
import { CalculationService } from '../services/calculationService';

export class AssignmentsController {
  static async createAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { bill_item_id, participant_id, share_percentage }: CreateAssignmentRequest = req.body;

      const query = `
        INSERT INTO item_assignments (bill_item_id, participant_id, share_percentage)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const result = await pool.query(query, [
        bill_item_id,
        participant_id,
        share_percentage || 100
      ]);

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create assignment'
      });
    }
  }

  static async getBillAssignments(req: Request, res: Response): Promise<void> {
    try {
      const { billId } = req.params;

      const query = `
        SELECT ia.*, bi.name as item_name, bi.price, bi.quantity,
               bp.name as participant_name
        FROM item_assignments ia
        JOIN bill_items bi ON ia.bill_item_id = bi.id
        JOIN bill_participants bp ON ia.participant_id = bp.id
        WHERE bi.bill_id = $1
        ORDER BY bi.id, bp.id
      `;

      const result = await pool.query(query, [billId]);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assignments'
      });
    }
  }

  static async updateAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { share_percentage } = req.body;

      const query = `
        UPDATE item_assignments 
        SET share_percentage = $1
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [share_percentage, id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
        return;
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update assignment'
      });
    }
  }

  static async deleteAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const query = 'DELETE FROM item_assignments WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Assignment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete assignment'
      });
    }
  }

  static async calculateSplits(req: Request, res: Response): Promise<void> {
    try {
      const { billId } = req.params;
      const { include_tax = true, include_tip = true } = req.body;

      const splits = await CalculationService.calculateSplits(
        parseInt(billId),
        include_tax,
        include_tip
      );

      // Save the calculated splits
      await CalculationService.saveSplits(parseInt(billId), splits);

      res.json({
        success: true,
        data: splits
      });
    } catch (error) {
      console.error('Error calculating splits:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate splits'
      });
    }
  }

  static async getBillSplits(req: Request, res: Response): Promise<void> {
    try {
      const { billId } = req.params;

      const query = `
        SELECT bs.*, bp.name as participant_name
        FROM bill_splits bs
        JOIN bill_participants bp ON bs.participant_id = bp.id
        WHERE bs.bill_id = $1
        ORDER BY bs.amount_owed DESC
      `;

      const result = await pool.query(query, [billId]);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching splits:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch splits'
      });
    }
  }
}
