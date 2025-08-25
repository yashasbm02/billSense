import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Edit2, Trash2, Share2 } from 'lucide-react';
import { Bill, BillItem, BillParticipant, ItemAssignment, SplitCalculation } from '../types/bill.types';
import ItemDisplay from '../components/ItemDisplay';
import ParticipantManager from '../components/ParticipantManager';
import SplitResults from '../components/SplitResults';
import { billsAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils';
import toast from 'react-hot-toast';

const BillDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [items, setItems] = useState<BillItem[]>([]);
  const [participants, setParticipants] = useState<BillParticipant[]>([]);
  const [assignments, setAssignments] = useState<ItemAssignment[]>([]);
  const [splits, setSplits] = useState<SplitCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<'items' | 'participants' | 'splits'>('items');

  useEffect(() => {
    if (id) {
      loadBillData();
    }
  }, [id]);

  const loadBillData = async () => {
    try {
      const response = await billsAPI.getBill(parseInt(id!));
      const billData = response.data;
      
      setBill(billData);
      setItems(billData.items || []);
      setParticipants(billData.participants || []);
      
      // Load assignments
      const assignmentsResponse = await billsAPI.getBillAssignments(parseInt(id!));
      setAssignments(assignmentsResponse.data || []);
      
      // Load existing splits
      try {
        const splitsResponse = await billsAPI.getBillSplits(parseInt(id!));
        setSplits(splitsResponse.data || []);
      } catch (error) {
        // No splits calculated yet
        setSplits([]);
      }
    } catch (error) {
      console.error('Failed to load bill:', error);
      toast.error('Failed to load bill details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleItemEdit = (item: BillItem) => {
    // For now, just show a toast. In a full implementation, you'd open an edit modal
    toast.success('Item editing would open here');
  };

  const handleItemDelete = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await billsAPI.deleteItem(itemId);
      await loadBillData();
      toast.success('Item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleAssignmentChange = async (itemId: number, participantId: number, percentage: number) => {
    try {
      if (percentage === 0) {
        // Remove assignment
        const assignment = assignments.find(a => a.bill_item_id === itemId && a.participant_id === participantId);
        if (assignment) {
          await billsAPI.deleteAssignment(assignment.id);
        }
      } else {
        // Create or update assignment
        const existingAssignment = assignments.find(a => a.bill_item_id === itemId && a.participant_id === participantId);
        
        if (existingAssignment) {
          await billsAPI.updateAssignment(existingAssignment.id, { share_percentage: percentage });
        } else {
          await billsAPI.createAssignment({
            bill_item_id: itemId,
            participant_id: participantId,
            share_percentage: percentage,
          });
        }
      }
      
      await loadBillData();
    } catch (error) {
      toast.error('Failed to update assignment');
    }
  };

  const handleAddParticipant = async (participant: { name: string }) => {
    try {
      await billsAPI.addParticipant(parseInt(id!), participant);
      await loadBillData();
      toast.success('Participant added successfully');
    } catch (error) {
      toast.error('Failed to add participant');
    }
  };

  const handleRemoveParticipant = async (participantId: number) => {
    try {
      await billsAPI.removeParticipant(participantId);
      await loadBillData();
      toast.success('Participant removed successfully');
    } catch (error) {
      toast.error('Failed to remove participant');
    }
  };

  const handleCalculateSplits = async () => {
    setCalculating(true);
    
    try {
      const response = await billsAPI.calculateSplits(parseInt(id!), true, true);
      setSplits(response.data || []);
      setActiveTab('splits');
      toast.success('Splits calculated successfully');
    } catch (error) {
      toast.error('Failed to calculate splits');
    } finally {
      setCalculating(false);
    }
  };

  const handleDeleteBill = async () => {
    if (!window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      return;
    }

    try {
      await billsAPI.deleteBill(parseInt(id!));
      toast.success('Bill deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete bill');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Bill not found</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const hasAssignments = assignments.length > 0;
  const canCalculateSplits = hasAssignments && participants.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{bill.name}</h1>
                <p className="text-sm text-gray-500">
                  Created {formatDate(bill.created_at)} • {formatCurrency(bill.total_amount)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCalculateSplits}
                disabled={!canCalculateSplits || calculating}
                className="btn-primary"
              >
                {calculating ? (
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                ) : (
                  <Calculator className="h-4 w-4 mr-2" />
                )}
                Calculate Split
              </button>
              
              <button
                onClick={handleDeleteBill}
                className="btn-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bill Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(bill.total_amount)}</p>
              <p className="text-sm text-gray-600">Total Amount</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              <p className="text-sm text-gray-600">Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{participants.length}</p>
              <p className="text-sm text-gray-600">Participants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {splits.length > 0 ? formatCurrency(splits.reduce((sum, s) => sum + s.finalAmount, 0) / splits.length) : '$0.00'}
              </p>
              <p className="text-sm text-gray-600">Avg. Split</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'items', label: 'Items', count: items.length },
                { key: 'participants', label: 'Participants', count: participants.length },
                { key: 'splits', label: 'Split Results', count: splits.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'items' && (
              <ItemDisplay
                items={items}
                assignments={assignments}
                participants={participants}
                onItemEdit={handleItemEdit}
                onItemDelete={handleItemDelete}
                onAssignmentChange={handleAssignmentChange}
              />
            )}

            {activeTab === 'participants' && (
              <ParticipantManager
                participants={participants}
                onAddParticipant={handleAddParticipant}
                onRemoveParticipant={handleRemoveParticipant}
              />
            )}

            {activeTab === 'splits' && (
              <SplitResults
                splits={splits}
                bill={bill}
                onRecalculate={handleCalculateSplits}
              />
            )}
          </div>
        </div>

        {/* Action Hints */}
        {!hasAssignments && items.length > 0 && participants.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Ready to assign items</p>
                <p className="text-sm text-blue-700">
                  Click on items in the Items tab to assign them to participants, then calculate the split.
                </p>
              </div>
            </div>
          </div>
        )}

        {participants.length === 0 && (
          <div className="mt-6 bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-warning-600" />
              <div>
                <p className="font-medium text-warning-800">Add participants</p>
                <p className="text-sm text-warning-700">
                  Add people to this bill in the Participants tab before you can assign items and calculate splits.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BillDetails;
