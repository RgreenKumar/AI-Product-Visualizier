import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Camera, Moon, ShieldCheck, Sparkles, Sun, Wand2, Zap } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { AuroraBackground } from "@/components/AuroraBackground";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { products } from "@/data/products";

export const Route = createFileRoute("/")({
  component: Index,
});

const steps = [
  { icon: Camera, title: "Upload your photo", copy: "One clear, well-lit photo is all our engine needs." },
  { icon: Wand2, title: "Pick any product", copy: "Shirts, dresses, sarees, shoes, watches, jewellery and more." },
  { icon: Sparkles, title: "See it on you", copy: "Photoreal results in seconds, with a before/after slider." },
];

const features = [
  { icon: ShieldCheck, title: "Identity preserved", copy: "Face, hair, skin tone, body pose and background stay exactly as they are." },
  { icon: Zap, title: "Seconds, not studios", copy: "No photoshoot, no changing room — just instant, shareable results." },
  { icon: Sparkles, title: "Every category", copy: "36+ curated products across top wear, ethnic, bottoms, footwear and accessories." },
];

function Index() {
  const { theme, toggleTheme } = useTheme();
  const showcase = products.slice(0, 8);

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />

      <header className="glass sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="size-3.5 text-primary" /> AI Virtual Try-On
            </span>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight lg:text-6xl">
              Wear it before
              <br />
              you <span className="text-gradient-brand">buy it.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground">
              AI VISUALIZER puts any outfit, shoe or accessory on your own photo — keeping your face, hair,
              skin tone, pose and background perfectly intact.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Try it free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass animate-float overflow-hidden rounded-[2.5rem] p-3 shadow-elegant"
          >
            <img
              src={heroImage}
              alt="AI virtual try-on preview of a model wearing a generated outfit"
              className="aspect-[4/5] w-full rounded-[2rem] object-cover"
            />
          </motion.div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-14">
          <h2 className="font-display text-3xl font-bold">How it works</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="glass rounded-3xl p-6 shadow-soft">
                <span className="gradient-brand flex size-11 items-center justify-center rounded-2xl">
                  <step.icon className="size-5 text-primary-foreground" />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Step {index + 1}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-14">
          <h2 className="font-display text-3xl font-bold">Built for real shopping</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="glass rounded-3xl p-6 shadow-soft">
                <feature.icon className="size-6 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-14">
          <h2 className="font-display text-3xl font-bold">A catalog worth trying on</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {showcase.map((product) => (
              <div key={product.id} className="glass overflow-hidden rounded-3xl">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-20 text-center">
          <div className="glass rounded-[2.5rem] p-12 shadow-elegant">
            <h2 className="font-display text-4xl font-bold">Your fitting room is one photo away.</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join AI VISUALIZER and see how anything looks on you — before you spend a rupee.
            </p>
            <Button variant="hero" size="xl" className="mt-8" asChild>
              <Link to="/register">
                Create your free account <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <Logo />
          <p>© {new Date().getFullYear()} AI VISUALIZER. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
