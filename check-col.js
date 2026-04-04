const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkColumn() {
    const { data, error } = await supabase.from('services').select('*').limit(1);
    if (error) {
        console.error('Error fetching services:', error.message);
        return;
    }
    if (data && data.length > 0) {
        console.log('Columns in services:', Object.keys(data[0]));
    } else {
        console.log('No services found to check columns.');
    }
}

checkColumn();
