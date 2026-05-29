import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MenuButton() {
  const [open, setOpen] = useState(false);

  const goTo = (id: string) => {
    setOpen(false);
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const items = [
    { label: "PROJET 1", id: "projet-1" },
    { label: "PROJET 2", id: "projet-2" },
    { label: "Contacter l'antilope", id: "contact" },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="menu-trigger"
        aria-label="Ouvrir le menu"
      >
        <Menu size={24} strokeWidth={2} />
        <span>menu</span>
      </button>

      <div
        className={`menu-overlay ${open ? "is-open" : ""}`}
        role="dialog"
        aria-hidden={!open}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="menu-close"
          aria-label="Fermer le menu"
        >
          <X size={64} strokeWidth={2.5} />
        </button>
        <nav className="menu-nav">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="menu-item"
              onClick={() => goTo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
