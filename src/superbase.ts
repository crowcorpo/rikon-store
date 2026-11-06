import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zjqswkivfrqnpmkotdhk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqcXN3a2l2ZnJxbnBta290ZGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0NjAxNjMsImV4cCI6MjEwOTAzNjE2M30.xDOBX02HOZItngu5EPCOExgZeDN1TMNYVyQ8SACOLUg";

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: window.localStorage,
        lock: false
    }
});