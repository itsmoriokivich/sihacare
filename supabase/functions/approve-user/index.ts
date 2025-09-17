import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApproveUserRequest {
  user_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_email }: ApproveUserRequest = await req.json();

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the user record from our custom users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', user_email)
      .single();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not found' }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update the user status to approved in our custom table
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        status: 'approved',
        is_approved: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', user_email);

    if (updateError) {
      console.error('Error updating user status:', updateError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to update user status' }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Confirm the user's email using the admin client
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
      userData.id,
      { 
        email_confirm: true,
        user_metadata: { email_confirmed: true }
      }
    );

    if (confirmError) {
      console.error('Error confirming user email:', confirmError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'User approved but email confirmation failed: ' + confirmError.message 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User approved and email confirmed successfully',
        user_id: userData.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in approve-user function:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);