require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectProject() {
    console.log("Looking up project 091b4ac3-9297-4a03-bba3-4d82edd47e1d...");
    const { data: project } = await supabase.from("projects").select("id, model_name, display_id").eq("id", "091b4ac3-9297-4a03-bba3-4d82edd47e1d").single();
    console.log("Project info:", project);
}
inspectProject();
