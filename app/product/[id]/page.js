"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Copy, ImageOff } from "lucide-react";
import Header from "@/components/Header";
import Hangtag from "@/components/Hangtag";
import { supabase } from "@/lib/supabaseClient";
import { baht } from "@/lib/constants";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("view");
  const [form, setForm] = useState({ buyerName: "", buyerPhone: "", buyerAddress: "" });
  const [order, setOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      setProduct(data);
      setLoading(false);
    })();
  }, [id]);

  const submit = async () => {
    if (!form.buyerName || !form.buyerPhone || !form.buyerAddress) return;
    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, ...form }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      alert(data.error || "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
      return;
    }
    setOrder(data.order);
    setStep("done");
  };

  const copyAccount = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="text-center py-20 font-body text-inkSoft">กำลังโหลด...</div>
      </div>
    );
  }

  if (!product || product.status !== "available") {
    return (
      <div>
        <Header />
        <div className="text-center py-20 font-body text-inkSoft">ไม่พบสินค้านี้ หรือถูกขายไปแล้ว</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {step === "view" && (
          <>
            <div className="aspect-square w-full rounded-xl overflow-hidden mb-3 flex items-center justify-center bg-paper">
              {product.image_urls?.[activeImg] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image_urls[activeImg]} className="w-full h-full object-cover" alt={product.name} />
              ) : (
                <ImageOff size={36} className="text-inkSoft" />
              )}
            </div>
            {product.image_urls?.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {product.image_urls.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${
                      i === activeImg ? "border-mustard" : "border-transparent"
                    }`}
                    alt=""
                  />
                ))}
              </div>
            )}
            <div className="flex gap-2 mb-3">
              <Hangtag bg="#7A8B69">{product.category}</Hangtag>
              <Hangtag bg="#263A4E">{product.condition}</Hangtag>
            </div>
            <div className="font-body text-lg mb-1 text-ink">{product.name}</div>
            <div className="font-mono font-bold text-2xl mb-3 text-rust">฿{baht(product.price)}</div>
            <div className="font-body text-sm mb-5 whitespace-pre-wrap text-inkSoft">{product.description}</div>
            <button
              onClick={() => setStep("form")}
              className="w-full bg-navy text-white font-body font-medium rounded-lg px-5 py-2.5"
            >
              สั่งซื้อสินค้านี้
            </button>
          </>
        )}

        {step === "form" && (
          <div className="space-y-4">
            <div className="font-body font-medium text-lg text-ink">กรอกข้อมูลผู้ซื้อ</div>
            <Field label="ชื่อผู้ซื้อ">
              <input
                className="w-full px-3.5 py-2.5 rounded-lg border border-line font-body"
                value={form.buyerName}
                onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                placeholder="ชื่อ-นามสกุล"
              />
            </Field>
            <Field label="เบอร์โทร">
              <input
                className="w-full px-3.5 py-2.5 rounded-lg border border-line font-body"
                value={form.buyerPhone}
                onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
                placeholder="08X-XXX-XXXX"
              />
            </Field>
            <Field label="ที่อยู่จัดส่ง">
              <textarea
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-line font-body"
                value={form.buyerAddress}
                onChange={(e) => setForm({ ...form, buyerAddress: e.target.value })}
                placeholder="บ้านเลขที่ ถนน ตำบล/แขวง อำเภอ/เขต จังหวัด รหัสไปรษณีย์"
              />
            </Field>
            <div className="flex gap-2">
              <button onClick={() => setStep("view")} className="px-4 py-2 rounded-lg border border-line font-body text-sm">
                ย้อนกลับ
              </button>
              <button
                onClick={submit}
                disabled={submitting || !form.buyerName || !form.buyerPhone || !form.buyerAddress}
                className="flex-1 bg-navy text-white font-body font-medium rounded-lg px-5 py-2.5 disabled:opacity-60"
              >
                {submitting ? "กำลังส่ง..." : "ยืนยันสั่งซื้อ"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && order && (
          <div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-sage">
                <Check size={22} className="text-white" />
              </div>
              <div className="font-body text-ink">สั่งซื้อสำเร็จ! กรุณาโอนเงินเพื่อยืนยันคำสั่งซื้อ</div>
            </div>
            <div className="rounded-xl p-4 mb-4 bg-white border-2 border-dashed border-mustard">
              <div className="flex justify-between text-sm font-body mb-2 text-inkSoft">
                <span>รหัสออเดอร์</span>
                <span className="font-mono font-bold text-ink">{order.order_code}</span>
              </div>
              <div className="flex justify-between text-sm font-body mb-2 text-inkSoft">
                <span>ยอดที่ต้องโอน</span>
                <span className="font-mono font-bold text-lg text-rust">฿{baht(order.amount)}</span>
              </div>
              <div className="h-px my-2 bg-line" />
              <div className="text-sm font-body text-inkSoft">โอนเข้าบัญชี</div>
              <div className="font-body font-medium mb-0.5 text-ink">
                {order.platform_bank_name} — {order.platform_account_name}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg text-ink">{order.platform_account_no}</span>
                <button onClick={() => copyAccount(order.platform_account_no)}>
                  <Copy size={15} className="text-inkSoft" />
                </button>
                {copied && <span className="text-xs font-body text-sage">คัดลอกแล้ว</span>}
              </div>
            </div>
            <div className="text-sm font-body mb-5 text-inkSoft">
              โอนเสร็จแล้วตรวจสอบสถานะได้ที่เมนู &quot;ออเดอร์&quot; โดยใช้เบอร์โทรที่กรอกไว้
            </div>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-navy text-white font-body font-medium rounded-lg px-5 py-2.5"
            >
              กลับหน้าแรก
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-body mb-1.5 text-inkSoft">{label}</label>
      {children}
    </div>
  );
}
