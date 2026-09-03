"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DEFAULT_QUERY_KEY,
  isQueryKey,
  QUERY_DEFINITIONS,
  QUERY_REGISTRY,
  runQuery,
} from "@/lib/councillor/queries/registry";
import type {
  QueryBundles,
  QueryDefinition,
  QueryFilters,
  QueryKey,
} from "@/lib/councillor/queries/types";
import { FIXED_CATEGORIES, MICRO_AREAS } from "@/lib/councillor/types";
import { cn } from "@/lib/utils";
import { QueryResult, type QueryPanel } from "./QueryResult";

export function QueryBuilder({ bundles }: { bundles: QueryBundles }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedKeys = readQueryKeys(searchParams);
  const initialQueryKeys = requestedKeys.length
    ? requestedKeys
    : [DEFAULT_QUERY_KEY];
  const initialCategories = supportsFilter(initialQueryKeys, "category")
    ? readAllowedValues(searchParams, "category", FIXED_CATEGORIES)
    : [];
  const initialFsas = supportsFilter(initialQueryKeys, "fsa")
    ? readAllowedValues(searchParams, "fsa", MICRO_AREAS)
    : [];

  const [queryKeys, setQueryKeys] =
    useState<QueryKey[]>(initialQueryKeys);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [fsas, setFsas] = useState<string[]>(initialFsas);
  const [results, setResults] = useState<QueryPanel[] | null>(() =>
    requestedKeys.length
      ? buildQueryPanels(
          initialQueryKeys,
          initialCategories,
          initialFsas,
          bundles
        )
      : null
  );

  const showsCategories = supportsFilter(queryKeys, "category");
  const showsFsas = supportsFilter(queryKeys, "fsa");
  const resultCount = countQueryPanels(queryKeys, categories, fsas);

  function resetResults() {
    setResults(null);
    router.replace("/ward7/query", { scroll: false });
  }

  function toggleSignal(key: QueryKey) {
    const nextKeys = toggleValue(queryKeys, key);
    setQueryKeys(nextKeys);
    if (!supportsFilter(nextKeys, "category")) setCategories([]);
    if (!supportsFilter(nextKeys, "fsa")) setFsas([]);
    resetResults();
  }

  function toggleCategory(category: string) {
    setCategories(toggleValue(categories, category));
    resetResults();
  }

  function toggleFsa(fsa: string) {
    setFsas(toggleValue(fsas, fsa));
    resetResults();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!queryKeys.length) return;

    setResults(buildQueryPanels(queryKeys, categories, fsas, bundles));

    const params = new URLSearchParams();
    queryKeys.forEach((key) => params.append("type", key));
    if (showsCategories) {
      categories.forEach((category) => params.append("category", category));
    }
    if (showsFsas) fsas.forEach((fsa) => params.append("fsa", fsa));
    router.replace(`/ward7/query?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-5">
      <Card className="gap-4">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Build your query
          </p>
          <p className="max-w-3xl text-sm text-slate-500">
            Select multiple signals and filters. Each compatible combination
            becomes its own result card, making comparisons easier to scan.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <MultiSelect
              legend="Signal types"
              help="Choose one or more views to compare."
              options={QUERY_DEFINITIONS.map((query) => ({
                value: query.key,
                label: query.label,
                description: query.description,
              }))}
              selected={queryKeys}
              onToggle={toggleSignal}
              gridClassName="md:grid-cols-2 xl:grid-cols-4"
            />

            {showsCategories || showsFsas ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {showsCategories ? (
                  <MultiSelect
                    legend="Categories"
                    help="Each selected category gets a separate card. Leave all unchecked for one combined view."
                    options={FIXED_CATEGORIES.map((category) => ({
                      value: category,
                      label: category,
                    }))}
                    selected={categories}
                    onToggle={toggleCategory}
                    onClear={() => {
                      setCategories([]);
                      resetResults();
                    }}
                    gridClassName="grid-cols-2 sm:grid-cols-3"
                    compact
                  />
                ) : null}

                {showsFsas ? (
                  <MultiSelect
                    legend="Micro-areas"
                    help="Location signals are split by each selected FSA. Leave all unchecked to include every FSA."
                    options={MICRO_AREAS.map((fsa) => ({
                      value: fsa,
                      label: fsa,
                    }))}
                    selected={fsas}
                    onToggle={toggleFsa}
                    onClear={() => {
                      setFsas([]);
                      resetResults();
                    }}
                    gridClassName="grid-cols-2 sm:grid-cols-3"
                    compact
                  />
                ) : null}
              </div>
            ) : null}

            <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-800">
              Category filters apply only to signals with category-level data.
              Location-only signals use the micro-area selection. Hotspot
              category cards show current counts but omit sparklines because
              the API only provides an all-category trend per FSA.
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {queryKeys.length
                  ? `${resultCount} result ${resultCount === 1 ? "card" : "cards"} will be generated.`
                  : "Select at least one signal type."}
              </p>
              <Button type="submit" disabled={!queryKeys.length}>
                {resultCount
                  ? `Run ${resultCount} ${resultCount === 1 ? "view" : "views"}`
                  : "Run views"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <QueryResult results={results} />
    </div>
  );
}

interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

function MultiSelect<T extends string>({
  legend,
  help,
  options,
  selected,
  onToggle,
  onClear,
  gridClassName,
  compact = false,
}: {
  legend: string;
  help: string;
  options: readonly ChoiceOption<T>[];
  selected: readonly T[];
  onToggle: (value: T) => void;
  onClear?: () => void;
  gridClassName?: string;
  compact?: boolean;
}) {
  return (
    <fieldset className="space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <legend className="text-sm font-medium text-slate-700">
            {legend}
          </legend>
          <p className="text-xs text-slate-500">{help}</p>
        </div>
        {onClear && selected.length ? (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
          >
            Use all
          </button>
        ) : null}
      </div>
      <div className={cn("grid gap-2", gridClassName)}>
        {options.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-lg border bg-white transition hover:border-slate-400",
                compact ? "px-3 py-2" : "p-3",
                checked
                  ? "border-slate-800 ring-1 ring-slate-800"
                  : "border-slate-200"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(option.value)}
                className="mt-0.5 size-4 shrink-0 accent-slate-900"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-800">
                  {option.label}
                </span>
                {option.description ? (
                  <span className="mt-0.5 block text-xs leading-4 text-slate-500">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function buildQueryPanels(
  keys: readonly QueryKey[],
  categories: readonly string[],
  fsas: readonly string[],
  bundles: QueryBundles
): QueryPanel[] {
  return keys.flatMap((key) => {
    const definition = QUERY_REGISTRY[key];
    return expandFilters(definition, categories, fsas).map((filters) => ({
      id: `${key}:${filters.category ?? "all"}:${filters.fsa ?? "all"}`,
      scope: scopeLabel(definition, filters),
      result: runQuery(key, filters, bundles),
    }));
  });
}

function expandFilters(
  definition: QueryDefinition,
  categories: readonly string[],
  fsas: readonly string[]
): QueryFilters[] {
  const categoryValues =
    definition.filters.includes("category") && categories.length
      ? categories
      : [undefined];
  const fsaValues =
    definition.filters.includes("fsa") && fsas.length ? fsas : [undefined];

  return categoryValues.flatMap((category) =>
    fsaValues.map((fsa) => ({ category, fsa }))
  );
}

function countQueryPanels(
  keys: readonly QueryKey[],
  categories: readonly string[],
  fsas: readonly string[]
): number {
  return keys.reduce(
    (total, key) =>
      total + expandFilters(QUERY_REGISTRY[key], categories, fsas).length,
    0
  );
}

function scopeLabel(
  definition: QueryDefinition,
  filters: QueryFilters
): string {
  const parts: string[] = [];
  if (definition.filters.includes("category")) {
    parts.push(filters.category ?? "All categories");
  }
  if (definition.filters.includes("fsa")) {
    parts.push(filters.fsa ?? "All micro-areas");
  }
  return parts.join(" · ") || "Ward-wide";
}

function supportsFilter(
  keys: readonly QueryKey[],
  filter: "category" | "fsa"
): boolean {
  return keys.some((key) => {
    const definition: QueryDefinition = QUERY_REGISTRY[key];
    return definition.filters.includes(filter);
  });
}

function toggleValue<T>(values: readonly T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((current) => current !== value)
    : [...values, value];
}

function readQueryKeys(params: Pick<URLSearchParams, "getAll">): QueryKey[] {
  return [...new Set(params.getAll("type").filter(isQueryKey))];
}

function readAllowedValues<T extends string>(
  params: Pick<URLSearchParams, "getAll">,
  name: string,
  options: readonly T[]
): T[] {
  return [
    ...new Set(
      params
        .getAll(name)
        .filter((value): value is T => options.some((option) => option === value))
    ),
  ];
}
