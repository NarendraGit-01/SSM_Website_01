const { Client } = require('pg');

async function migrate() {
    const client = new Client({
        connectionString: "postgresql://postgres.qkiiismsqqfkonxxwaid:SSM-password-2026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
    });

    try {
        await client.connect();
        console.log("Connected to DB");
        await client.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS sub_category TEXT;");
        console.log("Migration successful: Added sub_category to projects");
    } catch (err) {
        console.error("Migration failed:", err.message);
    } finally {
        await client.end();
    }
}

migrate();
