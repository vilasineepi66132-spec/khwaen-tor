"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const sendLink = async () => {
    setError("");
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div>
      <Header />
      <div className="max-w-sm mx-auto px-4 py-16">
        <div className="font-display text-2xl mb-2 text-center text-navy">เข้าสู่ระบบ</div>
        <div className="font-body text-sm text-center mb-6 text-inkSoft">
          ใช้สำหรับผู้ต้องการลงขายสินค้า (ผู้ซื้อไม่จำเป็นต้องเข้าสู่ระบบ)
        </div>

        {sent ? (
          <div className="font-body text-sm text-center text-sage">
            ส่งลิงก์เข้าสู่ระบบไปที่อีเมล {email} แล้ว กรุณาเปิดอีเมลเพื่อกดยืนยัน
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="อีเมลของคุณ"
              className="w-full px-3.5 py-2.5 rounded-lg border border-line font-body mb-3"
            />
            {error && <div className="text-sm font-body text-rust mb-3">{error}</div>}
            <button onClick={sendLink} className="w-full bg-navy text-white font-body font-medium rounded-lg px-5 py-2.5">
              ส่งลิงก์เข้าสู่ระบบ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
