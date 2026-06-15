const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:F%40r00que_0617@db.ojoertiqcemkzkpkaefy.supabase.co:5432/postgres"
  });

  await client.connect();

  const query = `
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('facilities', 'profiles', 'bookings') AND column_name = 'id';
  `;

  const res = await client.query(query);
  console.log(JSON.stringify(res.rows, null, 2));

  await client.end();
}

main().catch(console.error);
