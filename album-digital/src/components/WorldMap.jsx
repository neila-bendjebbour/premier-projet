import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { COUNTRIES } from "../data/countries";
import { useTrip } from "../context/TripContext";
import Flag from "./Flag";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function WorldMap({ onSelectCountry, selectedCountry }) {
  const { state } = useTrip();
  const [hovered, setHovered] = useState(null);

  const byMapId = {};
  COUNTRIES.forEach((c) => {
    if (c.mapId) byMapId[c.mapId] = c;
  });

  return (
    <div>
      <p className="sm:hidden text-center font-mono text-[10px] uppercase tracking-widest text-amber-500 mb-2">
        Glisse la carte
      </p>

      <div className="relative overflow-x-auto rounded-xl border border-amber-200 bg-white">
        {hovered && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-amber-950 text-amber-50 text-xs font-mono uppercase tracking-wide rounded-full pl-2 pr-3 py-1">
            <Flag iso2={hovered.iso2} className="w-4 h-3" />
            {hovered.name}
          </div>
        )}
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 155 }}
          style={{ minWidth: 640, width: "100%", height: "auto", display: "block" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const country = byMapId[geo.id];
                const status = country ? state.countryStatus[country.name] : null;
                const isSelected = country && selectedCountry === country.name;

                let fill = "#FDF0CC";
                let stroke = "#EED9A0";
                let strokeDasharray = undefined;
                if (status === "visited") {
                  fill = "#78350F";
                  stroke = "#FACC15";
                } else if (status === "planned") {
                  fill = "#FBCFE8";
                  stroke = "#DB2777";
                  strokeDasharray = "3,2";
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => country && onSelectCountry(country.name)}
                    onMouseEnter={() => country && setHovered({ iso2: country.iso2, name: country.name })}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      default: {
                        fill,
                        stroke: isSelected ? "#78350F" : stroke,
                        strokeWidth: isSelected ? 1.5 : 0.75,
                        strokeDasharray,
                        outline: "none",
                        transition: "fill 0.2s ease",
                      },
                      hover: {
                        fill: status === "visited" ? "#5c2a09" : status === "planned" ? "#f9a8d4" : "#FBE8B0",
                        stroke,
                        strokeWidth: 1,
                        strokeDasharray,
                        outline: "none",
                        cursor: country ? "pointer" : "default",
                      },
                      pressed: { fill, outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-3 text-xs text-amber-700">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-900 border-2 border-yellow-400 inline-block" /> Tamponné
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-pink-200 border border-pink-600 inline-block" /> En projet
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-200 border border-amber-300 inline-block" /> Non exploré
        </span>
      </div>
    </div>
  );
}
