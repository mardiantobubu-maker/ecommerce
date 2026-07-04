
import { createClient } from '@supabase/supabase-client'

const supabase = createClient(
  'https://nrunbiazgozefdxixxib.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ydW5iaWF6Z296ZWZkeGl4eGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDQ4NTQsImV4cCI6MjA5MjA4MDg1NH0.TsYFoSoswR3Y9fWQLK7JfeJ3v4qZonf1IoCAE_GjPN0'
)

async function checkPrices() {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, price, discounted_price, price_panjang, discounted_price_panjang')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error(error)
    return
  }

  console.log(JSON.stringify(data, null, 2))
}

checkPrices()
