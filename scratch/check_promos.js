const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    try {
        const { data, error } = await supabase.from('promos').select('*').limit(1);
        if (error) throw error;
        console.log(JSON.stringify({ exists: !!data, columns: data && data.length > 0 ? Object.keys(data[0]) : null }));
    } catch (e) {
        console.log(JSON.stringify({ exists: false, error: e.message }));
    }
}
check();
