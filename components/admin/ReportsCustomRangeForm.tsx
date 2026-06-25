"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian_en from "react-date-object/locales/gregorian_en";

function toPickerValue(iso?: string): DateObject | "" {
  if (!iso) return "";
  return new DateObject({
    date: iso,
    format: "YYYY-MM-DD",
    calendar: gregorian,
    locale: gregorian_en,
  }).convert(persian, persian_fa);
}

function toGregorianIso(date: DateObject): string {
  return date.convert(gregorian, gregorian_en).format("YYYY-MM-DD");
}

export default function ReportsCustomRangeForm({
  from,
  to,
}: {
  from?: string;
  to?: string;
}) {
  const [fromDate, setFromDate] = useState<string | null>(from ?? null);
  const [toDate, setToDate] = useState<string | null>(to ?? null);

  return (
    <form
      action="/admin/reports"
      method="get"
      className="flex flex-wrap items-end gap-3 mb-6 rounded-2xl bg-white border border-ink-100 p-4">
      <input type="hidden" name="range" value="custom" />
      {fromDate && <input type="hidden" name="from" value={fromDate} />}
      {toDate && <input type="hidden" name="to" value={toDate} />}

      <label className="text-sm min-w-52">
        <span className="text-ink-500">از تاریخ</span>
        <div className="relative mt-1">
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            format="YYYY/MM/DD"
            value={toPickerValue(fromDate ?? undefined)}
            onChange={(value) => {
              const d = value instanceof DateObject ? value : null;
              setFromDate(d ? toGregorianIso(d) : null);
            }}
            calendarPosition="bottom-right"
            editable={false}
            containerClassName="w-full"
            inputClass="w-full rounded-xl border border-ink-100 px-3 py-2 pl-10 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition"
          />
          <CalendarDays
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
          />
        </div>
      </label>

      <label className="text-sm min-w-52">
        <span className="text-ink-500">تا تاریخ</span>
        <div className="relative mt-1">
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            format="YYYY/MM/DD"
            value={toPickerValue(toDate ?? undefined)}
            onChange={(value) => {
              const d = value instanceof DateObject ? value : null;
              setToDate(d ? toGregorianIso(d) : null);
            }}
            calendarPosition="bottom-right"
            editable={false}
            containerClassName="w-full"
            inputClass="w-full rounded-xl border border-ink-100 px-3 py-2 pl-10 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition"
          />
          <CalendarDays
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
          />
        </div>
      </label>

      <button className="btn-primary !py-2 !px-4 text-sm">اعمال</button>
    </form>
  );
}
