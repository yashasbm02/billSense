import { BillSplit, ItemAssignment, BillItem, BillParticipant, SplitCalculation } from '../types/bill.types';
import pool from '../database/connection';

export class CalculationService {
  static async calculateSplits(
    billId: number,
    includeTax: boolean = true,
    includeTip: boolean = true
  ): Promise<SplitCalculation[]> {
    try {
      // Get bill details
      const billQuery = `
        SELECT * FROM bills WHERE id = $1
      `;
      const billResult = await pool.query(billQuery, [billId]);
      const bill = billResult.rows[0];

      if (!bill) {
        throw new Error('Bill not found');
      }

      // Get all items for the bill
      const itemsQuery = `
        SELECT * FROM bill_items WHERE bill_id = $1
      `;
      const itemsResult = await pool.query(itemsQuery, [billId]);
      const items: BillItem[] = itemsResult.rows;

      // Get all participants
      const participantsQuery = `
        SELECT * FROM bill_participants WHERE bill_id = $1
      `;
      const participantsResult = await pool.query(participantsQuery, [billId]);
      const participants: BillParticipant[] = participantsResult.rows;

      // Get all assignments
      const assignmentsQuery = `
        SELECT ia.*, bi.name as item_name, bi.price, bi.quantity
        FROM item_assignments ia
        JOIN bill_items bi ON ia.bill_item_id = bi.id
        WHERE bi.bill_id = $1
      `;
      const assignmentsResult = await pool.query(assignmentsQuery, [billId]);
      const assignments = assignmentsResult.rows;

      // Calculate splits for each participant
      const splits: SplitCalculation[] = [];

      for (const participant of participants) {
        // Get assignments for this participant
        const participantAssignments = assignments.filter(
          a => a.participant_id === participant.id
        );

        // Calculate items total for this participant
        let itemsTotal = 0;
        const assignedItems: string[] = [];

        for (const assignment of participantAssignments) {
          const itemTotal = assignment.price * assignment.quantity;
          const participantShare = (assignment.share_percentage / 100) * itemTotal;
          itemsTotal += participantShare;
          assignedItems.push(assignment.item_name);
        }

        // Calculate tax and tip shares proportionally
        const totalItemsAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const participantRatio = totalItemsAmount > 0 ? itemsTotal / totalItemsAmount : 0;

        const taxShare = includeTax ? bill.tax_amount * participantRatio : 0;
        const tipShare = includeTip ? bill.tip_amount * participantRatio : 0;

        const finalAmount = itemsTotal + taxShare + tipShare;

        splits.push({
          participantId: participant.id,
          participantName: participant.name,
          itemsTotal: Math.round(itemsTotal * 100) / 100,
          taxShare: Math.round(taxShare * 100) / 100,
          tipShare: Math.round(tipShare * 100) / 100,
          finalAmount: Math.round(finalAmount * 100) / 100,
          assignedItems
        });
      }

      // Handle rounding errors by adjusting the largest split
      const totalCalculated = splits.reduce((sum, split) => sum + split.finalAmount, 0);
      const expectedTotal = bill.total_amount;
      const difference = Math.round((expectedTotal - totalCalculated) * 100) / 100;

      if (Math.abs(difference) > 0.01) {
        // Find the participant with the largest amount and adjust
        const largestSplit = splits.reduce((max, split) => 
          split.finalAmount > max.finalAmount ? split : max
        );
        largestSplit.finalAmount += difference;
        largestSplit.finalAmount = Math.round(largestSplit.finalAmount * 100) / 100;
      }

      return splits;
    } catch (error) {
      console.error('Error calculating splits:', error);
      throw new Error('Failed to calculate bill splits');
    }
  }

  static async saveSplits(billId: number, splits: SplitCalculation[]): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Delete existing splits
      await client.query('DELETE FROM bill_splits WHERE bill_id = $1', [billId]);

      // Insert new splits
      for (const split of splits) {
        await client.query(`
          INSERT INTO bill_splits (bill_id, participant_id, amount_owed, items_share, tax_share, tip_share)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          billId,
          split.participantId,
          split.finalAmount,
          split.itemsTotal,
          split.taxShare,
          split.tipShare
        ]);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
