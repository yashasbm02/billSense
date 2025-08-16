import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Edit2 } from 'lucide-react';
import { BillScanResult, CreateBillItemRequest } from '@billsense/shared';
import BillScanner from '../components/BillScanner';
import ParticipantManager from '../components/ParticipantManager';
import { billsAPI } from '../services/api';
import { formatCurrency, validatePrice } from '../utils';
import toast from 'react-hot-toast';

const NewBill: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isManual = searchParams.get('manual') === 'true';

  const [step, setStep] = useState<'scan' | 'review' | 'participants'>(isManual ? 'review' : 'scan');
  const [billData, setBillData] = useState({
    name: '',
    total_amount: 0,
    tax_amount: 0,
    tip_amount: 0,
    items: [] as CreateBillItemRequest[],
  });
  const [participants, setParticipants] = useState([{ name: 'Me' }]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', quantity: '1' });
  const [saving, setSaving] = useState(false);

  const handleScanComplete = (result: BillScanResult) => {
    setBillData({
      name: `Receipt - ${new Date().toLocaleDateString()}`,
      total_amount: result.total,
      tax_amount: result.tax,
      tip_amount: result.tip || 0,
      items: result.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
    setStep('review');
    toast.success('Receipt scanned successfully!');
  };

  const handleScanError = (error: string) => {
    toast.error(error);
  };

  const handleAddItem = () => {
    if (!newItem.name.trim() || !validatePrice(newItem.price)) {
      toast.error('Please enter valid item details');
      return;
    }

    const item: CreateBillItemRequest = {
      name: newItem.name.trim(),
      price: parseFloat(newItem.price),
      quantity: parseInt(newItem.quantity) || 1,
    };

    setBillData(prev => ({
      ...prev,
      items: [...prev.items, item],
      total_amount: prev.total_amount + (item.price * item.quantity),
    }));

    setNewItem({ name: '', price: '', quantity: '1' });
    setIsEditing(false);
  };

  const handleEditItem = (index: number) => {
    const item = billData.items[index];
    setNewItem({
      name: item.name,
      price: item.price.toString(),
      quantity: item.quantity.toString(),
    });
    setEditingItem(index);
    setIsEditing(true);
  };

  const handleUpdateItem = () => {
    if (editingItem === null || !newItem.name.trim() || !validatePrice(newItem.price)) {
      toast.error('Please enter valid item details');
      return;
    }

    const oldItem = billData.items[editingItem];
    const updatedItem: CreateBillItemRequest = {
      name: newItem.name.trim(),
      price: parseFloat(newItem.price),
      quantity: parseInt(newItem.quantity) || 1,
    };

    const oldTotal = oldItem.price * oldItem.quantity;
    const newTotal = updatedItem.price * updatedItem.quantity;

    setBillData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === editingItem ? updatedItem : item),
      total_amount: prev.total_amount - oldTotal + newTotal,
    }));

    setNewItem({ name: '', price: '', quantity: '1' });
    setEditingItem(null);
    setIsEditing(false);
  };

  const handleDeleteItem = (index: number) => {
    const item = billData.items[index];
    const itemTotal = item.price * item.quantity;

    setBillData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
      total_amount: prev.total_amount - itemTotal,
    }));
  };

  const handleSaveBill = async () => {
    if (!billData.name.trim()) {
      toast.error('Please enter a bill name');
      return;
    }

    if (billData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (participants.length === 0) {
      toast.error('Please add at least one participant');
      return;
    }

    setSaving(true);

    try {
      // Create the bill
      const billResponse = await billsAPI.createBill({
        name: billData.name,
        total_amount: billData.total_amount,
        tax_amount: billData.tax_amount,
        tip_amount: billData.tip_amount,
        created_by: 1, // Mock user ID
      });

      const billId = billResponse.data.id;

      // Add items
      if (billData.items.length > 0) {
        await billsAPI.bulkAddItems(billId, billData.items);
      }

      // Add participants
      for (const participant of participants) {
        await billsAPI.addParticipant(billId, { name: participant.name });
      }

      toast.success('Bill created successfully!');
      navigate(`/bills/${billId}`);
    } catch (error) {
      console.error('Failed to create bill:', error);
      toast.error('Failed to create bill');
    } finally {
      setSaving(false);
    }
  };

  const subtotal = billData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Create New Bill</h1>
            </div>

            {step !== 'scan' && (
              <button
                onClick={handleSaveBill}
                disabled={saving || billData.items.length === 0}
                className="btn-primary"
              >
                {saving ? (
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Bill
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'scan' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'scan' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">
                {isManual ? 'Manual Entry' : 'Scan Receipt'}
              </span>
            </div>
            
            <div className="flex-1 h-px bg-gray-200"></div>
            
            <div className={`flex items-center space-x-2 ${step === 'review' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'review' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Review Items</span>
            </div>
            
            <div className="flex-1 h-px bg-gray-200"></div>
            
            <div className={`flex items-center space-x-2 ${step === 'participants' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'participants' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Add People</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 'scan' && (
          <div className="space-y-6">
            <BillScanner
              onScanComplete={handleScanComplete}
              onError={handleScanError}
            />
            
            <div className="text-center">
              <button
                onClick={() => setStep('review')}
                className="btn-outline"
              >
                Skip Scanning - Enter Manually
              </button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            {/* Bill Details */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium">Bill Details</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill Name
                  </label>
                  <input
                    type="text"
                    value={billData.name}
                    onChange={(e) => setBillData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter bill name"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={billData.tax_amount}
                      onChange={(e) => setBillData(prev => ({ 
                        ...prev, 
                        tax_amount: parseFloat(e.target.value) || 0 
                      }))}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tip Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={billData.tip_amount}
                      onChange={(e) => setBillData(prev => ({ 
                        ...prev, 
                        tip_amount: parseFloat(e.target.value) || 0 
                      }))}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount
                    </label>
                    <div className="text-lg font-semibold text-gray-900 py-2">
                      {formatCurrency(billData.total_amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Items</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Add/Edit Item Form */}
              {isEditing && (
                <div className="border-b pb-4 mb-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        className="input"
                        placeholder="Item name"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        value={newItem.price}
                        onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                        className="input"
                        placeholder="Price"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                        className="input"
                        placeholder="Qty"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditingItem(null);
                        setNewItem({ name: '', price: '', quantity: '1' });
                      }}
                      className="btn-outline text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingItem !== null ? handleUpdateItem : handleAddItem}
                      className="btn-primary text-sm"
                    >
                      {editingItem !== null ? 'Update' : 'Add'} Item
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                {billData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditItem(index)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {billData.items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No items added yet</p>
                </div>
              )}

              {/* Summary */}
              {billData.items.length > 0 && (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {billData.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>{formatCurrency(billData.tax_amount)}</span>
                    </div>
                  )}
                  {billData.tip_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tip:</span>
                      <span>{formatCurrency(billData.tip_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(billData.total_amount)}</span>
                  </div>
                </div>
              )}
            </div>

            {billData.items.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => setStep('participants')}
                  className="btn-primary"
                >
                  Continue to Participants
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'participants' && (
          <div className="space-y-6">
            <ParticipantManager
              participants={participants.map((p, i) => ({ id: i, bill_id: 0, name: p.name }))}
              onAddParticipant={(participant) => {
                setParticipants(prev => [...prev, { name: participant.name }]);
              }}
              onRemoveParticipant={(participantId) => {
                setParticipants(prev => prev.filter((_, i) => i !== participantId));
              }}
            />

            {participants.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={handleSaveBill}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? (
                    <div className="loading-spinner h-4 w-4 mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Create Bill
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default NewBill;
