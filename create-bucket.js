require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

// We need the SERVICE ROLE key to create buckets programmatically
// The anonymous key usually doesn't have permissions to create buckets
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixBucket() {
    console.log("Attempting to create the bucket 'ssm-project-assets'...");
    
    const { data, error } = await supabase.storage.createBucket('ssm-project-assets', {
        public: true,
        allowedMimeTypes: ['image/*'],
    });

    if (error) {
        console.error("Error creating bucket:", error.message);
        
        if (error.message.includes("already exists") || error.message.includes("duplicate")) {
           console.log("Bucket already exists! Let's update it to be public just in case.");
           const { error: updErr } = await supabase.storage.updateBucket('ssm-project-assets', { public: true });
           if (updErr) console.error("Could not update bucket:", updErr);
           else console.log("Bucket updated to public = true.");
        }
    } else {
        console.log("Bucket created successfully!");
    }
}

fixBucket();
