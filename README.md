# 🎮 pokemonLookUp

> **Gotta cache 'em all!** A feature-rich Pokémon Team Builder & Pokédex built with React, TypeScript, and a whole lot of type matchup mathematics.

## 🌟 What is This?

pokemonLookUp is a web app that lets you browse, search, and strategically build competitive Pokémon teams. Whether you're a tournament grinder, a casual explorer, or someone who just wants to see type advantages in action, this app has you covered.

**[🚀 Play Live](https://kpeguero16.github.io/pokemonLookUp/)** • [📖 View Code](#tech-stack)

---

## ✨ Features

### 🔍 **Pokédex Lookup**
- Browse 1000+ Pokémon with search, filtering, and sorting
- Filter by generation, type, and base stat total
- Sort by dex number, name, stats, or speed tier
- Infinite scroll with lazy loading
- Keyboard shortcuts: Press `/` to search, `1/2/3` for navigation

### 📊 **Pokémon Details**
- Full stats with visual bars
- Type advantages/disadvantages (offensive & defensive)
- Evolution chains
- Complete move pool with level-up moves
- Species info (catch rate, egg groups, flavor text)
- Quick-add to team from detail view

### ⚔️ **Team Builder**
- Build and save custom 6-Pokémon teams
- Multiple layout modes (horizontal, grid, sidebar)
- **Smart Team Analysis** showing:
  - Type coverage & weak spots
  - Speed tier distribution
  - Role distribution (physical, special, defensive)
  - Synergy notes
- Export teams in Pokémon Showdown format
- Randomize team for quick experimentation
- Undo removed Pokémon with one click

### 📚 **Moves & Abilities Codex**
- Searchable database of all moves and abilities
- Filter by type, class (physical/special/status)
- View move effects and priority
- Quick reference for ability interactions

### 🎨 **Design**
- Retro CRT aesthetic meets modern data viz
- Dark mode (default) + light mode toggle
- Fully responsive (mobile, tablet, desktop)
- Type-color associations for visual feedback
- Pixel font for that nostalgic feel

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18.3 + React Router v7 |
| **Language** | TypeScript 5.6 |
| **Styling** | TailwindCSS 4.3 |
| **Build Tool** | Vite 5.4 |
| **State Management** | Zustand 5 |
| **Data Source** | PokeAPI v2 |
| **Deployment** | GitHub Pages (gh-pages) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repo
git clone https://github.com/Kpeguero16/pokemonLookUp.git
cd pokemonLookUp

# Install dependencies
cd pokemon-team-builder
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173/pokemonLookUp/`

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

---

## 🎯 Project Highlights

### 🧠 Smart Caching
- LocalStorage caching with automatic quota management
- Version-stamped cache keys for easy updates
- Inflight request deduplication (prevents duplicate API calls)

### ⚡ Performance
- Lazy-loaded route components (code splitting)
- Intersection Observer for infinite scroll
- Concurrent API requests with custom utilities
- 10-second fetch timeout with AbortController

### ♿ Accessibility
- ARIA labels and semantic HTML throughout
- Skip-to-main-content link
- Screen reader support
- Keyboard-navigable UI (Enter/Space, "/" to search)
- Full dark mode support

### 🎪 State Management
- Multiple Zustand stores for separation of concerns:
  - `dexStore` — Pokémon data & filters
  - `teamStore` — Team builder state
  - `themeStore` — Dark/light mode
  - `toastStore` — Notifications with actions

---

## 💡 How to Use

### Finding Pokémon
1. Go to the **Pokédex** (press `1`)
2. Use the search bar or apply filters
3. Click any Pokémon to see detailed stats, moves, and type matchups
4. Press **Add to Team** to start building

### Building a Team
1. Go to the **Team Builder** (press `2`)
2. Click empty slots to pick Pokémon
3. See real-time type coverage analysis
4. Use **Team Analysis** to spot weaknesses
5. Export to Pokémon Showdown format with one click

### Exploring Moves & Abilities
1. Go to the **Codex** (press `3`)
2. Filter by type, class, or generation
3. View detailed effect descriptions

---

## 📁 Project Structure

```
pokemon-team-builder/
├── src/
│   ├── pages/               # Lookup, Detail, Team, Codex pages
│   ├── components/          # Reusable UI components
│   ├── store/              # Zustand stores
│   ├── lib/                # PokeAPI integration
│   ├── hooks/              # Custom React hooks
│   ├── constants/          # Type charts & colors
│   ├── types/              # TypeScript interfaces
│   └── utils/              # Helpers & utilities
├── public/                  # Static assets
└── index.html              # HTML entry point
```

---

## 🤝 Contributing

Found a bug? Want to add a feature? Contributions are welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🎓 About This Project

This was my first deep dive into API integration, state management, and modern web dev with React. The PokeAPI integration is solid, the caching strategy is performant, and I learned a ton about type systems (both Pokémon types and TypeScript types!).

**Skills showcased:**
- React hooks & component design
- TypeScript for type safety
- Zustand for lightweight state management
- PokeAPI integration & data transformation
- Performance optimization (caching, lazy loading, code splitting)
- Responsive design & accessibility
- GitHub Pages deployment automation

---

## 🙏 Acknowledgments

- [PokeAPI](https://pokeapi.co/) for the comprehensive Pokémon data
- [React Router](https://reactrouter.com/) for client-side routing
- [Zustand](https://github.com/pmndrs/zustand) for elegant state management
- [TailwindCSS](https://tailwindcss.com/) for utility-first styling

---

Made with ❤️ by [Khalil Peguero](https://github.com/Kpeguero16)
