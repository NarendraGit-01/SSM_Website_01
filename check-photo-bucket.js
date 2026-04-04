require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkBucket() {
    console.log("Checking buckets...");
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error("Error listing buckets:", error);
        return;
    }
    const exists = buckets.find(b => b.name === "ssm-project-assets");
    if (exists) {
        console.log("Bucket 'ssm-project-assets' EXISTS. Public:", exists.public);
    } else {
        console.log("Bucket 'ssm-project-assets' DOES NOT EXIST!");
    }
    
    // Also check project_photos table
    console.log("\nChecking project_photos table...");
    const { data: pt, error: ptErr } = await supabase.from("project_photos").select("id").limit(1);
    if (ptErr) {
        console.log("Table project_photos ERROR:", ptErr.message);
    } else {
        console.log("Table project_photos EXACTS (Found " + pt.length + " rows)");
    }
}
checkBucket();
