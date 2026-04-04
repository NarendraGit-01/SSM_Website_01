require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkBuckets() {
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log("Buckets:", buckets?.map(b => b.name));
}
checkBuckets();
