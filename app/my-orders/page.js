"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Hangtag from "@/components/Hangtag";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";
import { baht, ORDER_STATUS_LABEL } from "@/lib/constants";

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [phone, setPhone] = useState("");
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [sellerOrders, setSellerOrders] = useState([]);

  const searchByPhone = async () => {
    setSearched(true);
    const { data } = await supabase
      .from("orders")
      .select("*, products(name)")
      .eq("buyer_phone", phone)
      .order("created_at", { ascending: false });
    setBuyerOrders(data || []);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, products(name)")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      setSellerOrders(data || []);
    })();
  }, [user]);

  return (
    <div>
      <Header />
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="font-display text-2xl mb-1 text-navy">ติดตามออเดอร์ที่ซื้อ</div>
        <div className="font-body text-sm mb-6 text-inkSoft">กรอกเบอร์โทรที่ใช้ตอนสั่งซื้อ</div>
        <div className="flex gap-2 mb-6">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08X-XXX-XXXX"
            className="flex-1 px-3.5 py-2.5 rounded-lg border border-line font-body"
          />
          <button onClick={searchByPhone} className="bg-navy text-white font-body font-medium rounded-lg px-5">
            ค้นหา
          </button>
        </div>

        {searched && buyerOrders.length === 0 && (
          <div className="text-center py-6 font-body text-inkSoft">ไม่พบออเดอร์ของเบอร์นี้</div>
        )}

        <OrderList orders={buyerOrders} />

        {user && sellerOrders.length > 0 && (
          <>
            <div className="font-display text-xl mt-12 mb-4 text-navy">ออเดอร์สินค้าที่ฉันขาย</div>
            <OrderList orders={sellerOrders} isSeller />
          </>
        )}
      </div>
    </div>
  );
}

function OrderList({ orders, isSeller }) {
  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const s = ORDER_STATUS_LABEL[o.status];
        return (
          <div key={o.id} className="rounded-xl p-4 bg-white border border-line">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-mono font-bold text-sm text-ink">{o.order_code}</div>
                <div className="font-body text-sm text-inkSoft">{o.products?.name}</div>
              </div>
              <Hangtag bg={s.bg} fg={s.fg}>{s.label}</Hangtag>
            </div>
            <div className="font-mono font-bold text-rust">
              ฿{baht(isSeller ? o.seller_amount : o.amount)}
              {isSeller && <span className="text-xs font-body text-inkSoft ml-1">(หลังหัก GP {o.gp_percent}%)</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
