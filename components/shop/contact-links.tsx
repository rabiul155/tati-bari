import { site } from "@/lib/site";

// Contact and social links from lib/site.ts; unset ones are skipped.
export function getContactLinks() {
  const phone: string = site.phone;
  const whatsapp: string = site.whatsapp;
  const email: string = site.email;
  const links: { label: string; href: string; value: string }[] = [
    { value: phone, label: `কল করুন ${phone}`, href: `tel:${phone}` },
    { value: whatsapp, label: "WhatsApp", href: `https://wa.me/${whatsapp}` },
    { value: email, label: email, href: `mailto:${email}` },
    { value: site.facebookUrl, label: "Facebook", href: site.facebookUrl },
    { value: site.instagramUrl, label: "Instagram", href: site.instagramUrl },
  ];
  return links.filter((link) => link.value !== "");
}

export function ContactLinks({ className }: { className?: string }) {
  const links = getContactLinks();
  if (links.length === 0) return null;

  return (
    <ul className={className}>
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            className="underline-offset-4 hover:underline"
            {...(link.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
