import { Outlet, NavLink } from "react-router-dom";

export default function App() {
  const link =
    "px-3 py-2 rounded-xl hover:opacity-90 transition text-sm";
  const active = "bg-white shadow";
  return (
    <div className="min-h-screen bg-cream text-ink">
      <nav className="container-safe sticky top-0 z-50 backdrop-blur bg-cream/70">
        <div className="flex items-center justify-between py-3">
          <div className="font-extrabold text-xl">365 Days of Us 💗</div>
          <div className="flex gap-2">
            <NavLink to="/" end className={({isActive}) => `${link} ${isActive?active:''}`}>Home</NavLink>
            <NavLink to="/gallery" className={({isActive}) => `${link} ${isActive?active:''}`}>Gallery</NavLink>
            <NavLink to="/countdown" className={({isActive}) => `${link} ${isActive?active:''}`}>Countdown</NavLink>
            <NavLink to="/quiz" className={({isActive}) => `${link} ${isActive?active:''}`}>Quiz</NavLink>
          </div>
        </div>
      </nav>
      <main className="container-safe py-8">
        <Outlet />
      </main>
    </div>
  );
}
