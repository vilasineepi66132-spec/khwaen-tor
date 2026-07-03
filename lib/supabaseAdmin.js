import { createClient } from "@supabase/supabase-js";

// ใช้เฉพาะฝั่ง server (API routes) เท่านั้น ห้าม import ไฟล์นี้ใน client component
// เพราะ service role key มีสิทธิ์เต็ม ข้ามการตรวจสอบ RLS ทั้งหมด
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
