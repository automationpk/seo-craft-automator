
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    console.log('Received payload from Make.com:', payload)

    const { submissionId, status, outputUrl, makeScenarioId, error } = payload

    if (!submissionId) {
      throw new Error('Submission ID is required')
    }

    // Update the tool submission with the results from Make.com
    const updateData: any = {
      status: status || 'completed',
      updated_at: new Date().toISOString()
    }

    if (outputUrl) {
      updateData.output_url = outputUrl
    }

    if (makeScenarioId) {
      updateData.make_scenario_id = makeScenarioId
    }

    if (error) {
      updateData.status = 'failed'
      updateData.webhook_response = { 
        ...updateData.webhook_response,
        error: error 
      }
    }

    console.log('Updating tool submission with:', updateData)

    const { error: updateError } = await supabase
      .from('tools_used')
      .update(updateData)
      .eq('id', submissionId)

    if (updateError) {
      console.error('Error updating tool submission:', updateError)
      throw updateError
    }

    console.log('Successfully updated tool submission:', submissionId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Tool submission updated successfully',
        submissionId 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in receive-from-make function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
