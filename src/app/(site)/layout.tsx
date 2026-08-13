import PageTransition from "@/components/PageTransition";
import SmoothScroll from "@/components/SmoothScroll";

export default function PublicSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PageTransition>
      <SmoothScroll>{children}</SmoothScroll>
    </PageTransition>
  );
}
