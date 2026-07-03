export const CATEGORIES = [
  "เสื้อผ้าผู้หญิง",
  "เสื้อผ้าผู้ชาย",
  "กระเป๋า",
  "รองเท้า",
  "เครื่องประดับ",
  "อื่นๆ",
];

export const CONDITIONS = [
  "เกรด A · เหมือนใหม่",
  "เกรด B · สภาพดี",
  "เกรด C · มีตำหนิเล็กน้อย",
];

export const PRODUCT_STATUS_LABEL = {
  pending_approval: { label: "รอตรวจสอบ", bg: "#D9A441", fg: "#263A4E" },
  available: { label: "พร้อมขาย", bg: "#7A8B69", fg: "#fff" },
  rejected: { label: "ถูกปฏิเสธ", bg: "#B5533C", fg: "#fff" },
  sold: { label: "ขายแล้ว", bg: "#263A4E", fg: "#fff" },
};

export const ORDER_STATUS_LABEL = {
  pending_payment: { label: "รอโอนเงิน", bg: "#D9A441", fg: "#263A4E" },
  paid_confirmed: { label: "ยืนยันรับเงินแล้ว · กำลังจัดส่ง", bg: "#7A8B69", fg: "#fff" },
  completed: { label: "โอนให้ผู้ขายแล้ว · เสร็จสมบูรณ์", bg: "#263A4E", fg: "#fff" },
};

export function baht(n) {
  return Number(n || 0).toLocaleString("th-TH");
}

export function shortId() {
  return Date.now().toString(36).toUpperCase().slice(-6);
}
