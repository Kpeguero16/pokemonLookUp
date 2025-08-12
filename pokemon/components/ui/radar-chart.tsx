"use client";

import * as React from "react";
import dynamic from "next/dynamic";

const RadarChart = dynamic(
  () => import("@mui/x-charts/RadarChart").then((mod) => mod.RadarChart),
  { ssr: false }
);

const POKEMON_NAME = "Charizard";

export default function BasicRadar() {
  const [stats, setStats] = React.useState<number[]>([]);

  React.useEffect(() => {
    async function fetchPokemon() {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${POKEMON_NAME}`);
        const data = await res.json();

        const desiredStatsOrder = [
          "hp",
          "attack",
          "defense",
          "speed",
          "special-defense",
          "special-attack",
        ];

        const baseStats = desiredStatsOrder.map((statName) => {
          const statObj = data.stats.find((s: { stat: { name: string } }) => s.stat.name === statName);
          return statObj ? statObj.base_stat : 0;
        });

        setStats(baseStats);
      } catch (error) {
        console.error("Failed to fetch pokemon data:", error);
      }
    }

    fetchPokemon();
  }, []);

  return (
    <RadarChart
      height={300}
      stripeColor={null}
      series={[
        {
          data: stats.length ? stats : Array(6).fill(0),
          color: "#ffffff",
          fillArea: true,
        },
      ]}
      sx={{
        ".MuiRadarAxisHighlight-root": {
          display: "none",
        },
        ".MuiRadarSeriesArea-area": {
          fill: "#ffffff",
          fillOpacity: 1,
          stroke: "#000000",
          strokeWidth: 1,
        },
      }}
      radar={{
        max: 120,
        metrics: ["HP", "Attack", "Defense", "Speed", "S-Defense", "S-attack"],
      }}
    />
  );
}