import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="heading text-6xl font-black text-brand-500">۴۰۴</h1>
      <p className="text-ink-500 mt-4">صفحه‌ای که دنبالش بودی پیدا نشد.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex">
        برگشت به خانه
      </Link>
    </div>
  );
}
