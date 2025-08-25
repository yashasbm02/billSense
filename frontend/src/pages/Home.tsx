import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Receipt, Users, Calculator, Clock, ArrowRight } from 'lucide-react';
import { Bill } from '../types/bill.types';
import { billsAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const response = await billsAPI.getAllBills();
      setBills(response.data || []);
    } catch (error) {
      console.error('Failed to load bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const recentBills = bills.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 rounded-lg p-2">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">BillSense</h1>
            </div>
            
            <Link to="/bills/new" className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Bill
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Split Bills with Ease
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Scan receipts, assign items to people, and calculate fair splits automatically. 
            No more manual calculations or awkward money conversations.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link to="/bills/new" className="btn-primary text-lg px-8 py-3">
              <Receipt className="h-5 w-5 mr-2" />
              Scan Receipt
            </Link>
            <Link to="/bills/new?manual=true" className="btn-outline text-lg px-8 py-3">
              <Plus className="h-5 w-5 mr-2" />
              Manual Entry
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Receipt className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">OCR Scanning</h3>
            <p className="text-gray-600">
              Upload receipt images and automatically extract items, prices, and totals using advanced OCR technology.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-success-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Assignment</h3>
            <p className="text-gray-600">
              Easily assign items to different people with intuitive drag-and-drop interface and partial sharing options.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-warning-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calculator className="h-8 w-8 text-warning-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fair Calculation</h3>
            <p className="text-gray-600">
              Automatically calculate splits including proportional tax and tip distribution for perfectly fair results.
            </p>
          </div>
        </div>

        {/* Recent Bills */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Bills</h3>
              {bills.length > 5 && (
                <Link to="/bills" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading bills...</p>
            </div>
          ) : recentBills.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentBills.map((bill) => (
                <Link
                  key={bill.id}
                  to={`/bills/${bill.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary-100 rounded-lg p-2">
                          <Receipt className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate">
                            {bill.name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(bill.created_at)}
                            </span>
                            <span>{formatCurrency(bill.total_amount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bills yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first bill to get started with splitting expenses.
              </p>
              <Link to="/bills/new" className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create First Bill
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        {bills.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center border">
              <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
              <p className="text-sm text-gray-600">Total Bills</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(bills.reduce((sum, bill) => sum + bill.total_amount, 0))}
              </p>
              <p className="text-sm text-gray-600">Total Amount</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(bills.reduce((sum, bill) => sum + bill.total_amount, 0) / bills.length)}
              </p>
              <p className="text-sm text-gray-600">Average Bill</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border">
              <p className="text-2xl font-bold text-gray-900">
                {bills.filter(bill => new Date(bill.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm text-gray-600">This Month</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
