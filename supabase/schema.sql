-- ============================================================
-- แขวนต่อ (Khwaen Tor) marketplace — Supabase schema
-- วิธีใช้: เปิด Supabase Dashboard > SQL Editor > วางไฟล์นี้ทั้งหมด > Run
-- ============================================================

-- 1) โปรไฟล์ผู้ใช้ (ผูกกับ auth.users ของ Supabase Auth)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  bank_name text,
  bank_account_no text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

-- 2) สินค้า
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  price numeric not null check (price >= 0),
  category text not null,
  condition text not null,
  image_urls text[] not null default '{}',
  status text not null default 'pending_approval'
    check (status in ('pending_approval', 'available', 'rejected', 'sold')),
  reject_reason text,
  created_at timestamptz not null default now()
);

-- 3) ออเดอร์
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  product_id uuid not null references products(id),
  seller_id uuid not null references profiles(id),
  buyer_id uuid references profiles(id),
  buyer_name text not null,
  buyer_phone text not null,
  buyer_address text not null,
  amount numeric not null,
  gp_percent numeric not null,
  gp_amount numeric not null,
  seller_amount numeric not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid_confirmed', 'completed')),
  created_at timestamptz not null default now()
);

-- 4) ตั้งค่าระบบ (แถวเดียว)
create table if not exists settings (
  id int primary key default 1,
  gp_percent numeric not null default 10,
  platform_bank_name text not null default 'กสิกรไทย',
  platform_account_name text not null default 'แขวนต่อ มาร์เก็ต',
  platform_account_no text not null default '012-3-45678-9',
  constraint single_row check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table settings enable row level security;

-- profiles: อ่านได้ทุกคน, แก้ไขได้เฉพาะเจ้าของ
create policy "profiles are viewable by everyone" on profiles
  for select using (true);
create policy "users can insert own profile" on profiles
  for insert with check (auth.uid() = id);
create policy "users can update own profile" on profiles
  for update using (auth.uid() = id);

-- products: คนทั่วไปเห็นเฉพาะ available, เจ้าของเห็นของตัวเองทุกสถานะ, admin เห็นหมด
create policy "public can view available products" on products
  for select using (status = 'available');
create policy "sellers can view own products" on products
  for select using (auth.uid() = seller_id);
create policy "admins can view all products" on products
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
create policy "sellers can insert own products" on products
  for insert with check (auth.uid() = seller_id);
-- ผู้ขายลบเองได้เฉพาะตอนยังไม่ sold
create policy "sellers can delete own unsold products" on products
  for delete using (auth.uid() = seller_id and status <> 'sold');
-- แอดมินลบได้ทุกอย่างยกเว้น sold (บังคับใน API route อีกชั้น)
create policy "admins can delete non-sold products" on products
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    and status <> 'sold'
  );
-- แอดมิน approve/reject, ผู้ขายแก้ไขสินค้าตัวเองตอนยังไม่ approve
create policy "admins can update products" on products
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- orders: ผู้ซื้อ/ผู้ขาย/แอดมิน เห็นเฉพาะที่เกี่ยวข้อง
create policy "buyers can view own orders" on orders
  for select using (auth.uid() = buyer_id);
create policy "sellers can view their sale orders" on orders
  for select using (auth.uid() = seller_id);
create policy "admins can view all orders" on orders
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
create policy "admins can update orders" on orders
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- settings: อ่านได้ทุกคน (ต้องโชว์เลขบัญชีร้านกลางตอนสั่งซื้อ), แก้ได้เฉพาะแอดมิน
create policy "settings viewable by everyone" on settings
  for select using (true);
create policy "admins can update settings" on settings
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- Storage: bucket สำหรับรูปสินค้า
-- ขั้นแรกต้องสร้าง bucket ก่อนในหน้า Storage ของ Supabase Dashboard:
--   1. กด "New bucket" ตั้งชื่อ "product-images" เปิด Public bucket = ON
-- แล้วค่อยรัน policy ด้านล่างนี้ (รันต่อจากด้านบนได้เลย)
-- ============================================================
create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "authenticated users upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "owners delete own product images" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.uid() = owner);

-- ============================================================
-- หลังรันไฟล์นี้แล้ว ให้ตั้งตัวเองเป็นแอดมิน:
--   1. สมัคร/ล็อกอินเว็บ 1 ครั้งก่อน (จะมีแถวใน profiles อัตโนมัติ)
--   2. ไปที่ Table Editor > profiles > แก้ role ของแถวตัวเองเป็น 'admin'
-- ============================================================
