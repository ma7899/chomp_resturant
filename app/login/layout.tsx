// Hide /login from search engines and from navigation crawlers.
export const dynamic = "force-static";

export const metadata = {
  title: "ورود",
  robots: { index: false, follow: false, nocache: true },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
