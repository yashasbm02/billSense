import React, { useState } from 'react';
import { Calculator, Share2, Download, Copy, Check } from 'lucide-react';
import { SplitCalculation, Bill } from '../types/bill.types';
import { formatCurrency, cn, getInitials, getRandomColor } from '../utils';
import toast from 'react-hot-toast';

interface SplitResultsProps {
  splits: SplitCalculation[];
  bill: Bill;
  onRecalculate?: () => void;
}

const SplitResults: React.FC<SplitResultsProps> = ({ splits, bill, onRecalculate }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const totalSplit = splits.reduce((sum, split) => sum + split.finalAmount, 0);
  const hasDiscrepancy = Math.abs(totalSplit - bill.total_amount) > 0.01;

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const generateSummaryText = () => {
    let summary = `Bill Split Summary - ${bill.name}\n`;
    summary += `Total: ${formatCurrency(bill.total_amount)}\n\n`;
    
    splits.forEach((split) => {
      summary += `${split.participantName}: ${formatCurrency(split.finalAmount)}\n`;
      if (split.assignedItems.length > 0) {
        summary += `  Items: ${split.assignedItems.join(', ')}\n`;
      }
      summary += `  Subtotal: ${formatCurrency(split.itemsTotal)}`;
      if (split.taxShare > 0) summary += ` | Tax: ${formatCurrency(split.taxShare)}`;
      if (split.tipShare > 0) summary += ` | Tip: ${formatCurrency(split.tipShare)}`;
      summary += '\n\n';
    });

    return summary;
  };

  const generateIndividualSummary = (split: SplitCalculation) => {
    let summary = `Your share for ${bill.name}:\n`;
    summary += `Total: ${formatCurrency(split.finalAmount)}\n\n`;
    summary += `Breakdown:\n`;
    summary += `Items: ${formatCurrency(split.itemsTotal)}\n`;
    if (split.taxShare > 0) summary += `Tax: ${formatCurrency(split.taxShare)}\n`;
    if (split.tipShare > 0) summary += `Tip: ${formatCurrency(split.tipShare)}\n`;
    
    if (split.assignedItems.length > 0) {
      summary += `\nYour items:\n${split.assignedItems.map(item => `• ${item}`).join('\n')}`;
    }

    return summary;
  };

  if (splits.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">No splits calculated yet</p>
        <p className="text-sm">Assign items to participants and calculate the split</p>
        {onRecalculate && (
          <button onClick={onRecalculate} className="btn-primary mt-4">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Split
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Split Results</h3>
          <p className="text-sm text-gray-500 mt-1">
            Total: {formatCurrency(totalSplit)} of {formatCurrency(bill.total_amount)}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => copyToClipboard(generateSummaryText(), -1)}
            className="btn-outline text-sm"
          >
            {copiedIndex === -1 ? (
              <Check className="h-4 w-4 mr-1 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            Copy All
          </button>
          
          {onRecalculate && (
            <button onClick={onRecalculate} className="btn-primary text-sm">
              <Calculator className="h-4 w-4 mr-1" />
              Recalculate
            </button>
          )}
        </div>
      </div>

      {/* Discrepancy Warning */}
      {hasDiscrepancy && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-warning-600" />
            <div>
              <p className="font-medium text-warning-800">Amount Discrepancy</p>
              <p className="text-sm text-warning-700">
                Split total ({formatCurrency(totalSplit)}) doesn't match bill total ({formatCurrency(bill.total_amount)}).
                This may be due to rounding or unassigned items.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Split Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {splits
          .sort((a, b) => b.finalAmount - a.finalAmount)
          .map((split, index) => (
            <div key={split.participantId} className="card hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Participant Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn("participant-avatar", getRandomColor())}>
                      {getInitials(split.participantName)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{split.participantName}</p>
                      <p className="text-sm text-gray-500">
                        {split.assignedItems.length} item{split.assignedItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(generateIndividualSummary(split), index)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy individual summary"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Amount */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(split.finalAmount)}
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{formatCurrency(split.itemsTotal)}</span>
                  </div>
                  
                  {split.taxShare > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">{formatCurrency(split.taxShare)}</span>
                    </div>
                  )}
                  
                  {split.tipShare > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tip:</span>
                      <span className="font-medium">{formatCurrency(split.tipShare)}</span>
                    </div>
                  )}
                </div>

                {/* Assigned Items */}
                {split.assignedItems.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Assigned Items:</p>
                    <div className="space-y-1">
                      {split.assignedItems.slice(0, 3).map((item, i) => (
                        <p key={i} className="text-xs text-gray-600 truncate">
                          • {item}
                        </p>
                      ))}
                      {split.assignedItems.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{split.assignedItems.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Participants</p>
            <p className="text-lg font-semibold text-gray-900">{splits.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Split</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(totalSplit / splits.length)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Highest Amount</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(Math.max(...splits.map(s => s.finalAmount)))}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Lowest Amount</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(Math.min(...splits.map(s => s.finalAmount)))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitResults;
