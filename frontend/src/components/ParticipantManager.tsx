import React, { useState } from 'react';
import { Plus, X, User, Mail } from 'lucide-react';
import { BillParticipant, CreateParticipantRequest } from '@billsense/shared';
import { cn, getInitials, getRandomColor } from '../utils';
import toast from 'react-hot-toast';

interface ParticipantManagerProps {
  participants: BillParticipant[];
  onAddParticipant: (participant: CreateParticipantRequest) => void;
  onRemoveParticipant: (participantId: number) => void;
}

const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  participants,
  onAddParticipant,
  onRemoveParticipant,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newParticipant.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    // Check for duplicate names
    const isDuplicate = participants.some(
      p => p.name.toLowerCase() === newParticipant.name.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.error('A participant with this name already exists');
      return;
    }

    onAddParticipant({
      name: newParticipant.name.trim(),
      user_id: undefined, // For now, we're not linking to users
    });

    setNewParticipant({ name: '', email: '' });
    setIsAdding(false);
    toast.success('Participant added successfully');
  };

  const handleRemove = (participant: BillParticipant) => {
    if (participants.length <= 1) {
      toast.error('You need at least one participant');
      return;
    }

    if (window.confirm(`Remove ${participant.name} from this bill?`)) {
      onRemoveParticipant(participant.id);
      toast.success('Participant removed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Participants</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary text-sm"
          disabled={isAdding}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Person
        </button>
      </div>

      {/* Add Participant Form */}
      {isAdding && (
        <div className="card animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Add New Participant</h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewParticipant({ name: '', email: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="participant-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="participant-name"
                    type="text"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                    className="input pl-10"
                    placeholder="Enter participant name"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label htmlFor="participant-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="participant-email"
                    type="email"
                    value={newParticipant.email}
                    onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                    className="input pl-10"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewParticipant({ name: '', email: '' });
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Participant
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Participants List */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {participants.map((participant, index) => (
          <div
            key={participant.id}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className={cn("participant-avatar", getRandomColor())}>
                {getInitials(participant.name)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {participant.name}
                </p>
                {participant.user_id && (
                  <p className="text-sm text-gray-500 truncate">
                    Registered user
                  </p>
                )}
              </div>

              <button
                onClick={() => handleRemove(participant)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                disabled={participants.length <= 1}
                title={participants.length <= 1 ? "Cannot remove the last participant" : "Remove participant"}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {participants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No participants yet</p>
          <p className="text-sm">Add people who will be splitting this bill</p>
        </div>
      )}

      {/* Quick Add Suggestions */}
      {!isAdding && participants.length > 0 && participants.length < 8 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Quick add common names:</p>
          <div className="flex flex-wrap gap-2">
            {['Me', 'Friend', 'Colleague', 'Partner'].map((name) => {
              const exists = participants.some(p => p.name.toLowerCase() === name.toLowerCase());
              if (exists) return null;
              
              return (
                <button
                  key={name}
                  onClick={() => {
                    onAddParticipant({ name });
                    toast.success(`${name} added`);
                  }}
                  className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-50 transition-colors"
                >
                  + {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantManager;
