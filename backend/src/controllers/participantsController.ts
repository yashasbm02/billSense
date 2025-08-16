import { Request, Response } from 'express';
import pool from '../database/connection';
import { CreateParticipantRequest } from '@billsense/shared';

export class ParticipantsController {
  static async getBillParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { billId } = req.params;

      const query = `
        SELECT bp.*, u.email
        FROM bill_participants bp
        LEFT JOIN users u ON bp.user_id = u.id
        WHERE bp.bill_id = $1
        ORDER BY bp.id
      `;

      const result = await pool.query(query, [billId]);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching participants:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch participants'
      });
    }
  }

  static async addParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { billId } = req.params;
      const { user_id, name }: CreateParticipantRequest = req.body;

      const query = `
        INSERT INTO bill_participants (bill_id, user_id, name)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const result = await pool.query(query, [billId, user_id, name]);

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error adding participant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add participant'
      });
    }
  }

  static async removeParticipant(req: Request, res: Response): Promise<void> {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;

      await client.query('BEGIN');

      // Check if participant has any assignments
      const assignmentsQuery = 'SELECT COUNT(*) FROM item_assignments WHERE participant_id = $1';
      const assignmentsResult = await client.query(assignmentsQuery, [id]);
      const assignmentCount = parseInt(assignmentsResult.rows[0].count);

      if (assignmentCount > 0) {
        res.status(400).json({
          success: false,
          message: 'Cannot remove participant with item assignments. Please reassign items first.'
        });
        return;
      }

      // Remove participant
      const deleteQuery = 'DELETE FROM bill_participants WHERE id = $1 RETURNING *';
      const result = await client.query(deleteQuery, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
        return;
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Participant removed successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error removing participant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove participant'
      });
    } finally {
      client.release();
    }
  }

  static async updateParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const query = `
        UPDATE bill_participants 
        SET name = $1
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [name, id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
        return;
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating participant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update participant'
      });
    }
  }
}
