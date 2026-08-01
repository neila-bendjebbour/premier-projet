export default function Flag({ iso2, className = "w-5 h-3.5" }) {
  if (!iso2) return null;
  return (
    <img
      src={`https://flagcdn.com/${iso2.toLowerCase()}.svg`}
      alt=""
      loading="lazy"
      className={`inline-block object-cover rounded-[2px] shrink-0 ${className}`}
    />
  );
}
