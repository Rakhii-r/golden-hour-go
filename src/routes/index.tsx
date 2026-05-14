import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-sunscreen.jpg";
import textureImg from "@/assets/texture-swatch.jpg";
import lifestyleImg from "@/assets/lifestyle-beach.jpg";
import lineupImg from "@/assets/product-lineup.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOLARA — SPF 50 Sunscreen for Real Life" },
      {
        name: "description",
        content:
          "SOLARA is a weightless mineral SPF 50 sunscreen with antioxidant defense. Reef-safe, dermatologist-tested, and made for daily wear.",
      },
      { property: "og:title", content: "SOLARA — SPF 50 Sunscreen for Real Life" },
      {
        property: "og:description",
        content: "Weightless mineral SPF 50. Reef-safe. Made for daily wear.",
      },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Index,
});

function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/" className="font-display text-xl font-bold tracking-tight">
          SOLARA<span className="text-primary">.</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#science" className="hover:text-primary transition-colors">Science</a>
          <a href="#shop" className="hover:text-primary transition-colors">Shop</a>
          <a href="#ritual" className="hover:text-primary transition-colors">Ritual</a>
          <a href="#journal" className="hover:text-primary transition-colors">Journal</a>
        </nav>
        <a
          href="#shop"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-105"
        >
          Shop SPF 50
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-warm pb-24 pt-32 text-primary-foreground md:pb-32 md:pt-40">
      <div
        aria-hidden
        className="absolute -right-40 top-1/2 h-[700px] w-[700px] -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--sun), transparent 60%)" }}
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-background" />
            New · Mineral SPF 50
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Wear the<br />
            <em className="not-italic text-background/90">sun</em>, not the burn.
          </h1>
          <p className="mt-8 max-w-xl text-lg text-primary-foreground/85 md:text-xl">
            A weightless, reef-safe SPF 50 with antioxidant defense. Made for
            sand, city, and every golden hour in between.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#shop"
              className="rounded-full bg-background px-7 py-3.5 text-sm font-semibold text-foreground shadow-soft transition-transform hover:scale-105"
            >
              Shop SOLARA — $34
            </a>
            <a
              href="#science"
              className="rounded-full border border-background/30 px-7 py-3.5 text-sm font-semibold text-background hover:bg-background/10"
            >
              Read the science
            </a>
          </div>
          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-background/20 pt-8 text-sm">
            <div>
              <dt className="text-primary-foreground/70">SPF</dt>
              <dd className="mt-1 font-display text-3xl font-bold">50+</dd>
            </div>
            <div>
              <dt className="text-primary-foreground/70">Reef</dt>
              <dd className="mt-1 font-display text-3xl font-bold">Safe</dd>
            </div>
            <div>
              <dt className="text-primary-foreground/70">Tested</dt>
              <dd className="mt-1 font-display text-3xl font-bold">Derm.</dd>
            </div>
          </dl>
        </div>
        <div className="relative md:col-span-5">
          <div className="absolute inset-0 -m-6 rounded-[2rem] bg-background/10 blur-2xl" />
          <img
            src={heroImg}
            alt="SOLARA SPF 50 sunscreen tube on warm sunset sand"
            width={1280}
            height={1600}
            className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-glow"
          />
          <div className="absolute -left-6 bottom-8 hidden rounded-2xl bg-background/95 p-4 text-foreground shadow-soft backdrop-blur md:block">
            <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">
              Broad spectrum
            </p>
            <p className="mt-1 font-display text-2xl font-bold">UVA · UVB · Blue light</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Vogue", "Allure", "Byrdie", "Goop", "The Cut", "Refinery29", "Harper's Bazaar"];
  return (
    <div className="border-y border-border bg-background py-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-3 px-6 text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
        <span className="text-foreground">As seen in —</span>
        {items.map((i) => (
          <span key={i}>{i}</span>
        ))}
      </div>
    </div>
  );
}

function Magazine() {
  return (
    <section id="science" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex items-end justify-between gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Issue 01 · The Glow Edit
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight md:text-6xl">
              Sunscreen, but make it a <span className="text-sunset">ritual</span>.
            </h2>
          </div>
          <a
            href="#journal"
            className="hidden shrink-0 text-sm font-medium underline underline-offset-4 md:inline"
          >
            All stories →
          </a>
        </div>

        {/* Magazine grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Featured */}
          <article className="group relative col-span-12 overflow-hidden rounded-3xl md:col-span-8 md:row-span-2">
            <img
              src={lifestyleImg}
              alt="Woman applying SOLARA sunscreen at golden hour beach"
              width={1024}
              height={1280}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:aspect-[5/6]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-background md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] opacity-80">
                Feature · 4 min read
              </p>
              <h3 className="mt-3 max-w-lg font-display text-3xl font-bold leading-tight md:text-4xl">
                Why dermatologists are obsessed with mineral filters in 2025.
              </h3>
            </div>
          </article>

          {/* Side cards */}
          <article className="col-span-12 overflow-hidden rounded-3xl bg-card md:col-span-4">
            <img
              src={textureImg}
              alt="Macro shot of SOLARA sunscreen swatch"
              width={1024}
              height={1024}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Texture
              </p>
              <h3 className="mt-2 font-display text-xl font-bold">
                Cushiony, fast-absorbing, never chalky.
              </h3>
            </div>
          </article>

          <article className="col-span-12 rounded-3xl bg-sunset p-8 text-primary-foreground md:col-span-4 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] opacity-80">
              The promise
            </p>
            <h3 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">
              "It's the only SPF I don't forget to reapply."
            </h3>
            <p className="mt-6 text-sm opacity-90">— Maya R., founder & lifelong sun-lover</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function Ingredients() {
  const items = [
    { n: "01", t: "Non-nano Zinc Oxide", d: "21.6% mineral filter that reflects UVA + UVB without sinking into your bloodstream." },
    { n: "02", t: "Niacinamide 4%", d: "Strengthens the barrier and evens tone after sun exposure." },
    { n: "03", t: "Vitamin E + Astaxanthin", d: "Antioxidant duo that neutralizes free radicals from UV and pollution." },
    { n: "04", t: "Squalane + Hyaluronic", d: "All-day hydration that plays nicely under makeup." },
  ];
  return (
    <section id="ritual" className="bg-secondary py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Inside the tube
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">
            Six actives.<br />Zero compromise.
          </h2>
          <p className="mt-6 text-muted-foreground">
            We obsess over every milligram. No oxybenzone, no octinoxate, no
            silicones, no synthetic fragrance — just protection that loves your
            skin back.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-border sm:grid-cols-2 md:col-span-8">
          {items.map((i) => (
            <li key={i.n} className="bg-background p-8">
              <p className="font-display text-sm font-bold text-primary">{i.n}</p>
              <h3 className="mt-3 font-display text-2xl font-bold">{i.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{i.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Shop() {
  const products = [
    { name: "SOLARA Daily SPF 50", desc: "The original — weightless mineral defense.", price: "$34", tag: "Bestseller" },
    { name: "SOLARA Tinted SPF 40", desc: "A sheer wash of color with antioxidant glow.", price: "$38", tag: "New" },
    { name: "SOLARA Body Mist SPF 30", desc: "Reapply on the go. No white cast, ever.", price: "$28", tag: "Travel" },
  ];
  return (
    <section id="shop" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-4xl font-bold md:text-6xl">The collection.</h2>
          <p className="max-w-md text-muted-foreground">
            Three formulas, one philosophy: protection you'll actually wear every day.
          </p>
        </div>
        <div className="overflow-hidden rounded-3xl">
          <img
            src={lineupImg}
            alt="SOLARA sunscreen tubes lined up on a magenta gradient backdrop"
            width={1280}
            height={960}
            loading="lazy"
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.name}
              className="group flex flex-col justify-between rounded-3xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <div>
                <span className="inline-block rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-secondary-foreground">
                  {p.tag}
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className="font-display text-2xl font-bold">{p.price}</span>
                <button className="rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-background transition-transform group-hover:scale-105">
                  Add to bag
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 pb-24">
      <div className="relative mx-auto flex max-w-7xl flex-col items-center overflow-hidden rounded-[2.5rem] bg-sunset px-8 py-20 text-center text-primary-foreground md:py-28">
        <div
          aria-hidden
          className="absolute -top-20 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, white, transparent 60%)" }}
        />
        <p className="relative text-xs font-semibold uppercase tracking-[0.3em] opacity-90">
          Join the glow list
        </p>
        <h2 className="relative mt-4 max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">
          Get 15% off your first SOLARA + a daily SPF reminder.
        </h2>
        <form className="relative mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            placeholder="your@email.com"
            className="flex-1 rounded-full bg-background/15 px-6 py-3.5 text-sm text-background placeholder:text-background/60 outline-none ring-2 ring-transparent backdrop-blur transition focus:bg-background/25 focus:ring-background/40"
          />
          <button className="rounded-full bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-transform hover:scale-105">
            Get my code
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
        <div>
          <p className="font-display text-lg font-bold">
            SOLARA<span className="text-primary">.</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Solara Skin Co. Reef-safe & cruelty-free.
          </p>
        </div>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">Instagram</a>
          <a href="#" className="hover:text-foreground">TikTok</a>
          <a href="#" className="hover:text-foreground">Stockists</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <Marquee />
      <Magazine />
      <Ingredients />
      <Shop />
      <CTA />
      <Footer />
    </main>
  );
}
