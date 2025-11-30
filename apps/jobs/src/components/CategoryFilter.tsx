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
  return (
    <div className="jobs-category-filter">
      <button
        className={`jobs-category-chip ${selectedCategoryId === null ? "active" : ""}`}
        onClick={() => onSelectCategory(null)}
      >
        All Categories
        <span className="count">
          {categories.reduce((sum, cat) => sum + cat.jobCount, 0)}
        </span>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`jobs-category-chip ${selectedCategoryId === category.id ? "active" : ""}`}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name}
          <span className="count">{category.jobCount}</span>
        </button>
      ))}
    </div>
  );
}
