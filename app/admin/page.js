"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Hangtag from "@/components/Hangtag";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";
import { baht, PRODUCT_STATUS_LABEL } from "@/lib/constants";

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState("pending");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);

  const loadAll = async () => {
    const [{ data: p }, { data: o }, { data: s }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, products(name)").order("created_at", { ascending: false }),
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    setProducts(p || []);
    setOrders(o || []);
    setSettings(s);
  };

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  if (loading) return <PageShell>กำลังตรวจสอบสิทธิ์...</PageShell>;
  if (!user || !isAdmin) return <PageShell>หน้านี้สำหรับแอดมินเท่านั้น</PageShell>;

  const pending = products.filter((p) => p.status === "pending_approval");
  const allProducts = products;
  const pendingPayment = orders.filter((o) => o.status === "pending_payment");
  const paidConfirmed = orders.filter((o) => o.status === "paid_confirmed");
  const completed = orders.filter((o) => o.status === "completed");

  const approve = async (id) => {
    await supabase.from("products").update({ status: "available", reject_reason: null }).eq("id", id);
    loadAll();
  };
  const reject = async (id) => {
    const reason = prompt("เหตุผลที่ปฏิเสธ (ผู้ขายจะเห็นข้อความนี้):");
    if (reason === null) return;
    await supabase.from("products").update({ status: "rejected", reject_reason: reason }).eq("id", id);
    loadAll();
  };
  const deleteProduct = async (p) => {
    if (p.status === "sold") return;
    if (!confirm(`ลบสินค้า "${p.name}" ใช่หรือไม่? การกระทำนี้ย้อนกลับไม่ได้`)) return;
    await supabase.from("products").delete().eq("id", p.id);
    loadAll();
  };
  const confirmPaid = async (id) => {
    await supabase.from("orders").update({ status: "paid_confirmed" }).eq("id", id);
    loadAll();
  };
  const markTransferred = async (id) => {
    await supabase.from("orders").update({ status: "completed" }).eq("id", id);
    loadAll();
  };
  const saveSettings = async () => {
    await supabase.from("settings").update(settings).eq("id", 1);
    alert("บันทึกการตั้งค่าแล้ว");
  };

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="font-display text-2xl text-navy">แผงแอดมิน</div>
          <div className="flex gap-2 flex-wrap">
            {[
              ["pending", `รออนุมัติ (${pending.length})`],
              ["products", "สินค้าทั้งหมด"],
              ["orders", "ออเดอร์"],
              ["settings", "ตั้งค่า"],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`font-body text-sm px-3 py-1.5 rounded-lg border border-line ${
                  tab === k ? "bg-navy text-white" : "text-inkSoft"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {tab === "pending" && (
          <div className="space-y-3">
            {pending.length === 0 && <div className="font-body text-sm text-inkSoft">ไม่มีสินค้ารอตรวจสอบ</div>}
            {pending.map((p) => (
              <div key={p.id} className="rounded-xl p-4 bg-white border border-line">
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_urls?.[0]} alt="" className="w-16 h-16 object-cover rounded-lg bg-paper" />
                  <div className="flex-1">
                    <div className="font-body text-ink">{p.name}</div>
                    <div className="font-mono font-bold text-rust">฿{baht(p.price)}</div>
                    <div className="text-xs font-body text-inkSoft">{p.category} · {p.condition}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => approve(p.id)} className="flex-1 bg-sage text-white font-body text-sm rounded-lg py-2">
                    อนุมัติ
                  </button>
                  <button onClick={() => reject(p.id)} className="flex-1 bg-rust text-white font-body text-sm rounded-lg py-2">
                    ปฏิเสธ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "products" && (
          <div className="space-y-3">
            {allProducts.map((p) => {
              const s = PRODUCT_STATUS_LABEL[p.status];
              return (
                <div key={p.id} className="rounded-xl p-4 bg-white border border-line flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_urls?.[0]} alt="" className="w-16 h-16 object-cover rounded-lg bg-paper" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-body text-ink">{p.name}</div>
                      <Hangtag bg={s.bg} fg={s.fg}>{s.label}</Hangtag>
                    </div>
                    <div className="font-mono font-bold text-rust">฿{baht(p.price)}</div>
                  </div>
                  {p.status !== "sold" && (
                    <button onClick={() => deleteProduct(p)} className="self-start text-rust">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "orders" && (
          <div>
            <SectionTitle>รอโอนเงิน ({pendingPayment.length})</SectionTitle>
            {pendingPayment.map((o) => (
              <OrderCard key={o.id} o={o} action={
                <button onClick={() => confirmPaid(o.id)} className="w-full bg-navy text-white font-body text-sm rounded-lg py-2">
                  ยืนยันได้รับเงินแล้ว
                </button>
              } />
            ))}

            <SectionTitle>รอโอนให้ผู้ขาย ({paidConfirmed.length})</SectionTitle>
            {paidConfirmed.map((o) => (
              <OrderCard key={o.id} o={o} action={
                <button onClick={() => markTransferred(o.id)} className="w-full bg-sage text-white font-body text-sm rounded-lg py-2">
                  โอนให้ผู้ขายแล้ว ปิดออเดอร์
                </button>
              } />
            ))}

            <SectionTitle>เสร็จสมบูรณ์ ({completed.length})</SectionTitle>
            {completed.map((o) => <OrderCard key={o.id} o={o} />)}
          </div>
        )}

        {tab === "settings" && settings && (
          <div className="space-y-4 max-w-md">
            <SettingField label="เปอร์เซ็นต์ GP (%)">
              <input
                type="number"
                value={settings.gp_percent}
                onChange={(e) => setSettings({ ...settings, gp_percent: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-line font-body"
              />
            </SettingField>
            <SettingField label="ธนาคารร้านกลาง">
              <input
                value={settings.platform_bank_name}
                onChange={(e) => setSettings({ ...settings, platform_bank_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-line font-body"
              />
            </SettingField>
            <SettingField label="ชื่อบัญชี">
              <input
                value={settings.platform_account_name}
                onChange={(e) => setSettings({ ...settings, platform_account_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-line font-body"
              />
            </SettingField>
            <SettingField label="เลขบัญชี">
              <input
                value={settings.platform_account_no}
                onChange={(e) => setSettings({ ...settings, platform_account_no: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-line font-body"
              />
            </SettingField>
            <button onClick={saveSettings} className="bg-navy text-white font-body font-medium rounded-lg px-5 py-2.5">
              บันทึกการตั้งค่า
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PageShell({ children }) {
  return (
    <div>
      <Header />
      <div className="text-center py-20 font-body text-inkSoft">{children}</div>
    </div>
  );
}
function SectionTitle({ children }) {
  return <div className="font-body font-medium mb-2 mt-8 text-ink">{children}</div>;
}
function SettingField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-body mb-1.5 text-inkSoft">{label}</label>
      {children}
    </div>
  );
}
function OrderCard({ o, action }) {
  return (
    <div className="rounded-xl p-4 mb-3 bg-white border border-line">
      <div className="flex justify-between mb-2">
        <div className="font-mono font-bold text-sm text-ink">{o.order_code}</div>
        <div className="font-body text-xs text-inkSoft">{new Date(o.created_at).toLocaleString("th-TH")}</div>
      </div>
      <div className="font-body text-sm mb-2 text-ink">{o.products?.name}</div>
      <div className="text-sm font-body mb-3 text-inkSoft">
        {o.buyer_name} · {o.buyer_phone} · {o.buyer_address}
      </div>
      <div className="rounded-lg p-3 mb-3 bg-paper">
        <Row label="ยอดขาย" value={`฿${baht(o.amount)}`} />
        <Row label={`GP (${o.gp_percent}%)`} value={`-฿${baht(o.gp_amount)}`} accent />
        <div className="h-px my-1.5 bg-line" />
        <Row label="โอนให้ผู้ขาย" value={`฿${baht(o.seller_amount)}`} bold />
      </div>
      {action}
    </div>
  );
}
function Row({ label, value, accent, bold }) {
  return (
    <div className={`flex justify-between text-sm font-body ${accent ? "text-rust" : ""} ${bold ? "font-medium" : ""}`}>
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
