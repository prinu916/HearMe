import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string | null;
  is_primary: boolean;
}

const DEFAULT_CONTACTS: EmergencyContact[] = [
  { id: 'demo-1', name: 'Mom', phone: '+91 98765 43210', relationship: 'Parent', is_primary: true },
  { id: 'demo-2', name: 'Dad', phone: '+91 98765 43211', relationship: 'Parent', is_primary: false },
  { id: 'demo-3', name: 'Emergency Services', phone: '112', relationship: 'Emergency', is_primary: false },
];

export const useEmergencyContacts = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(DEFAULT_CONTACTS);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      if (user) {
        fetchContacts();
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        fetchContacts();
      } else {
        setContacts(DEFAULT_CONTACTS);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('is_primary', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setContacts(data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addContact = useCallback(async (contact: Omit<EmergencyContact, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Demo mode - add to local state
        const newContact = { ...contact, id: `demo-${Date.now()}` };
        setContacts(prev => [...prev, newContact]);
        return { success: true };
      }

      const { error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship,
          is_primary: contact.is_primary
        });

      if (error) throw error;
      await fetchContacts();
      return { success: true };
    } catch (error) {
      console.error('Error adding contact:', error);
      return { success: false, error };
    }
  }, [fetchContacts]);

  const updateContact = useCallback(async (id: string, updates: Partial<EmergencyContact>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Demo mode
        setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        return { success: true };
      }

      const { error } = await supabase
        .from('emergency_contacts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchContacts();
      return { success: true };
    } catch (error) {
      console.error('Error updating contact:', error);
      return { success: false, error };
    }
  }, [fetchContacts]);

  const deleteContact = useCallback(async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Demo mode
        setContacts(prev => prev.filter(c => c.id !== id));
        return { success: true };
      }

      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchContacts();
      return { success: true };
    } catch (error) {
      console.error('Error deleting contact:', error);
      return { success: false, error };
    }
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    isAuthenticated,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact
  };
};
