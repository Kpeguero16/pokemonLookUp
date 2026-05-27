/**
 * Base Pokémon IDs that have meaningful alternate forms
 * (regional variants or Mega Evolutions). Used for form badges
 * in the Dex grid without requiring a species API call per card.
 */
export const POKEMON_WITH_FORMS = new Set<number>([
  // ── Alolan forms (Gen 1 originals) ──
  19,   // Rattata
  20,   // Raticate
  26,   // Raichu
  27,   // Sandshrew
  28,   // Sandslash
  37,   // Vulpix
  38,   // Ninetales
  50,   // Diglett
  51,   // Dugtrio
  52,   // Meowth (also Galarian)
  53,   // Persian
  74,   // Geodude
  75,   // Graveler
  76,   // Golem
  88,   // Grimer
  89,   // Muk
  103,  // Exeggutor
  105,  // Marowak

  // ── Galarian forms ──
  77,   // Ponyta
  78,   // Rapidash
  79,   // Slowpoke
  80,   // Slowbro (also Mega)
  83,   // Farfetch'd
  110,  // Weezing
  122,  // Mr. Mime
  144,  // Articuno
  145,  // Zapdos
  146,  // Moltres
  199,  // Slowking
  222,  // Corsola
  263,  // Zigzagoon
  264,  // Linoone
  554,  // Darumaka
  555,  // Darmanitan
  562,  // Yamask
  618,  // Stunfisk

  // ── Hisuian forms ──
  58,   // Growlithe
  59,   // Arcanine
  100,  // Voltorb
  101,  // Electrode
  157,  // Typhlosion
  211,  // Qwilfish
  215,  // Sneasel
  503,  // Samurott
  549,  // Lilligant
  570,  // Zorua
  571,  // Zoroark
  628,  // Braviary
  705,  // Sliggoo
  706,  // Goodra
  713,  // Avalugg
  724,  // Decidueye

  // ── Paldean forms ──
  128,  // Tauros
  194,  // Wooper

  // ── Mega Evolutions ──
  3,    // Venusaur
  6,    // Charizard
  9,    // Blastoise
  15,   // Beedrill
  18,   // Pidgeot
  65,   // Alakazam
  94,   // Gengar
  115,  // Kangaskhan
  127,  // Pinsir
  130,  // Gyarados
  142,  // Aerodactyl
  150,  // Mewtwo
  181,  // Ampharos
  208,  // Steelix
  212,  // Scizor
  214,  // Heracross
  229,  // Houndoom
  248,  // Tyranitar
  254,  // Sceptile
  257,  // Blaziken
  260,  // Swampert
  282,  // Gardevoir
  302,  // Sableye
  303,  // Mawile
  306,  // Aggron
  308,  // Medicham
  310,  // Manectric
  319,  // Sharpedo
  323,  // Camerupt
  334,  // Altaria
  354,  // Banette
  359,  // Absol
  362,  // Glalie
  373,  // Salamence
  376,  // Metagross
  380,  // Latias
  381,  // Latios
  384,  // Rayquaza
  428,  // Lopunny
  445,  // Garchomp
  448,  // Lucario
  460,  // Abomasnow
  475,  // Gallade
  531,  // Audino
  719,  // Diancie
]);
