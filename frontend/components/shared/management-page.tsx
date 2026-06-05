"use client";

import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type TableRow = Record<string, string>;

type FilterField = {
  label: string;
  options?: string[];
};

type ManagementPageProps = {
  title: string;
  description: string;
  actionLabel: string;
  searchPlaceholder: string;
  filters: FilterField[];
  tableTitle: string;
  tableDescription: string;
  columns: string[];
  rows: TableRow[];
};

export function ManagementPage({
  title,
  description,
  actionLabel,
  searchPlaceholder,
  filters,
  tableTitle,
  tableDescription,
  columns,
  rows,
}: ManagementPageProps) {
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    const keyword = search.toLowerCase();

    return rows.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(keyword),
    );
  }, [rows, search]);

  return (
    <DashboardLayout>
      <section className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900">
              {title}
            </h1>
            <p className="mt-3 text-sm font-medium text-slate-500">
              {description}
            </p>
          </div>

          <Button className="h-[50px] rounded-2xl bg-emerald-500 px-7 text-sm font-extrabold hover:bg-emerald-600">
            <Plus size={16} className="mr-2" />
            {actionLabel}
          </Button>
        </div>

        <Card className="rounded-3xl border-slate-200 shadow-none">
          <CardContent className="p-6">
            <div className="grid gap-5 xl:grid-cols-[260px_repeat(3,160px)_76px]">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  className="h-11 rounded-[14px] bg-slate-50 pl-11 font-bold text-slate-700"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {filters.map((filter) => (
                <select
                  key={filter.label}
                  className="h-11 rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700"
                  defaultValue=""
                >
                  <option value="">{filter.label}</option>
                  {filter.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ))}

              <Button className="h-11 rounded-[14px] bg-slate-950 text-xs font-extrabold hover:bg-slate-800">
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-none">
          <CardContent className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-extrabold text-slate-900">
                {tableTitle}
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {tableDescription}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    {columns.map((column, index) => (
                      <th
                        key={column}
                        className={`px-3 py-4 text-left text-xs font-extrabold text-slate-500 ${
                          index === 0 ? "rounded-l-2xl" : ""
                        } ${
                          index === columns.length - 1 ? "rounded-r-2xl" : ""
                        }`}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, rowIndex) => (
                    <tr
                      key={`${rowIndex}-${Object.values(row).join("-")}`}
                      className={rowIndex % 2 === 1 ? "bg-slate-50/70" : ""}
                    >
                      {columns.map((column, columnIndex) => (
                        <td
                          key={column}
                          className={`px-3 py-4 font-semibold ${
                            columnIndex === 0
                              ? "text-slate-700"
                              : "text-slate-900"
                          } ${
                            rowIndex % 2 === 1 && columnIndex === 0
                              ? "rounded-l-xl"
                              : ""
                          } ${
                            rowIndex % 2 === 1 &&
                            columnIndex === columns.length - 1
                              ? "rounded-r-xl"
                              : ""
                          }`}
                        >
                          {row[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-[14px] border border-slate-200 bg-white px-6 py-3 text-xs font-semibold text-slate-500">
              Menampilkan semua {filteredRows.length} data
            </div>
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
}
