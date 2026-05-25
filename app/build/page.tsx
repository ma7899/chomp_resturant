import type { Metadata } from "next";
import BuildFlow from "@/components/BuildFlow";

export const metadata: Metadata = {
  title: "ساندویچ خودت رو بساز",
  description:
    "قدم به قدم ساندویچ مخصوص خودت رو بساز؛ یک پایه انتخاب کن، پروتئین، پنیر، سبزیجات و سس‌های دلخواه رو اضافه کن.",
};

export default function BuildPage({
  searchParams,
}: {
  searchParams: { sandwich?: string };
}) {
  return <BuildFlow initialSlug={searchParams.sandwich} />;
}
