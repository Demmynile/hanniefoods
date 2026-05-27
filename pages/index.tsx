import { memo, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductSlider } from "@/components/ProductSlider";
import { HomeSkeleton } from "@/components/Skeletons";
import { useProducts } from "@/hooks/useProducts";
import {
  CalendarDays,
  Forward,
  HelpCircle,
  Heart,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  PartyPopper,
  Search,
  Share2,
  ShoppingBag,
  Star,
  Truck,
  Twitter,
  Utensils,
  Users,
} from "lucide-react";

const HomePage = memo(function HomePage() {
  const router = useRouter();
  const { products, categories: rawCategories, isLoading } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared" | "failed">("idle");
  const [forwardStatus, setForwardStatus] = useState<"idle" | "opened" | "copied" | "failed">("idle");
  const contactLocation = "LANE 9, NO. 14 OLAGBAYE COMMUNITY, BEHIND BEULAH SCHOOL ADEWUMMI";
  const contactPhones = ["+2349165534161", "+447424855810"];
  const contactEmail = "hanniefoodhub@gmail.com";
  const contactUrl = "https://instagram.com/hannie_foodhub";

  const contactText = `Contact Hannies Foods\nLocation: ${contactLocation}\nPhone: ${contactPhones.join(" / ")}\nEmail: ${contactEmail}\nInstagram: https://instagram.com/hannie_foodhub\nWhatsApp: https://wa.me/447424855810`;
  const forwardMessage = `${contactText}\n${contactUrl}`;

  const handleForwardContact = async () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(forwardMessage)}`;

    try {
      const win = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      if (win) {
        setForwardStatus("opened");
        return;
      }
      // Popup was blocked — fall through to clipboard
      throw new Error("popup blocked");
    } catch {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(forwardMessage);
        setForwardStatus("copied");
        return;
      }

      setForwardStatus("failed");
    }
  };

  const handleShareContact = async () => {
    try {
      if (navigator.share) {
        const shareData = {
          title: "Hannies Foods Contact",
          text: contactText,
          url: contactUrl,
        };

        if (!navigator.canShare || navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setShareStatus("shared");
          return;
        }
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${contactText}\n${contactUrl}`);
        setShareStatus("copied");
        return;
      }

      window.alert(`${contactText}\n${contactUrl}`);
      setShareStatus("shared");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setShareStatus("idle");
        return;
      }

      setShareStatus("failed");
    }
  };

  useEffect(() => {
    if (shareStatus === "idle") {
      return;
    }

    const timer = window.setTimeout(() => {
      setShareStatus("idle");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [shareStatus]);

  useEffect(() => {
    if (forwardStatus === "idle") {
      return;
    }

    const timer = window.setTimeout(() => {
      setForwardStatus("idle");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [forwardStatus]);

  // Remove duplicate categories
  const categories = useMemo(() => {
    return rawCategories.reduce((acc, cat) => {
      const exists = acc.some(c => (c.id || c.slug) === (cat.id || cat.slug));
      return exists ? acc : [...acc, cat];
    }, [] as typeof rawCategories);
  }, [rawCategories]);

  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured).slice(0, 4),
    [products]
  );

  const customerMoments = [
    {
      title: "Family Cooking Week",
      description: "Stock up on staples, proteins, and vegetables in one smooth order.",
      icon: ShoppingBag,
      tone: "from-amber-200/60 via-amber-100/35 to-white",
    },
    {
      title: "Busy Workday Meals",
      description: "Quick options that help you cook faster without sacrificing taste.",
      icon: Truck,
      tone: "from-sky-200/60 via-blue-100/35 to-white",
    },
    {
      title: "Weekend Hosting",
      description: "Prepare for guests with bold ingredients and party-ready food picks.",
      icon: Heart,
      tone: "from-rose-200/60 via-pink-100/35 to-white",
    },
  ] as const;

  const customerVoices = [
    {
      name: "Amaka",
      message: "The ingredients arrived fresh and exactly what I needed for my Sunday soup prep.",
    },
    {
      name: "Tunde",
      message: "I use Hannies Foods every week now. Easy ordering and everything is reliable.",
    },
    {
      name: "Sade",
      message: "Their product variety saves me from visiting multiple stores after work.",
    },
  ] as const;

  const familyEventPicks = useMemo(() => {
    return categories
      .map((category) => {
        const items = products.filter((product) => product.category.slug === category.slug);
        return {
          id: category.id,
          title: category.title,
          slug: category.slug || category.id,
          count: items.length,
          samples: items.slice(0, 2).map((item) => item.title),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [categories, products]);

  const mealIdeas = [
    {
      title: "Breakfast Prep",
      description: "Quick ingredients for morning meals before work and school.",
      icon: CalendarDays,
      accent: "from-amber-200/60 via-orange-100/35 to-white",
    },
    {
      title: "Soup Night",
      description: "Rich spices, proteins, and pantry essentials for hearty pots.",
      icon: Utensils,
      accent: "from-emerald-200/60 via-emerald-100/35 to-white",
    },
    {
      title: "Weekend Party",
      description: "Bulk-friendly picks and crowd favorites for family gatherings.",
      icon: PartyPopper,
      accent: "from-rose-200/60 via-pink-100/35 to-white",
    },
  ] as const;

  const faqs = [
    {
      question: "Can I order for a family event in one checkout?",
      answer: "Yes. Add everything to your cart and place one order for your event needs.",
    },
    {
      question: "Do you support same-day urgent food orders?",
      answer: "Yes, where available. Contact us quickly and we will guide you on the fastest option.",
    },
    {
      question: "Can I ask for product recommendations?",
      answer: "Absolutely. Use our contact options and we will suggest items based on your meal plan.",
    },
  ] as const;

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      void router.push("/products");
      return;
    }

    void router.push(`/products?q=${encodeURIComponent(query)}`);
  };

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
      <div className="flex flex-col gap-16 lg:gap-20">
        <section className="motion-rise-in grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center gap-6">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-700">
              Food Market
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-stone-900 [font-family:var(--font-display)] lg:text-5xl">
              Curated food essentials delivered with a modern pantry vibe.
            </h1>
            <p className="max-w-xl text-base text-stone-600">
              Build your weekly drop with fresh produce, pantry upgrades, and
              ready-to-heat meals. All sourced from trusted local partners.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="motion-rise-in rounded-3xl border border-stone-200/70 bg-white/80 px-4 py-3 shadow-xl" style={{ animationDelay: "100ms" }}>
                <p className="text-xs uppercase tracking-widest text-stone-500">
                  Delivery
                </p>
                <p className="text-lg font-semibold text-stone-900">Same day</p>
              </div>
              <div className="motion-rise-in rounded-3xl border border-stone-200/70 bg-white/80 px-4 py-3 shadow-xl" style={{ animationDelay: "180ms" }}>
                <p className="text-xs uppercase tracking-widest text-stone-500">
                  Curations
                </p>
                <p className="text-lg font-semibold text-stone-900">52 drops</p>
              </div>
              <div className="motion-rise-in rounded-3xl border border-stone-200/70 bg-white/80 px-4 py-3 shadow-xl" style={{ animationDelay: "260ms" }}>
                <p className="text-xs uppercase tracking-widest text-stone-500">
                  Favorites
                </p>
                <p className="text-lg font-semibold text-stone-900">Top rated</p>
              </div>
            </div>
          </div>
          <ProductSlider products={featuredProducts} />
        </section>

        <section className="motion-rise-in rounded-3xl border-2 border-stone-300/80 bg-white/70 p-5 shadow-lg md:p-7" style={{ animationDelay: "140ms" }}>
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)]">
              Search Products
            </h2>

            <form onSubmit={handleSearchSubmit} className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by product name, category, or keyword"
                  className="w-full rounded-2xl border-2 border-stone-400/90 bg-white px-12 py-3.5 text-sm text-stone-900 outline-none transition focus:border-amber-600 focus:ring-4 focus:ring-amber-200/60 sm:text-base"
                  aria-label="Search products"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl border-2 border-stone-800 bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-stone-800 sm:whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="motion-rise-in flex flex-col gap-6" style={{ animationDelay: "180ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)]">
              Shop by category
            </h2>
            <span className="text-sm text-stone-500">
              {categories.length} categories available
            </span>
          </div>
          <CategoryGrid
            categories={categories}
            products={products}
          />
        </section>

        <section className="motion-rise-in relative overflow-hidden rounded-4xl border border-stone-300/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(255,247,237,0.85)_50%,rgba(240,253,250,0.85)_100%)] p-6 shadow-[0_24px_60px_rgba(120,113,108,0.16)] md:p-8" style={{ animationDelay: "220ms" }}>
          <div className="motion-float-slow pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl" />
          <div className="motion-float-reverse pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-teal-300/30 blur-3xl" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-800 animate-pulse">
                  <Users size={14} />
                  Customer First
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-stone-900 [font-family:var(--font-display)] md:text-3xl">
                  Built Around Real Customer Routines
                </h2>
              </div>
              <span className="rounded-full border border-stone-300/80 bg-white/80 px-4 py-2 text-sm font-medium text-stone-700 transition hover:scale-105">
                Flexible shopping for every home
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {customerMoments.map((moment, index) => {
                const Icon = moment.icon;

                return (
                  <article
                    key={moment.title}
                    className={`motion-rise-in motion-drift-x group rounded-2xl border border-stone-300/70 bg-linear-to-br ${moment.tone} p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(120,113,108,0.18)]`}
                    style={{ animationDelay: `${index * 120 + 300}ms` }}
                  >
                    <div className="mb-4 inline-flex rounded-xl border border-stone-300/80 bg-white/80 p-2 text-stone-700 transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900">{moment.title}</h3>
                    <p className="mt-2 text-sm text-stone-600">{moment.description}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-stone-700">
                      Always customer-ready
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="motion-rise-in grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" style={{ animationDelay: "320ms" }}>
          <div className="rounded-3xl border border-stone-300/70 bg-white/80 p-6 shadow-lg md:p-7">
            <h2 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)]">
              What Customers Are Saying
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Real voices from shoppers who use Hannies Foods for weekly meals.
            </p>

            <div className="mt-6 space-y-4">
              {customerVoices.map((voice, index) => (
                <article
                  key={voice.name}
                  className="motion-rise-in group rounded-2xl border-2 border-stone-300/75 bg-white p-4 transition duration-300 hover:border-amber-400 hover:-translate-y-0.5"
                  style={{ animationDelay: `${index * 120 + 360}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-stone-700">"{voice.message}"</p>
                      <h3 className="mt-3 text-base font-semibold text-stone-900">{voice.name}</h3>
                    </div>
                    <Star size={16} className="text-amber-600" />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-300/70 bg-white/80 p-6 shadow-lg md:p-7">
            <h2 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)]">
              Your Shopping Journey
            </h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-stone-300/70 bg-white p-4 transition duration-300 hover:shadow-md">
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-stone-600">
                  <MessageCircle size={16} />
                  Tell Us What You Need
                </p>
                <p className="mt-2 text-sm text-stone-700">
                  Search quickly, ask questions, and choose products that match your meal plans.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-300/70 bg-white p-4 transition duration-300 hover:shadow-md">
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-stone-600">
                  <ShoppingBag size={16} />
                  Fill Your Basket
                </p>
                <p className="mt-2 text-sm text-stone-700">
                  Pick from trusted ingredients for soups, family dinners, and event cooking.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-300/70 bg-white p-4 transition duration-300 hover:shadow-md">
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-stone-600">
                  <Truck size={16} />
                  Receive and Enjoy
                </p>
                <p className="mt-2 text-sm text-stone-700">
                  We deliver to your doorstep so you can cook, host, and enjoy with less stress.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="motion-rise-in rounded-4xl border border-stone-300/70 bg-white/80 p-6 shadow-lg md:p-8" style={{ animationDelay: "380ms" }}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)] md:text-3xl">
              Frequently Bought for Family Events
            </h2>
            <span className="rounded-full border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
              Party and celebration ready
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {familyEventPicks.map((pick, index) => (
              <a
                key={pick.id}
                href={`/category/${pick.slug}`}
                className="motion-rise-in group rounded-2xl border-2 border-stone-300/80 bg-linear-to-br from-white via-stone-50 to-amber-50 p-4 transition duration-300 hover:-translate-y-1 hover:border-amber-400"
                style={{ animationDelay: `${index * 100 + 420}ms` }}
              >
                <p className="text-lg font-semibold text-stone-900">{pick.title}</p>
                <p className="mt-1 text-sm text-stone-600">
                  {pick.samples.join(" • ") || "Customer event favorites"}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                  {pick.count} products
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className="motion-rise-in grid gap-5 lg:grid-cols-[1.1fr_0.9fr]" style={{ animationDelay: "450ms" }}>
          <div className="rounded-3xl border border-stone-300/70 bg-white/80 p-6 shadow-lg md:p-7">
            <h2 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)]">
              Meal Ideas by Occasion
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Start from your occasion and we help you find what to cook with ease.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {mealIdeas.map((idea, index) => {
                const Icon = idea.icon;

                return (
                  <article
                    key={idea.title}
                    className={`motion-rise-in group rounded-2xl border border-stone-300/75 bg-linear-to-br ${idea.accent} p-4 transition duration-300 hover:-translate-y-1`}
                    style={{ animationDelay: `${index * 100 + 500}ms` }}
                  >
                    <div className="mb-3 inline-flex rounded-xl border border-stone-300/80 bg-white/80 p-2 text-stone-700 group-hover:scale-110 transition">
                      <Icon size={18} />
                    </div>
                    <p className="text-base font-semibold text-stone-900">{idea.title}</p>
                    <p className="mt-1 text-sm text-stone-600">{idea.description}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-300/70 bg-white/80 p-6 shadow-lg md:p-7">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-stone-900 [font-family:var(--font-display)]">
              <HelpCircle size={22} />
              Customer FAQ and Support
            </h2>

            <div className="mt-5 space-y-3">
              {faqs.map((faq, index) => (
                <details
                  key={faq.question}
                  className="motion-rise-in rounded-2xl border border-stone-300/75 bg-white p-4"
                  style={{ animationDelay: `${index * 80 + 520}ms` }}
                >
                  <summary className="cursor-pointer text-sm font-semibold text-stone-800">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-sm text-stone-600">{faq.answer}</p>
                </details>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border-2 border-amber-300/80 bg-amber-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
                Need Fast Help?
              </p>
              <p className="mt-1 text-sm text-stone-700">
                Reach our support team for order guidance and product recommendations.
              </p>
              <a
                href="tel:+447459270545"
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-500 bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                <PhoneCall size={16} />
                Call Support
              </a>
            </div>
          </div>
        </section>

        <section className="motion-rise-in rounded-3xl border border-stone-200/70 bg-white/80 p-6 shadow-xl md:p-8" style={{ animationDelay: "500ms" }}>
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)]">
              Contact Us
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-stone-200/70 bg-white p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-stone-500">
                  <MapPin size={16} />
                  Location
                </p>
                <p className="text-sm text-stone-700">
                  {contactLocation}
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200/70 bg-white p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-stone-500">
                  <Phone size={16} />
                  Phone & Email
                </p>
                <a href="tel:+2349165534161" className="block text-sm font-medium text-stone-800 transition hover:text-amber-700">
                  {contactPhones[0]}
                </a>
                <a href="tel:+447424855810" className="mt-1 block text-sm font-medium text-stone-800 transition hover:text-amber-700">
                  {contactPhones[1]}
                </a>
                <a href={`mailto:${contactEmail}`} className="mt-2 block text-sm font-medium text-stone-800 transition hover:text-amber-700">
                  {contactEmail}
                </a>
              </div>

              <div className="rounded-2xl border border-stone-200/70 bg-white p-4 sm:col-span-2 lg:col-span-1">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-stone-500">
                  Social Media
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-stone-700">
                  <a
                    href="https://instagram.com/hannie_foodhub"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 transition hover:border-amber-300 hover:text-amber-700"
                  >
                    <Instagram size={16} />
                    @Hannie_Foodhub
                  </a>
                  <a
                    href="https://wa.me/447424855810"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 transition hover:border-amber-300 hover:text-amber-700"
                  >
                    <MessageCircle size={16} />
                    WhatsApp +447424855810
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleForwardContact}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:border-amber-300 hover:text-amber-700"
              >
                <Forward size={16} />
                {forwardStatus === "idle" && "Forward Contact"}
                {forwardStatus === "opened" && "Opening WhatsApp"}
                {forwardStatus === "copied" && "Copied to Clipboard"}
                {forwardStatus === "failed" && "Try Again"}
              </button>
              <button
                type="button"
                onClick={handleShareContact}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:border-amber-300 hover:text-amber-700"
              >
                <Share2 size={16} />
                {shareStatus === "idle" && "Share Contact"}
                {shareStatus === "shared" && "Shared"}
                {shareStatus === "copied" && "Copied"}
                {shareStatus === "failed" && "Try Again"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
});

export default HomePage;
