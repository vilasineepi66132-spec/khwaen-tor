"use client";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Search, Plus, ClipboardList, ShieldCheck, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabaseClient";

export default function Header({ query, setQuery, showSearch }) {
  const { user, isAdmin } = useAuth();

  return (
    <div className="bg-navy sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="bg-mustard w-9 h-9 rounded-full flex items-center justify-center">
            <ShoppingBag size={18} className="text-navy" />
          </div>
          <span className="font-display text-xl text-cream">แขวนต่อ</span>
        </Link>

        {showSearch && (
          <div className="flex-1 min-w-[180px] relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkSoft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาเสื้อผ้า กระเป๋า รองเท้า..."
              className="w-full pl-9 pr-3 py-2 rounded-full outline-none font-body text-sm bg-cream text-ink"
            />
          </div>
        )}

        <nav className="flex items-center gap-1 ml-auto flex-wrap">
          <NavLink href="/sell" icon={Plus} label="ลงขาย" />
          <NavLink href="/my-listings" icon={ShoppingBag} label="สินค้าของฉัน" />
          <NavLink href="/my-orders" icon={ClipboardList} label="ออเดอร์" />
          {isAdmin && <NavLink href="/admin" icon={ShieldCheck} label="แอดมิน" />}
          {user ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="font-body text-sm flex items-center gap-1.5 px-3 py-2 rounded-lg text-cream"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          ) : (
            <NavLink href="/login" icon={LogIn} label="เข้าสู่ระบบ" />
          )}
        </nav>
      </div>
    </div>
  );
}

function NavLink({ href, icon: Icon, label }) {
  return (
    <Link href={href} className="font-body text-sm flex items-center gap-1.5 px-3 py-2 rounded-lg text-cream">
      <Icon size={15} />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
