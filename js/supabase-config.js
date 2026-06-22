const SUPABASE_URL = "https://qxgmkmjqfilhmpsksjgx.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_Dh-J7coAdfgb2YMh_6DGxw_-SbesPYH";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
