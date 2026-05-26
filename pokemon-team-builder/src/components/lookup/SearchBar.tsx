import { useState, type FormEvent, type KeyboardEvent } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onRandomize: () => void;
  currentId: number | null;
}

export function SearchBar({ onSearch, onPrev, onNext, onRandomize, currentId }: SearchBarProps) {
  const [input, setInput] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) onSearch(trimmed);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const trimmed = input.trim();
      if (trimmed) onSearch(trimmed);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Name or Pokédex number..."
          className="flex-1 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-400 transition-colors"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors"
        >
          Search
        </button>
      </form>

      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={currentId === null || currentId <= 1}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
        >
          ← Prev
        </button>
        <button
          onClick={onRandomize}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors"
        >
          Random
        </button>
        <button
          onClick={onNext}
          disabled={currentId === null}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
