import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Link2,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function HomeLanding() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_60%_at_50%_-25%,oklch(0.55_0.18_264/0.18),transparent_55%)] dark:bg-[radial-gradient(ellipse_90%_60%_at_50%_-25%,oklch(0.55_0.2_264/0.28),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] dark:opacity-[0.2] [background-image:linear-gradient(to_right,oklch(0.145_0_0/0.06)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.145_0_0/0.06)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,oklch(0.985_0_0/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.985_0_0/0.05)_1px,transparent_1px)] [background-size:48px_48px]"
          aria-hidden
        />
        <div className="pointer-events-none absolute -right-32 top-20 -z-10 h-96 w-96 rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" aria-hidden />
        <div className="pointer-events-none absolute -left-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-chart-2/15 blur-3xl dark:bg-chart-2/20" aria-hidden />

        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:py-24 lg:gap-16">
          <div className="max-w-xl">
            <Badge variant="secondary" className="mb-5 gap-1.5 border border-border/80 bg-background/60 pl-2 pr-3 shadow-sm backdrop-blur-sm dark:bg-background/40">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              Partner programs
            </Badge>
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-balance md:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
              Run campaigns. Pay partners. See every sale.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
              One place for brands and creators: referral links, store orders, commissions, and dashboards
              so merchants track performance and affiliates see what they have earned.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2 rounded-full px-8 shadow-lg shadow-primary/20 dark:shadow-primary/30">
                <Link to="/register">
                  Get started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-border/80 bg-background/50 px-8 backdrop-blur-sm dark:bg-background/20">
                <Link to="/login">Log in</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Secure sign-in via your identity provider when configured.
            </p>
          </div>

          {/* Product preview */}
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-chart-2/15 blur-2xl dark:from-primary/30 dark:to-chart-2/25" aria-hidden />
            <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl shadow-black/5 backdrop-blur-sm dark:border-border/60 dark:shadow-black/40">
              <div className="border-b border-border/60 bg-muted/40 px-4 py-3 dark:bg-muted/25">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-red-400/90 dark:bg-red-400/70" />
                    <span className="size-2.5 rounded-full bg-amber-400/90 dark:bg-amber-400/70" />
                    <span className="size-2.5 rounded-full bg-emerald-400/90 dark:bg-emerald-400/70" />
                  </div>
                  <span className="ml-2 text-xs font-medium text-muted-foreground">AffilFlow · Preview</span>
                </div>
              </div>
              <CardContent className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/80 bg-background/80 p-3 shadow-sm dark:bg-background/60">
                    <p className="text-xs text-muted-foreground">Sales (30d)</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums">€24,180</p>
                    <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">+12.4%</p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-background/80 p-3 shadow-sm dark:bg-background/60">
                    <p className="text-xs text-muted-foreground">Commissions due</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums">€3,042</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">8 partners</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/25 p-3 dark:bg-muted/15">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Top partners</span>
                    <BarChart3 className="size-4 text-muted-foreground" />
                  </div>
                  <div className="mt-3 space-y-2">
                    {[72, 54, 38].map((pct, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted dark:bg-muted/80">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                          {pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="border-b bg-muted/35 py-20 dark:bg-muted/15">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              Built for both sides of the partnership
            </h2>
            <p className="mt-3 text-muted-foreground">
              Same platform — tailored views for merchants and for promoters.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Card
              id="merchants"
              className="scroll-mt-24 border border-border/80 bg-card/80 shadow-lg shadow-black/[0.03] backdrop-blur-sm transition-shadow hover:shadow-xl dark:border-border/60 dark:bg-card/60 dark:shadow-black/30"
            >
              <CardHeader className="space-y-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/15 dark:bg-primary/20">
                  <Store className="size-6" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl">For companies</CardTitle>
                  <CardDescription className="mt-2 text-base leading-relaxed">
                    Launch your program on Shopify or WooCommerce. Invite creators, attribute orders, and see
                    who drives revenue before you run payouts.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Link2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    Shareable invite links & optional public campaigns listing
                  </li>
                  <li className="flex gap-2">
                    <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary" />
                    Webhook-driven orders & commission pipeline
                  </li>
                  <li className="flex gap-2">
                    <BarChart3 className="mt-0.5 size-4 shrink-0 text-primary" />
                    Dashboard: sales, buckets, partner leaderboard
                  </li>
                </ul>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Link to="/company/overview" className={cn(buttonVariants(), "gap-1.5 shadow-md shadow-primary/15")}>
                    Company dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link to="/company/invites" className={cn(buttonVariants({ variant: "outline" }), "border-border/80")}>
                    Invite a partner
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card
              id="affiliates"
              className="scroll-mt-24 border border-border/80 bg-card/80 shadow-lg shadow-black/[0.03] backdrop-blur-sm transition-shadow hover:shadow-xl dark:border-border/60 dark:bg-card/60 dark:shadow-black/30"
            >
              <CardHeader className="space-y-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/15 dark:bg-primary/20">
                  <Users className="size-6" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl">For affiliates</CardTitle>
                  <CardDescription className="mt-2 text-base leading-relaxed">
                    Join programs, share your link, and track earnings per brand — what is building toward the
                    next payout and what has already been paid.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Users className="mt-0.5 size-4 shrink-0 text-primary" />
                    Browse campaigns when merchants enable discovery
                  </li>
                  <li className="flex gap-2">
                    <Wallet className="mt-0.5 size-4 shrink-0 text-primary" />
                    Per-program accrued vs paid, with order counts
                  </li>
                  <li className="flex gap-2">
                    <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary" />
                    Running totals aligned with each brand’s payout rhythm
                  </li>
                </ul>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Link to="/affiliate/dashboard" className={cn(buttonVariants(), "gap-1.5 shadow-md shadow-primary/15")}>
                    Affiliate dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link to="/campaigns" className={cn(buttonVariants({ variant: "outline" }), "border-border/80")}>
                    Browse campaigns
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center font-serif text-3xl font-semibold tracking-tight md:text-4xl">Inside the product</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Today each merchant runs one program scope; richer “campaign” objects can layer on later.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border border-border/80 bg-gradient-to-b from-card to-muted/25 dark:to-muted/10">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted/80 dark:bg-muted/50">
                  <Store className="size-5" />
                </div>
                <CardTitle className="font-serif text-lg">Programs & brands</CardTitle>
                <CardDescription className="leading-relaxed">
                  Organize partners and commissions around each merchant account — your operational “campaign”
                  boundary until dedicated campaign entities ship.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border border-border/80 bg-gradient-to-b from-card to-muted/25 dark:to-muted/10">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted/80 dark:bg-muted/50">
                  <BarChart3 className="size-5" />
                </div>
                <CardTitle className="font-serif text-lg">Merchant analytics</CardTitle>
                <CardDescription className="leading-relaxed">
                  Orders, revenue, commission states (pending, approved, paid), and a leaderboard of top
                  affiliates by attributed volume.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border border-border/80 bg-gradient-to-b from-card to-muted/25 dark:to-muted/10 sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted/80 dark:bg-muted/50">
                  <Wallet className="size-5" />
                </div>
                <CardTitle className="font-serif text-lg">Affiliate earnings</CardTitle>
                <CardDescription className="leading-relaxed">
                  Clear accrued vs paid totals per program, so promoters know what is outstanding and what
                  already landed — payout timing follows each merchant’s schedule.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t bg-muted/25 py-10 dark:bg-muted/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-muted-foreground md:flex-row md:text-left">
          <p className="font-medium text-foreground">AffilFlow</p>
          <p className="max-w-md text-xs">
            Developers: set API URL and OIDC env vars in <code className="rounded bg-muted px-1 py-0.5 text-[0.8rem]">.env.local</code>.
            Paste a dev JWT on dashboard pages until full SSO is connected.
          </p>
        </div>
      </footer>
    </div>
  );
}
