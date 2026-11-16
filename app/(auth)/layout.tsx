import { Wine, ShieldCheck, BarChart3, Package } from "lucide-react";

const highlights = [
  { icon: BarChart3, text: "Real-time sales and revenue insights" },
  { icon: Package, text: "Inventory, orders and fulfilment in one place" },
  { icon: ShieldCheck, text: "Secure, role-based admin access" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-sidebar p-12 text-sidebar-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-gold-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 -left-32 h-[30rem] w-[30rem] rounded-full bg-gold-700/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]"
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-gradient shadow-lg shadow-gold-500/20">
            <Wine className="h-5 w-5 text-gold-900" />
          </div>
          <span className="font-display text-2xl font-semibold tracking-tight text-white">
            eWinery
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
            Admin Console
          </p>
          <h2 className="font-display text-4xl font-semibold leading-tight text-white">
            Manage your cellar with{" "}
            <span className="text-gold-gradient">precision</span>.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/70">
            Everything you need to run the eWinery storefront — products,
            orders, customers and payments — from a single dashboard.
          </p>
          <ul className="mt-10 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-500/30 bg-gold-500/10">
                  <Icon className="h-4 w-4 text-gold-400" />
                </span>
                <span className="text-sidebar-foreground/85">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-sidebar-foreground/50">
          © {new Date().getFullYear()} eWinery. All rights reserved.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-gradient">
              <Wine className="h-5 w-5 text-gold-900" />
            </div>
            <span className="font-display text-2xl font-semibold tracking-tight">
              eWinery
            </span>
          </div>
          <div className="[&_[data-slot=card]]:shadow-xl [&_[data-slot=card]]:shadow-gold-900/5 [&_[data-slot=card]]:ring-border [&_[data-slot=card-title]]:font-display [&_[data-slot=card-title]]:text-2xl [&_[data-slot=card-title]]:font-semibold [&_[data-slot=card-header]]:pt-2 [&_[data-slot=card-footer]]:bg-transparent [&_[data-slot=card-footer]]:border-t-0 [&_input]:h-10 [&_button[type=submit]]:h-10 [&_button[type=submit]]:font-semibold">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
