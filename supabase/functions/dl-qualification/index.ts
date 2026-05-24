import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async (req) => {
  const url = new URL(req.url)
  const studentId = url.searchParams.get('studentId')

  if (!studentId) {
    return new Response(
      JSON.stringify({ error: 'studentId is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: gradeRecords, error } = await supabase
    .from('grade_records')
    .select('*')
    .eq('studentId', studentId)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      studentId,
      records: gradeRecords,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
})