import type { Category } from "@/types/product";

export function CategoryPills({
  categories,
  active,
  onChange,
}: {
  categories: Category[];
  active: string;
  onChange: (slug: string) => void;
}) {
  const allCategories = [{ id: "all", title: "All", slug: "all" }, ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((category) => (
        <button
          key={category.slug || category.id}
          onClick={() => onChange(category.slug || category.id)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            active === (category.slug || category.id)
              ? "bg-stone-900 text-white"
              : "bg-white/70 text-stone-700 hover:bg-amber-100/70"
          }`}
        >
          {category.title}
        </button>
      ))}
    </div>
  );
}
