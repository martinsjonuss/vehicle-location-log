const SUPABASE_URL = "https://qxgmkmjqfilhmpsksjgx.supabase.co";

// This publishable key is expected in browser code. Never add service role keys or database credentials here.
const SUPABASE_ANON_KEY = "sb_publishable_Dh-J7coAdfgb2YMh_6DGxw_-SbesPYH";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
