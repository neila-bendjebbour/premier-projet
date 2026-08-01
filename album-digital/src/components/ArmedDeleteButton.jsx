import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export default function ArmedDeleteButton({ onConfirm, className = "", size = 14 }) {
  const [armed, setArmed] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function handleClick(e) {
    e.stopPropagation();
    if (armed) {
      clearTimeout(timeoutRef.current);
      setArmed(false);
      onConfirm();
      return;
    }
    setArmed(true);
    timeoutRef.current = setTimeout(() => setArmed(false), 2600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`transition ${
        armed
          ? "px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-mono uppercase tracking-wide"
          : `text-amber-400 hover:text-rose-600 ${className}`
      }`}
    >
      {armed ? "Sûr ?" : <X size={size} />}
    </button>
  );
}
