import type { Metadata } from "next";
import { photos, photographerUrl, photoPageUrl, type Photo } from "@/config/photos";
import { Container, PageHero } from "@/components/marketing/section";
import { TextLink } from "@/components/marketing/blocks";

export const metadata: Metadata = {
  title: "Photo credits",
  description: "The photographers whose work appears on the Zaffre website.",
  alternates: { canonical: "/credits" },
};

const unique = Object.values<Photo>(photos).filter((photo, i, all) => all.findIndex((p) => p.id === photo.id) === i);

export default function CreditsPage() {
  return (
    <>
      <PageHero
        title="Photo credits"
        body="The photographs on this site were shared freely on Unsplash by the people below. None of the people pictured are Zaffre staff or clients, and nobody shown is endorsing us."
      />
      <Container className="py-14 sm:py-20">
        <ul className="border-t border-foreground">
          {unique.map((photo) => (
            <li key={photo.id} className="grid gap-x-10 gap-y-1 border-b border-border py-5 md:grid-cols-12">
              <p className="font-semibold md:col-span-4">
                <TextLink href={photographerUrl(photo)}>{photo.author}</TextLink>
              </p>
              <p className="text-muted md:col-span-6">{photo.alt}</p>
              <p className="md:col-span-2 md:text-right">
                <TextLink href={photoPageUrl(photo)}>View photo</TextLink>
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-[62ch] text-muted">
          Used under the <TextLink href="https://unsplash.com/license">Unsplash License</TextLink>. If you are the photographer of one of these pictures and would like it removed or credited differently, write to us and we will do it.
        </p>
      </Container>
    </>
  );
}
