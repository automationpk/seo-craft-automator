
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

    const { toolSubmissionId } = await req.json()

    if (!toolSubmissionId) {
      throw new Error('Tool submission ID is required')
    }

    console.log('Processing tool submission:', toolSubmissionId)

    // Get the tool submission data
    const { data: toolSubmission, error: fetchError } = await supabase
      .from('tools_used')
      .select('*')
      .eq('id', toolSubmissionId)
      .single()

    if (fetchError) {
      console.error('Error fetching tool submission:', fetchError)
      throw fetchError
    }

    console.log('Tool submission data:', toolSubmission)

    // Get the webhook URL for this tool type
    const { data: webhook, error: webhookError } = await supabase
      .from('make_webhooks')
      .select('webhook_url')
      .eq('tool_type', toolSubmission.tool_type)
      .eq('is_active', true)
      .single()

    if (webhookError) {
      console.error('Error fetching webhook config:', webhookError)
      throw new Error(`No active webhook found for tool type: ${toolSubmission.tool_type}`)
    }

    console.log('Using webhook URL:', webhook.webhook_url)

    // Prepare the payload for Make.com
    const makePayload = {
      submissionId: toolSubmission.id,
      toolType: toolSubmission.tool_type,
      projectId: toolSubmission.project_id,
      inputs: toolSubmission.inputs,
      timestamp: new Date().toISOString()
    }

    console.log('Sending payload to Make.com:', makePayload)

    // Send data to Make.com webhook
    const makeResponse = await fetch(webhook.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(makePayload),
    })

    const makeResponseData = await makeResponse.text()
    console.log('Make.com response:', makeResponseData)

    // Update the tool submission with webhook details
    const { error: updateError } = await supabase
      .from('tools_used')
      .update({
        webhook_sent_at: new Date().toISOString(),
        webhook_response: { 
          status: makeResponse.status,
          response: makeResponseData 
        },
        status: 'processing'
      })
      .eq('id', toolSubmissionId)

    if (updateError) {
      console.error('Error updating tool submission:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Data sent to Make.com successfully',
        submissionId: toolSubmissionId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in send-to-make function:', error)
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
