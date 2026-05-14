import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-sunscreen.jpg";
import textureImg from "@/assets/texture-swatch.jpg";
import lifestyleImg from "@/assets/lifestyle-beach.jpg";
import lineupImg from "@/assets/product-lineup.jpg";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "SOLARA — Sunscreen reimagined for the golden hour" },
      {
        name: "description",
        content:
          "SOLARA is broad-spectrum SPF 50 sunscreen engineered for everyday radiance. Mineral-tinted, reef-safe, dermatologist tested.",
      },
    ],
  }),
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fff7f1] text-[#1a0d0a] font-sans antialiased">
      <Nav />
      <Hero />
      <Marquee />
      <Magazine />
      <Ingredients />
      <Shop />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1a0d0a]/10 bg-[#fff7f1]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="text-xl font-bold tracking-tight">
          SOLARA<span className="text-[#ff6b35]">.</span>
        </a>
        <nav className="hidden gap-8 text-sm font-medium md:flex">
          <a href="#shop" className="hover:text-[#ff6b35]">Shop</a>
          <a href="#science" className="hover:text-[#ff6b35]">Science</a>
          <a href="#story" className="hover:text-[#ff6b35]">Story</a>
          <a href="#journal" className="hover:text-[#ff6b35]">Journal</a>
        </nav>
        <a
          href="#shop"
          className="rounded-full bg-[#1a0d0a] px-5 py-2 text-sm font-medium text-[#fff7f1] transition hover:bg-[#ff6b35]"
        >
          Buy now
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pt-12 pb-20 md:grid-cols-12 md:pt-20">
        <div className="md:col-span-7 md:pt-12">
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.25em] text-[#e84393]">
            Issue 04 · Summer 2026
          </p>
          <h1 className="text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Sunscreen,{" "}
            <span className="bg-gradient-to-r from-[#ff6b35] via-[#f7931e] to-[#e84393] bg-clip-text text-transparent">
              reimagined
            </span>
            <br />
            for the golden hour.
          </h1>
          <p className="mt-8 max-w-xl text-lg text-[#1a0d0a]/70">
            Broad-spectrum SPF 50, weightless on skin, reef-safe to the core.
            Engineered with biotech antioxidants for skin that glows past sunset.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#shop"
              className="rounded-full bg-[#ff6b35] px-8 py-4 text-base font-medium text-white shadow-lg shadow-[#ff6b35]/30 transition hover:bg-[#e84393] hover:shadow-[#e84393]/40"
            >
              Shop SPF 50 — $34
            </a>
            <a
              href="#science"
              className="rounded-full border border-[#1a0d0a]/20 px-8 py-4 text-base font-medium transition hover:bg-[#1a0d0a] hover:text-[#fff7f1]"
            >
              The science
            </a>
          </div>
          <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-[#1a0d0a]/10 pt-8">
            <Stat n="50" label="SPF broad-spectrum" />
            <Stat n="0%" label="Oxybenzone, octinoxate" />
            <Stat n="80m" label="Water-resistant" />
          </dl>
        </div>
        <div className="relative md:col-span-5">
          <div className="absolute -right-20 -top-10 h-80 w-80 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#e84393] opacity-30 blur-3xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <img
              src={heroImg}
              alt="SOLARA sunscreen at golden hour"
              className="h-full w-full object-cover"
              width={1280}
              height={1600}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <dt className="text-3xl font-bold tracking-tight md:text-4xl">{n}</dt>
      <dd className="mt-1 text-xs uppercase tracking-wider text-[#1a0d0a]/60">{label}</dd>
    </div>
  );
}

function Marquee() {
  const items = ["VOGUE", "ALLURE", "BYRDIE", "ELLE", "HARPER'S BAZAAR", "REFINERY29"];
  return (
    <div className="border-y border-[#1a0d0a]/10 bg-[#1a0d0a] py-6 text-[#fff7f1]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-x-10 gap-y-3 px-6 text-xs font-semibold uppercase tracking-[0.3em] opacity-80">
        {items.map((i) => (
          <span key={i}>{i}</span>
        ))}
      </div>
    </div>
  );
}

function Magazine() {
  return (
    <section id="story" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[#e84393]">
            The Journal
          </p>
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            A radiant ritual, made for every skin and every sun.
          </h2>
        </div>
        <a href="#journal" className="hidden text-sm font-medium hover:text-[#ff6b35] md:block">
          Read all stories →
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <article className="md:col-span-7">
          <div className="aspect-[4/3] overflow-hidden rounded-3xl">
            <img
              src={lifestyleImg}
              alt="Applying SOLARA at sunset"
              className="h-full w-full object-cover transition duration-700 hover:scale-105"
              width={1024}
              height={1280}
              loading="lazy"
            />
          </div>
          <p className="mt-5 text-xs uppercase tracking-wider text-[#1a0d0a]/60">Feature · 6 min read</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            Why we engineered SPF that disappears.
          </h3>
          <p className="mt-3 max-w-lg text-[#1a0d0a]/70">
            No white cast. No sticky finish. A hybrid mineral-organic filter that sets
            invisible on every undertone — from porcelain to deep ebony.
          </p>
        </article>

        <div className="grid gap-6 md:col-span-5">
          <article className="rounded-3xl bg-gradient-to-br from-[#ff6b35] to-[#e84393] p-8 text-white">
            <p className="text-xs uppercase tracking-wider opacity-80">Texture study</p>
            <div className="my-5 aspect-square overflow-hidden rounded-2xl">
              <img
                src={textureImg}
                alt="Cream swatch"
                className="h-full w-full object-cover"
                width={1024}
                height={1024}
                loading="lazy"
              />
            </div>
            <h4 className="text-xl font-bold">Whipped, weightless, gone in seconds.</h4>
          </article>

          <article className="rounded-3xl border border-[#1a0d0a]/10 bg-white p-8">
            <p className="text-5xl leading-none text-[#ff6b35]">"</p>
            <p className="mt-2 text-lg font-medium leading-snug">
              The first SPF I've ever worn that I actually forget I'm wearing.
            </p>
            <p className="mt-4 text-sm text-[#1a0d0a]/60">— Dr. Imani Shaw, Dermatologist</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function Ingredients() {
  const items = [
    { tag: "UV", title: "Zinc Oxide 12%", desc: "Non-nano mineral filter for full-spectrum defense." },
    { tag: "UV", title: "Tinosorb S", desc: "Photo-stable filter blocking deep UVA + UVB." },
    { tag: "Bio", title: "Polypodium leucotomos", desc: "Botanical antioxidant proven to reduce sun damage." },
    { tag: "Bio", title: "Niacinamide 4%", desc: "Calms redness and refines tone over time." },
    { tag: "Hyd", title: "Squalane", desc: "Plant-derived hydration without grease." },
    { tag: "Hyd", title: "Hyaluronic Acid", desc: "Locks in moisture across humid and dry days." },
  ];
  return (
    <section id="science" className="border-y border-[#1a0d0a]/10 bg-[#1a0d0a] text-[#fff7f1]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[#f7931e]">
          The Formula
        </p>
        <h2 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
          Six actives. Zero compromises.
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.title} className="bg-[#1a0d0a] p-8 transition hover:bg-[#2a1612]">
              <span className="inline-block rounded-full border border-[#f7931e]/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#f7931e]">
                {i.tag}
              </span>
              <h3 className="mt-5 text-2xl font-bold">{i.title}</h3>
              <p className="mt-3 text-sm text-[#fff7f1]/70">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Shop() {
  const products = [
    { name: "Daily Glow SPF 50", price: "$34", tag: "Bestseller", grad: "from-[#ff6b35] to-[#f7931e]" },
    { name: "Tinted Veil SPF 40", price: "$38", tag: "New", grad: "from-[#e84393] to-[#6c5ce7]" },
    { name: "After-Sun Serum", price: "$28", tag: "Cult", grad: "from-[#f7931e] to-[#e84393]" },
  ];
  return (
    <section id="shop" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[#e84393]">
            The Shop
          </p>
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Built for the way you live in the sun.
          </h2>
        </div>
      </div>
      <div className="mb-10 overflow-hidden rounded-3xl">
        <img
          src={lineupImg}
          alt="SOLARA product lineup"
          className="h-auto w-full"
          width={1280}
          height={960}
          loading="lazy"
        />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {products.map((p) => (
          <article key={p.name} className="group rounded-3xl border border-[#1a0d0a]/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl">
            <div className={`mb-6 aspect-[4/5] rounded-2xl bg-gradient-to-br ${p.grad}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e84393]">
              {p.tag}
            </span>
            <h3 className="mt-2 text-xl font-bold tracking-tight">{p.name}</h3>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-medium">{p.price}</span>
              <button className="rounded-full bg-[#1a0d0a] px-5 py-2 text-sm text-white transition group-hover:bg-[#ff6b35]">
                Add to bag
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff6b35] via-[#e84393] to-[#6c5ce7] p-12 md:p-20">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white, transparent 50%)" }} />
        <div className="relative max-w-2xl text-white">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Get 15% off your first ritual.
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Join the SOLARA letter for sun science, drops, and golden-hour invitations.
          </p>
          <form className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 rounded-full bg-white/15 px-6 py-4 text-white placeholder-white/60 backdrop-blur-sm outline-none ring-1 ring-white/30 focus:bg-white/25"
            />
            <button
              type="submit"
              className="rounded-full bg-white px-8 py-4 font-medium text-[#1a0d0a] transition hover:bg-[#1a0d0a] hover:text-white"
            >
              Sign me up
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#1a0d0a]/10 bg-[#fff7f1]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-4">
        <div className="col-span-2">
          <p className="text-2xl font-bold tracking-tight">SOLARA<span className="text-[#ff6b35]">.</span></p>
          <p className="mt-3 max-w-sm text-sm text-[#1a0d0a]/60">
            Reef-safe, dermatologist tested, made in California with biotech actives from around the world.
          </p>
        </div>
        <FootCol title="Shop" links={["SPF 50", "Tinted Veil", "After-Sun", "Bundles"]} />
        <FootCol title="Company" links={["Story", "Science", "Journal", "Contact"]} />
      </div>
      <div className="border-t border-[#1a0d0a]/10 py-6 text-center text-xs text-[#1a0d0a]/50">
        © 2026 SOLARA Skin Co. All rights reserved.
      </div>
    </footer>
  );
}

function FootCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-[#1a0d0a]/60">
        {links.map((l) => (
          <li key={l}><a href="#" className="hover:text-[#ff6b35]">{l}</a></li>
        ))}
      </ul>
    </div>
  );
}
