import React, { useEffect, useState } from 'react';
import { debounce } from 'lodash';

const SearchBar = ({ value, onChange,  placeholder="Search" }) => {
  const [query, setQuery] = useState(value);
  
  const debouncedSearch = debounce((value) => {
    onChange(value);
  }, 500);

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query]);

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
      />
    </div>
  );
};

export default SearchBar;