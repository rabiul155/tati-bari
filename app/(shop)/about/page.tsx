import type { Metadata } from "next";
import Link from "next/link";
import { ContactLinks, getContactLinks } from "@/components/shop/contact-links";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About & contact",
  description: `The story behind ${site.name}, and how to reach us.`,
  alternates: { canonical: "/about" },
};

const STEPS = [
  "Choose your sarees and place the order with your phone number and address.",
  "We check the saree and confirm your order with you.",
  "Your saree is packed and handed to a courier.",
  "You pay in cash when it arrives.",
];

// Placeholder copy; replace with the real brand story.
export default function AboutPage() {
  const hasContact = getContactLinks().length > 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-10">
      <section className="flex flex-col gap-4">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">About {site.name}</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Tangail has been famous for its handloom sarees for generations. Each saree is woven by
          hand, thread by thread, which is why no two are exactly alike.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          We work directly with weavers in Tangail, so you get authentic sarees at fair prices,
          without the middlemen. Every saree is checked before it is sent to you.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-semibold">How ordering works</h2>
        <ol className="flex flex-col gap-3">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="contact" className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-2xl font-semibold">Contact us</h2>
        <p className="text-muted-foreground">
          Questions about a saree, your order or delivery? We are happy to help.
        </p>
        {hasContact ? (
          <ContactLinks className="flex flex-col gap-2 font-medium" />
        ) : (
          <p className="text-sm text-muted-foreground">Contact details coming soon.</p>
        )}
        <p className="text-sm text-muted-foreground">{site.address}</p>
      </section>

      <Link href="/shop" className={buttonVariants({ size: "lg", className: "w-fit px-5" })}>
        Browse sarees
      </Link>
    </div>
  );
}
