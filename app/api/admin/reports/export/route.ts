import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  resolveRange,
  getSalesReport,
  toCSV,
  type RangeKey,
} from "@/lib/server/reports";

/**
 * GET /api/admin/reports/export?range=month&type=sandwiches&from=&to=
 * Streams a UTF-8 CSV (Excel-friendly) for the chosen report. Admin only.
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const url = new URL(req.url);
  const range = (url.searchParams.get("range") ?? "month") as RangeKey;
  const type = url.searchParams.get("type") ?? "daily";
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;

  const { from: f, to: t } = resolveRange(range, from, to);
  const report = await getSalesReport(f, t);

  let csv = "";
  let filename = "report.csv";

  if (type === "sandwiches") {
    csv = toCSV(
      ["ساندویچ", "تعداد", "درآمد"],
      report.sandwiches.map((s) => [s.name, s.qty, s.revenue]),
    );
    filename = "sandwiches.csv";
  } else if (type === "ingredients") {
    csv = toCSV(
      ["ماده", "مصرف"],
      report.ingredients.map((s) => [s.name, s.qty]),
    );
    filename = "ingredients.csv";
  } else {
    csv = toCSV(
      ["تاریخ", "تعداد سفارش", "درآمد"],
      report.daily.map((d) => [d.date, d.orders, d.revenue]),
    );
    filename = "daily-sales.csv";
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
