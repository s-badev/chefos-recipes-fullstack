import Link from "next/link";
import { logoutAction } from "../server/auth/actions";
import type { CurrentUser } from "../server/auth/session";
import { getSessionUser } from "./session-user";
import { StitchBand } from "./stitch";

type FooterLink = { href: string; label: string };

const browseLinks: FooterLink[] = [
  { href: "/catalog", label: "Рецепти" },
  { href: "/favorites", label: "Любими" },
  { href: "/about", label: "За нас" }
];

/** The "Профил" column follows who is looking, like the header: guest, user or admin. */
export function profileLinks(user: CurrentUser | undefined): FooterLink[] {
  if (!user) return [{ href: "/login", label: "Вход" }, { href: "/register", label: "Регистрация" }];
  const links = [{ href: "/profile", label: "Моят профил" }];
  return user.role === "admin" ? [...links, { href: "/admin", label: "Админ панел" }] : links;
}

/** The same line as the site's meta description (layout.tsx). */
const FOOTER_TEXT = "Подбрани български домашни рецепти с продукти, стъпки, време за приготвяне и порции – за всеки ден.";

export function SiteFooterView({ user, logout, year }: { user: CurrentUser | undefined; logout: () => Promise<void>; year: number }) {
  const columns = [
    { id: "browse", title: "Разглеждай", links: browseLinks },
    { id: "profile", title: "Профил", links: profileLinks(user) }
  ];
  return <footer className="ftr">
    <StitchBand />
    <div className="wrap ftr-grid">
      <div>
        <Link className="logo" href="/" aria-label="Домашна кухня Chefo's Recipes – начало">
          {/* The space keeps the visible text readable as words for the accessible name. */}
          <span className="logo-kicker">Домашна кухня</span>{" "}
          <span className="logo-name">Chefo&apos;s <em>Recipes</em></span>
        </Link>
        <p>{FOOTER_TEXT}</p>
      </div>
      {columns.map(column => <nav aria-labelledby={`footer-${column.id}`} key={column.id}>
        <h2 id={`footer-${column.id}`}>{column.title}</h2>
        <ul>
          {column.links.map(item => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}
          {column.id === "profile" && user ? <li><form action={logout}><button type="submit">Изход</button></form></li> : null}
        </ul>
      </nav>)}
    </div>
    <div className="wrap"><div className="ftr-base"><p>© {year} Chefo&apos;s Recipes. Всички права запазени.</p></div></div>
  </footer>;
}

export async function SiteFooter() {
  return <SiteFooterView logout={logoutAction} user={await getSessionUser()} year={new Date().getFullYear()} />;
}
