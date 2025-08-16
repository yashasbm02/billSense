import React, { useState } from 'react';
import { Edit2, Trash2, Users, DollarSign } from 'lucide-react';
import { BillItem, BillParticipant, ItemAssignment } from '@billsense/shared';
import { formatCurrency, cn, getInitials, getRandomColor } from '../utils';

interface ItemDisplayProps {
  items: BillItem[];
  assignments: ItemAssignment[];
  participants: BillParticipant[];
  onItemEdit: (item: BillItem) => void;
  onItemDelete: (itemId: number) => void;
  onAssignmentChange: (itemId: number, participantId: number, percentage: number) => void;
}

const ItemDisplay: React.FC<ItemDisplayProps> = ({
  items,
  assignments,
  participants,
  onItemEdit,
  onItemDelete,
  onAssignmentChange,
}) => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const getItemAssignments = (itemId: number) => {
    return assignments.filter(a => a.bill_item_id === itemId);
  };

  const getAssignedParticipants = (itemId: number) => {
    const itemAssignments = getItemAssignments(itemId);
    return itemAssignments.map(assignment => {
      const participant = participants.find(p => p.id === assignment.participant_id);
      return {
        ...participant,
        percentage: assignment.share_percentage,
        assignmentId: assignment.id
      };
    }).filter(Boolean);
  };

  const isItemFullyAssigned = (itemId: number) => {
    const itemAssignments = getItemAssignments(itemId);
    const totalPercentage = itemAssignments.reduce((sum, a) => sum + a.share_percentage, 0);
    return totalPercentage >= 100;
  };

  const handleAssignParticipant = (itemId: number, participantId: number) => {
    const existingAssignment = assignments.find(
      a => a.bill_item_id === itemId && a.participant_id === participantId
    );

    if (existingAssignment) {
      // Remove assignment
      onAssignmentChange(itemId, participantId, 0);
    } else {
      // Add assignment with 100% by default
      onAssignmentChange(itemId, participantId, 100);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Bill Items</h3>
        <div className="text-sm text-gray-500">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const assignedParticipants = getAssignedParticipants(item.id);
          const isFullyAssigned = isItemFullyAssigned(item.id);
          const totalAmount = item.price * item.quantity;

          return (
            <div
              key={item.id}
              className={cn(
                "card cursor-pointer transition-all hover:shadow-md",
                isFullyAssigned ? "item-assigned" : "item-unassigned",
                selectedItem === item.id && "ring-2 ring-primary-500"
              )}
              onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
            >
              <div className="space-y-3">
                {/* Item Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <span>{formatCurrency(item.price)}</span>
                      {item.quantity > 1 && (
                        <>
                          <span>×</span>
                          <span>{item.quantity}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemEdit(item);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemDelete(item.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-lg font-semibold text-gray-900">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  
                  <div className={cn(
                    "badge",
                    isFullyAssigned ? "badge-success" : "badge-warning"
                  )}>
                    {isFullyAssigned ? "Assigned" : "Unassigned"}
                  </div>
                </div>

                {/* Assigned Participants */}
                {assignedParticipants.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>Assigned to:</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {assignedParticipants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1 text-xs"
                        >
                          <div className={cn("participant-avatar h-4 w-4 text-xs", getRandomColor())}>
                            {getInitials(participant.name)}
                          </div>
                          <span className="font-medium">{participant.name}</span>
                          {participant.percentage < 100 && (
                            <span className="text-gray-500">({participant.percentage}%)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignment Controls */}
                {selectedItem === item.id && (
                  <div className="border-t pt-3 space-y-2 animate-slide-up">
                    <div className="text-xs font-medium text-gray-700">
                      Assign to participants:
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {participants.map((participant) => {
                        const isAssigned = assignedParticipants.some(ap => ap.id === participant.id);
                        
                        return (
                          <button
                            key={participant.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignParticipant(item.id, participant.id);
                            }}
                            className={cn(
                              "flex items-center space-x-2 p-2 rounded-lg text-xs transition-colors",
                              isAssigned
                                ? "bg-primary-100 text-primary-800 border border-primary-200"
                                : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                            )}
                          >
                            <div className={cn(
                              "participant-avatar h-5 w-5 text-xs",
                              isAssigned ? "bg-primary-600" : getRandomColor()
                            )}>
                              {getInitials(participant.name)}
                            </div>
                            <span className="truncate">{participant.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No items yet</p>
          <p className="text-sm">Scan a receipt or add items manually to get started</p>
        </div>
      )}
    </div>
  );
};

export default ItemDisplay;
