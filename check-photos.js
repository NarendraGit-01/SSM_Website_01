require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProjectPhotos() {
    console.log("Fetching all project photos...");
    const { data: photos, error } = await supabase
        .from("project_photos")
        .select("*");
        
    if (error) {
        console.error("Error fetching project_photos:", error);
        return;
    }
    
    console.log(`Found ${photos.length} photos in the database.`);
    if (photos.length > 0) {
        console.log(photos);
    }
}

checkProjectPhotos();
