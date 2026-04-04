require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verifyAll() {
    const testPhone = "8888877777";
    console.log("--- 1. Testing New Customer Creation ---");
    const { data: cust, error: custErr } = await supabase.from("customers").insert({
        name: "Verification Test",
        phone_number: testPhone,
    }).select().single();

    if (custErr) {
        console.error("Customer Insert Failed:", custErr.message);
    } else {
        console.log("Customer Created Successfully!");
        console.log("Customer Display ID:", cust.display_id); // Should be SSM-CUST-XXXX

        console.log("\n--- 2. Testing Project Creation ---");
        const { data: proj, error: projErr } = await supabase.from("projects").insert({
            customer_id: cust.id,
            category: "UPVC Products",
            model_name: "Verif Project",
        }).select().single();

        if (projErr) {
            console.error("Project Insert Failed:", projErr.message);
        } else {
            console.log("Project Created Successfully!");
            console.log("Project Display ID:", proj.display_id); // Should be PROJ-2026-XXX
        }
    }

    console.log("\n--- 3. Testing Duplicate Mobile Constraint ---");
    const { data: dup, error: dupErr } = await supabase.from("customers").insert({
        name: "Duplicate Test",
        phone_number: testPhone,
    }).select();

    if (dupErr) {
        console.log("Constraint Working! Caught Duplicate Error:", dupErr.message);
        console.log("Error Code:", dupErr.code); // Should be 23505
    } else {
        console.error("FAILURE: Duplicate mobile number was allowed!");
    }
}

verifyAll();
