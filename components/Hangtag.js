export default function Hangtag({ children, bg = "#263A4E", fg = "#fff", size = "sm" }) {
  const pad = size === "sm" ? "3px 12px 3px 18px" : "5px 16px 5px 22px";
  const fontSize = size === "sm" ? 11 : 13;
  return (
    <span
      className="hangtag font-body inline-flex items-center"
      style={{ background: bg, color: fg, padding: pad, fontSize, fontWeight: 500, whiteSpace: "nowrap" }}
    >
      {children}
    </span>
  );
}
