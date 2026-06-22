const SUPABASE_URL = "https://qxgmkmjqfilhmpsksjgx.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_Dh-J7coAdfgb2YMh_6DGxw_-SbesPYH";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("Supabase connected");
console.log(db);

async function testConnection() {
    const { data, error } = await db
        .from('vehicle_movements')
        .select('*')
        .limit(1);

    console.log('DATA:', data);
    console.log('ERROR:', error);
}

testConnection();