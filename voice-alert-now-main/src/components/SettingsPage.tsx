import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Star, Edit2, Save, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmergencyContacts, EmergencyContact } from '@/hooks/useEmergencyContacts';
import { useToast } from '@/hooks/use-toast';

interface SettingsPageProps {
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { contacts, loading, addContact, updateContact, deleteContact, isAuthenticated } = useEmergencyContacts();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast({ title: 'Error', description: 'Name and phone are required', variant: 'destructive' });
      return;
    }

    const result = await addContact({
      name: newContact.name,
      phone: newContact.phone,
      relationship: newContact.relationship || null,
      is_primary: contacts.length === 0
    });

    if (result.success) {
      toast({ title: 'Contact Added', description: `${newContact.name} has been added to your emergency contacts` });
      setNewContact({ name: '', phone: '', relationship: '' });
      setShowAddForm(false);
    }
  };

  const handleDelete = async (contact: EmergencyContact) => {
    const result = await deleteContact(contact.id);
    if (result.success) {
      toast({ title: 'Contact Removed', description: `${contact.name} has been removed` });
    }
  };

  const handleSetPrimary = async (id: string) => {
    // First unset all primary
    for (const contact of contacts) {
      if (contact.is_primary) {
        await updateContact(contact.id, { is_primary: false });
      }
    }
    // Then set new primary
    await updateContact(id, { is_primary: true });
    toast({ title: 'Primary Contact Updated' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={onBack} className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Auth Status */}
        {!isAuthenticated && (
          <div className="bg-warning/10 rounded-xl p-4 text-center">
            <p className="text-sm text-warning">
              Sign in to save your contacts permanently
            </p>
          </div>
        )}

        {/* Emergency Contacts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Emergency Contacts</h2>
            <Button 
              size="sm" 
              onClick={() => setShowAddForm(true)}
              className="emergency-gradient"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="glass-card rounded-xl p-4 mb-4 animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">New Contact</h3>
                <button onClick={() => setShowAddForm(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Name"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Phone Number"
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                />
                <Input
                  placeholder="Relationship (optional)"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                />
                <Button onClick={handleAddContact} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Contact
                </Button>
              </div>
            </div>
          )}

          {/* Contact List */}
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div 
                key={contact.id}
                className={`glass-card rounded-xl p-4 ${contact.is_primary ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{contact.name}</p>
                        {contact.is_primary && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      {contact.relationship && (
                        <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!contact.is_primary && (
                      <button 
                        onClick={() => handleSetPrimary(contact.id)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        title="Set as primary"
                      >
                        <Star className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(contact)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {contacts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No emergency contacts yet</p>
                <p className="text-sm">Add contacts to receive alerts</p>
              </div>
            )}
          </div>
        </section>

        {/* Alert Settings */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Alert Settings</h2>
          <div className="glass-card rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alarm Sound</p>
                <p className="text-sm text-muted-foreground">Play loud alarm when emergency detected</p>
              </div>
              <div className="w-12 h-6 bg-success rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Confirmation Beep</p>
                <p className="text-sm text-muted-foreground">Sound when alert is sent</p>
              </div>
              <div className="w-12 h-6 bg-success rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        </section>

        {/* Message Template */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Emergency Message</h2>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-2">
              This message will be sent to your contacts:
            </p>
            <div className="bg-secondary rounded-lg p-3 text-sm">
              EMERGENCY! I need help. Please contact emergency services and come to my location: [GPS Coordinates]
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
