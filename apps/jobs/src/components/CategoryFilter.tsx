interface Category {
  id: number;
  name: string;
  slug: string;
  jobCount: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterProps) {
  const totalJobs = categories.reduce((sum, cat) => sum + cat.jobCount, 0);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium transition-all hover:border-slate-300 hover:shadow-sm ${
          selectedCategoryId === null
            ? "bg-primary-600 text-white border-transparent hover:bg-primary-700 hover:border-transparent shadow-md"
            : "text-slate-600 hover:bg-slate-50"
        }`}
        onClick={() => onSelectCategory(null)}
      >
        All Categories
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            selectedCategoryId === null
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {totalJobs}
        </span>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium transition-all hover:border-slate-300 hover:shadow-sm ${
            selectedCategoryId === category.id
              ? "bg-primary-600 text-white border-transparent hover:bg-primary-700 hover:border-transparent shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name}
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              selectedCategoryId === category.id
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {category.jobCount}
          </span>
        </button>
      ))}
    </div>
  );
}
