import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function shortId() {
  return Date.now().toString(36).toUpperCase().slice(-6);
}

export async function POST(req) {
  try {
    const { productId, buyerName, buyerPhone, buyerAddress } = await req.json();

    if (!productId || !buyerName || !buyerPhone || !buyerAddress) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json({ error: "ไม่พบสินค้านี้" }, { status: 404 });
    }
    if (product.status !== "available") {
      return NextResponse.json({ error: "สินค้านี้ถูกขายไปแล้วหรือยังไม่พร้อมขาย" }, { status: 409 });
    }

    const { data: settings } = await supabaseAdmin.from("settings").select("*").eq("id", 1).maybeSingle();
    const gpPercent = settings?.gp_percent ?? 10;
    const gpAmount = Math.round(product.price * (gpPercent / 100));
    const sellerAmount = product.price - gpAmount;

    const orderPayload = {
      order_code: "OD-" + shortId(),
      product_id: product.id,
      seller_id: product.seller_id,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      buyer_address: buyerAddress,
      amount: product.price,
      gp_percent: gpPercent,
      gp_amount: gpAmount,
      seller_amount: sellerAmount,
      status: "pending_payment",
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // กันขายซ้ำ: ตั้งสินค้าเป็น sold ทันทีที่มีคนกดสั่งซื้อ (manual payment ยืนยันทีหลังโดยแอดมิน)
    await supabaseAdmin.from("products").update({ status: "sold" }).eq("id", product.id);

    return NextResponse.json({
      order: {
        ...order,
        platform_bank_name: settings?.platform_bank_name,
        platform_account_name: settings?.platform_account_name,
        platform_account_no: settings?.platform_account_no,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
