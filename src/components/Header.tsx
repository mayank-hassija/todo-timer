import { Github } from 'lucide-react';

export const Header = () => {
  return (
    <header className="py-6 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <img src="/tomato.svg" alt="Tomato Timer" className="h-8 w-8" />
        <h1 className="text-2xl font-bold text-slate-100">
          Todo<span className="text-rose-500">Timer</span>
        </h1>
      </div>
      <a
        href="https://github.com/cazterk/todo-timer"
        target="_blank"
        rel="noopener noreferrer"
        className="text-slate-400 hover:text-slate-200 transition-colors"
        title="View on GitHub"
      >
        <Github size={24} />
      </a>
    </header>
  );
}; 