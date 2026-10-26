import { useEffect, useState, type InputHTMLAttributes } from "react";

const maskMoney = (raw: string) => {
  const clean = raw.replace(/[^\d,]/g, "");
  const comma = clean.indexOf(",");
  const integer = (comma < 0 ? clean : clean.slice(0, comma)).replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  const decimals = comma < 0 ? null : clean.slice(comma + 1).replace(/\D/g, "").slice(0, 2);
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decimals === null ? grouped : `${grouped || "0"},${decimals}`;
};
const moneyToDecimal = (masked: string) => masked ? masked.replace(/\./g, "").replace(",", ".").replace(/\.$/, "") : "";
const decimalToMoney = (value: string | number) => value === "" || value === null || value === undefined || Number.isNaN(Number(value)) ? "" : maskMoney(Number(value).toFixed(2).replace(".", ","));

export default function MoneyInput({ value, onValueChange, ...props }: { value: string | number; onValueChange: (value: string) => void } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  const [text, setText] = useState(() => decimalToMoney(value));
  useEffect(() => {
    if (Number(moneyToDecimal(text) || 0) !== Number(value || 0)) setText(decimalToMoney(value));
  }, [value]);
  return <input {...props} type="text" inputMode="decimal" autoComplete="off" value={text} placeholder={props.placeholder ?? "0,00"} onChange={(event) => {
    const masked = maskMoney(event.target.value);
    setText(masked);
    onValueChange(moneyToDecimal(masked));
  }}/>;
}
