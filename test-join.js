require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testJoin() {
    console.log("Testing server action join...");
    const { data, error } = await supabase
        .from("projects")
        .select("*, project_photos(*)")
        .limit(1);

    if (error) {
        console.error("SUPABASE ERROR:", error);
    } else {
        console.log("SUCCESS. Fetched a project. Does it have project_photos key?", Object.keys(data[0] || {}).includes("project_photos"));
        console.log("Data:", data[0]);
    }
}
testJoin();
