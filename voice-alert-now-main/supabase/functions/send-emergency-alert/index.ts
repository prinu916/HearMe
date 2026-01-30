import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface EmergencyAlertRequest {
  contacts: Array<{
    name: string;
    phone: string;
  }>;
  message: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  keywords: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    // If Twilio is not configured, simulate the alert
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.log('Twilio not configured - simulating SMS alerts');
      
      const body: EmergencyAlertRequest = await req.json();
      
      console.log('🚨 EMERGENCY ALERT SIMULATION');
      console.log('Message:', body.message);
      console.log('Location:', body.location);
      console.log('Keywords detected:', body.keywords);
      console.log('Contacts to notify:', body.contacts);
      
      // Simulate successful sending
      const results = body.contacts.map(contact => ({
        name: contact.name,
        phone: contact.phone,
        status: 'simulated',
        message: 'SMS simulated (Twilio not configured)'
      }));

      return new Response(
        JSON.stringify({ 
          success: true, 
          simulated: true,
          results 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Parse request body
    const body: EmergencyAlertRequest = await req.json();
    const { contacts, message, location, keywords } = body;

    // Build the SMS message
    const locationLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    const fullMessage = `${message}\n\nLocation: ${location.address || 'See map'}\n${locationLink}\n\nKeywords: ${keywords.join(', ')}\n\n- Emergency Listener AI`;

    console.log('Sending emergency alerts to', contacts.length, 'contacts');

    // Send SMS to each contact
    const results = await Promise.all(
      contacts.map(async (contact) => {
        try {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
          
          const formData = new URLSearchParams();
          formData.append('To', contact.phone);
          formData.append('From', TWILIO_PHONE_NUMBER);
          formData.append('Body', fullMessage);

          const response = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          });

          const data = await response.json();

          if (response.ok) {
            console.log(`SMS sent to ${contact.name} (${contact.phone}): ${data.sid}`);
            return {
              name: contact.name,
              phone: contact.phone,
              status: 'sent',
              sid: data.sid
            };
          } else {
            console.error(`Failed to send SMS to ${contact.name}:`, data);
            return {
              name: contact.name,
              phone: contact.phone,
              status: 'failed',
              error: data.message || 'Unknown error'
            };
          }
        } catch (error) {
          console.error(`Error sending SMS to ${contact.name}:`, error);
          return {
            name: contact.name,
            phone: contact.phone,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'sent').length;
    
    return new Response(
      JSON.stringify({ 
        success: true,
        simulated: false,
        totalContacts: contacts.length,
        successfulAlerts: successCount,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Emergency alert error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
