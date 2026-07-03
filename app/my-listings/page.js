"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Hangtag from "@/components/Hangtag";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";
import { baht, PRODUCT_STATUS_LABEL } from "@/lib/constants";

export default function MyListingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    setProducts(data || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const remove = async (p) => {
    if (p.status === "sold") return; // กันไว้อีกชั้น แม้ปุ่มจะถูกซ่อนแล้วก็ตาม
    if (!confirm(`ลบสินค้า "${p.name}" ใช่หรือไม่?`)) return;
    setBusy(true);
    await supabase.from("products").delete().eq("id", p.id);
    await load();
    setBusy(false);
  };

  if (loading || !user) {
    return (
      <div>
        <Header />
        <div className="text-center py-20 font-body text-inkSoft">กำลังตรวจสอบสิทธิ์...</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="font-display text-2xl mb-6 text-navy">สินค้าของฉัน</div>

        {products.length === 0 && (
          <div className="font-body text-sm text-inkSoft">ยังไม่มีสินค้าที่ลงขาย</div>
        )}

        <div className="space-y-3">
          {products.map((p) => {
            const s = PRODUCT_STATUS_LABEL[p.status];
            const canDelete = p.status !== "sold";
            return (
              <div key={p.id} className="rounded-xl p-4 bg-white border border-line flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image_urls?.[0]}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg bg-paper shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-body text-sm text-ink truncate">{p.name}</div>
                    <Hangtag bg={s.bg} fg={s.fg}>{s.label}</Hangtag>
                  </div>
                  <div className="font-mono font-bold text-rust">฿{baht(p.price)}</div>
                  {p.status === "rejected" && p.reject_reason && (
                    <div className="text-xs font-body text-rust mt-1">เหตุผล: {p.reject_reason}</div>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => remove(p)}
                      disabled={busy}
                      className="mt-2 text-xs font-body flex items-center gap-1 text-rust"
                    >
                      <Trash2 size={13} /> ลบสินค้านี้
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
