"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";
import { CATEGORIES, CONDITIONS } from "@/lib/constants";

const EMPTY = {
  name: "",
  price: "",
  category: CATEGORIES[0],
  condition: CONDITIONS[0],
  description: "",
  bankName: "",
  accountNo: "",
};

export default function SellPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        bankName: profile.bank_name || "",
        accountNo: profile.bank_account_no || "",
      }));
    }
  }, [profile]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onFilesChange = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (i) => {
    setFiles(files.filter((_, idx) => idx !== i));
    setPreviews(previews.filter((_, idx) => idx !== i));
  };

  const submit = async () => {
    if (!form.name || !form.price || !form.bankName || !form.accountNo || files.length === 0) {
      alert("กรุณากรอกข้อมูลให้ครบ และแนบรูปอย่างน้อย 1 รูป");
      return;
    }
    setUploading(true);
    try {
      // 1) อัปโหลดรูปทั้งหมดขึ้น Supabase Storage
      const imageUrls = [];
      for (const file of files) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
        imageUrls.push(pub.publicUrl);
      }

      // 2) อัปเดตข้อมูลบัญชีธนาคารของผู้ขาย (ใช้ครั้งต่อไปได้เลย)
      await supabase
        .from("profiles")
        .update({ bank_name: form.bankName, bank_account_no: form.accountNo })
        .eq("id", user.id);

      // 3) สร้างสินค้า สถานะเริ่มต้นรอตรวจสอบ
      const { error: insertErr } = await supabase.from("products").insert({
        seller_id: user.id,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        image_urls: imageUrls,
        status: "pending_approval",
      });
      if (insertErr) throw insertErr;

      setForm(EMPTY);
      setFiles([]);
      setPreviews([]);
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (e) {
      alert("เกิดข้อผิดพลาด: " + e.message);
    } finally {
      setUploading(false);
    }
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="font-display text-2xl mb-1 text-navy">ลงขายสินค้า</div>
        <div className="font-body text-sm mb-6 text-inkSoft">
          สินค้าจะขึ้นแสดงหลังแอดมินตรวจสอบและอนุมัติแล้วเท่านั้น
        </div>

        {done && (
          <div className="rounded-lg p-3 mb-5 font-body text-sm flex items-center gap-2 bg-[#EAF0E3] text-sage">
            <Check size={16} /> ส่งสินค้าเข้าระบบแล้ว รอแอดมินตรวจสอบก่อนขึ้นแสดง
          </div>
        )}

        <div className="space-y-4">
          <Field label="ชื่อสินค้า">
            <Input value={form.name} onChange={set("name")} placeholder="เช่น เดนิมแจ็คเก็ต Levi's ไซส์ M" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="ราคา (บาท)">
              <Input type="number" value={form.price} onChange={set("price")} placeholder="450" />
            </Field>
            <Field label="หมวดหมู่">
              <Select value={form.category} onChange={set("category")} options={CATEGORIES} />
            </Field>
          </div>

          <Field label="สภาพสินค้า">
            <Select value={form.condition} onChange={set("condition")} options={CONDITIONS} />
          </Field>

          <Field label="รูปสินค้า (สูงสุด 5 รูป)">
            <input type="file" accept="image/*" multiple onChange={onFilesChange} className="font-body text-sm" />
            {previews.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {previews.map((src, i) => (
                  <div key={src} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} className="w-16 h-16 object-cover rounded-lg" alt="" />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute -top-1 -right-1 bg-white rounded-full border border-line"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          <Field label="รายละเอียดสินค้า">
            <textarea
              rows={3}
              value={form.description}
              onChange={set("description")}
              placeholder="อธิบายสภาพ ตำหนิ ขนาดจริง วิธีวัด ฯลฯ"
              className="w-full px-3.5 py-2.5 rounded-lg border border-line font-body"
            />
          </Field>

          <div className="h-px my-2 bg-line" />
          <div className="font-body font-medium text-sm text-ink">ข้อมูลบัญชี (ไว้โอนเงินให้หลังหัก GP)</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ธนาคาร">
              <Input value={form.bankName} onChange={set("bankName")} placeholder="เช่น กสิกรไทย" />
            </Field>
            <Field label="เลขบัญชี">
              <Input value={form.accountNo} onChange={set("accountNo")} placeholder="XXX-X-XXXXX-X" />
            </Field>
          </div>

          <button
            onClick={submit}
            disabled={uploading}
            className="w-full bg-navy text-white font-body font-medium rounded-lg px-5 py-2.5 disabled:opacity-60"
          >
            {uploading ? "กำลังอัปโหลด..." : "บันทึกและส่งตรวจสอบ"}
          </button>
        </div>
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
function Input(props) {
  return <input {...props} className="w-full px-3.5 py-2.5 rounded-lg border border-line font-body" />;
}
function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange} className="w-full px-3.5 py-2.5 rounded-lg border border-line font-body">
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}
