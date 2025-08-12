import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import BasicRadar from "@/components/ui/radar-chart"

export default function Home() {
  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-black via-[#090E1D] to-[#0A0E1C]">
      <h1 className="text-white text-3xl font-bold text-center mb-4 mt-4">Pokémon Look Up</h1>
      <BentoGrid className="grid-rows-4 h-full" style={{
        gridTemplateRows: '120px 120px 300px 120px'
      }}>
        <BentoGridItem>
          <h3 className="text-white font-semibold mb-2">ITEM 1</h3>
          <p className="text-white/80 text-sm">Pending</p>
        </BentoGridItem>
        <BentoGridItem>
          <h3 className="text-white font-semibold mb-2">ITEM 2</h3>
          <p className="text-white/80 text-sm">Pending</p>
        </BentoGridItem>
        <BentoGridItem>
          <h3 className="text-white font-semibold mb-2">ITEM 3</h3>
          <p className="text-white/80 text-sm">Pending</p>
        </BentoGridItem>
        <BentoGridItem>
          <h3 className="text-white font-semibold mb-2">POKEMON TYPE</h3>
          <p className="text-white/80 text-sm">Here I&apos;ll display the types of the Pokémon</p>
        </BentoGridItem>
        <BentoGridItem>
          <h3 className="text-white font-semibold mb-2">Name</h3>
          <p className="text-white/80 text-sm">This box will contain the Pokémon&apos;s name and dex number.</p>
        </BentoGridItem>
        <BentoGridItem>
          <h3 className="text-white font-semibold mb-2">Abilities</h3>
          <p className="text-white/80 text-sm">This box will contain the possible Pokémon abilities</p>
        </BentoGridItem>
        <BentoGridItem className="row-span-2">
          <h3 className="text-white font-semibold mb-2">STATS</h3>
          {/* <p className="text-white/80 text-sm">This box will contain a radar chart of the Pokémon stats generated with Mui X</p> */}
          <BasicRadar />
        </BentoGridItem>
        <BentoGridItem className="row-span-2">
          <h3 className="text-white font-semibold mb-2">Sprite</h3>
          <p className="text-white/80 text-sm">This box will display a sprite of the Pokémon</p>
        </BentoGridItem>
        <BentoGridItem className="row-span-2">
          <h3 className="text-white font-semibold mb-2">Moves</h3>
          <p className="text-white/80 text-sm">This box will contain information about the possible moves this Pokémon can learn</p>
        </BentoGridItem>
      </BentoGrid>
    </div>
  )
}