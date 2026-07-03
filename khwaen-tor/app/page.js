"use client";
import { useEffect, useMemo, useState } from "react";
import { Package } from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Hangtag from "@/components/Hangtag";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIES } from "@/lib/constants";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = products
      .filter((p) => (category === "ทั้งหมด" ? true : p.category === category))
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .filter((p) => (minPrice ? p.price >= Number(minPrice) : true))
      .filter((p) => (maxPrice ? p.price <= Number(maxPrice) : true));

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    // newest is already the default order from the query
    return list;
  }, [products, category, query, minPrice, maxPrice, sort]);

  return (
    <div>
      <Header query={query} setQuery={setQuery} showSearch />

      <div className="bg-navyDark px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="font-display text-3xl sm:text-4xl mb-2 text-mustard">ให้เสื้อผ้าได้ไปต่อ</div>
          <div className="font-body text-sm sm:text-base text-cream/85">
            ตลาดนัดเสื้อผ้ามือสอง ซื้อ-ขายกันเองในชุมชน ทุกชิ้นมีเรื่องราวของมันเอง
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex gap-2 flex-wrap mb-4">
          {["ทั้งหมด", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCategory(c)}>
              <Hangtag bg={category === c ? "#D9A441" : "#fff"} fg={category === c ? "#263A4E" : "#6b6255"} size="md">
                {c}
              </Hangtag>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3 mb-6 bg-white border border-line rounded-xl p-3">
          <div>
            <label className="block text-xs font-body text-inkSoft mb-1">ราคาต่ำสุด</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-24 px-2 py-1.5 rounded-lg border border-line font-body text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-body text-inkSoft mb-1">ราคาสูงสุด</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="ไม่จำกัด"
              className="w-24 px-2 py-1.5 rounded-lg border border-line font-body text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-body text-inkSoft mb-1">เรียงลำดับ</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-line font-body text-sm"
            >
              <option value="newest">ล่าสุด</option>
              <option value="price_asc">ราคาน้อย → มาก</option>
              <option value="price_desc">ราคามาก → น้อย</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 font-body text-inkSoft">กำลังโหลดสินค้า...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 font-body text-inkSoft">
            <Package size={36} className="mx-auto mb-3" />
            ยังไม่มีสินค้าตรงเงื่อนไข — ลองปรับตัวกรองดูนะ
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
