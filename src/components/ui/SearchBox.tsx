// Location: src/components/ui/SearchBox.tsx
import { useState, useEffect, useRef } from 'react';

// لیست تخصص‌های پرکاربرد جهت فیلتر و پیشنهاد خودکار
const SPECIALTIES = [
  'ارتوپدی',
  'قلب و عروق',
  'مغز و اعصاب',
  'داخلی',
  'اطفال و کودکان',
  'پوست و مو',
  'چشم پزشکی',
  'گوش، حلق و بینی',
  'زنان و زایمان',
  'روانپزشکی',
  'دندانپزشکی',
  'جراحی عمومی'
];

interface SearchBoxProps {
  onSearch: (searchTerm: string) => void;
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // بستن منوی پیشنهادات در صورت کلیک در خارج از کامپوننت
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // فیلتر کردن تخصص‌ها بر اساس تایپ کاربر
  useEffect(() => {
    if (query.trim() === '') {
      // اگر کادر خالی بود، چند تخصص پرطرفدار را پیش‌فرض نشان بده
      setFilteredSuggestions(SPECIALTIES.slice(0, 5));
    } else {
      const filtered = SPECIALTIES.filter((specialty) =>
        specialty.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  }, [query]);

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(query);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="پزشک، تخصص یا بیماری (مثلاً: ارتوپدی، قلب...)"
          className="w-full px-5 py-4.5 pr-12 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-right"
          dir="rtl"
        />
        {/* Search Icon */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onSearch('');
            }}
            className="absolute left-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Action Button */}
        <button
          type="submit"
          className="absolute left-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm hover:shadow transition-all"
        >
          جستجو
        </button>
      </form>

      {/* Auto-complete Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-50 text-right animate-fadeIn">
          {filteredSuggestions.map((suggestion, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full px-5 py-3.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-right transition-colors flex items-center justify-between"
              >
                <span>{suggestion}</span>
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
