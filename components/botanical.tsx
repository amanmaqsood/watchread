export function Botanical({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  const stroke = dark ? "#c2cf9b" : "#496246";
  return (
    <svg
      className={className}
      viewBox="0 0 400 460"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="200" cy="230" r="176" stroke={stroke} strokeOpacity=".18" />
      <circle cx="200" cy="230" r="135" stroke={stroke} strokeOpacity=".12" />
      <path
        d="M202 425C191 322 217 171 206 39"
        stroke={stroke}
        strokeWidth="2"
      />
      {[70, 140, 210, 280].map((y, i) => (
        <g key={y}>
          <path
            d={`M205 ${y + 48} C${115 - i * 5} ${y + 38} 89 ${y - 3} 111 ${y - 33} C157 ${y - 24} 188 ${y + 4} 205 ${y + 48}Z`}
            fill={stroke}
            fillOpacity={0.12 + i * 0.035}
            stroke={stroke}
            strokeWidth="1.2"
          />
          <path
            d={`M205 ${y + 48}L111 ${y - 33}M177 ${y + 23}L139 ${y + 12}M159 ${y + 8}L147 ${y - 13}`}
            stroke={stroke}
            strokeOpacity=".65"
          />
          <path
            d={`M205 ${y + 20} C282 ${y + 18} 311 ${y - 17} 295 ${y - 50} C257 ${y - 38} 223 ${y - 10} 205 ${y + 20}Z`}
            fill={stroke}
            fillOpacity={0.15 + i * 0.035}
            stroke={stroke}
            strokeWidth="1.2"
          />
          <path
            d={`M205 ${y + 20}L295 ${y - 50}M240 ${y - 7}L268 ${y - 10}M261 ${y - 23}L268 ${y - 38}`}
            stroke={stroke}
            strokeOpacity=".65"
          />
        </g>
      ))}
      <circle cx="205" cy="39" r="4" fill={stroke} />
      <path
        d="M70 366H164M235 96H333"
        stroke={stroke}
        strokeDasharray="3 4"
        strokeOpacity=".5"
      />
      <text
        x="36"
        y="391"
        fill={stroke}
        fontSize="10"
        fontFamily="sans-serif"
        letterSpacing="2"
      >
        FIG. 01
      </text>
      <text
        x="280"
        y="83"
        fill={stroke}
        fontSize="10"
        fontFamily="sans-serif"
        letterSpacing="2"
      >
        CO₂ → LIFE
      </text>
    </svg>
  );
}
