import Link from "next/link";
import { ImageOff } from "lucide-react";
import Hangtag from "./Hangtag";
import { baht } from "@/lib/constants";

export default function ProductCard({ p }) {
  const cover = p.image_urls?.[0];
  return (
    <Link
      href={`/product/${p.id}`}
      className="card-hover block rounded-xl overflow-hidden bg-white border border-line"
    >
      <div className="aspect-square w-full flex items-center justify-center overflow-hidden bg-paper">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <ImageOff size={28} className="text-inkSoft" />
        )}
      </div>
      <div className="p-3">
        <div className="mb-1.5">
          <Hangtag bg="#7A8B69">{p.category}</Hangtag>
        </div>
        <div className="font-body text-[15px] leading-snug line-clamp-2 mb-1 text-ink">{p.name}</div>
        <div className="font-mono font-bold text-lg text-rust">฿{baht(p.price)}</div>
        <div className="text-xs font-body mt-1 text-inkSoft">{p.condition}</div>
      </div>
    </Link>
  );
}
