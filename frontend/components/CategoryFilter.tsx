import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function CategoryFilter() {
  const {
    selectedCategory,
    setSelectedCategory,
    categories,
    fetchCategories,
  } = useStore();

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-4">
      <div className="flex gap-2 min-w-max px-4 sm:px-0">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

