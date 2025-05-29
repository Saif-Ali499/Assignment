import React, { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { dummyData } from '../Data';
import { LRUCache } from '../utils/LRUCache';

const cache = new LRUCache(10);

const highlightMatch = (text, query) => {
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <b key={i}>{part}</b> : part
  );
};

const AutoComplete = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSelect = (item) => {
    setQuery(item.name);
    setResults([]);
  };

  const filterData = (input) => {
    if (input.trim() === '') {
      setResults([]);
      return;
    }

    if (cache.get(input)) {
      setResults(cache.get(input));
      return;
    }

    const filtered = dummyData
      .filter((item) =>
        item.name.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 10);

    cache.set(input, filtered);
    setResults(filtered);
  };

  const debouncedFilter = useMemo(
    () => debounce(filterData, 300),
    []
  );

  useEffect(() => {
    debouncedFilter(query);
    return () => debouncedFilter.cancel();
  }, [query]);

  return (
    <div style={{ position: 'relative', width: '300px'}}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Type to search..."
        style={{ width: '100%', padding: '8px' }}
      />
      {results.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '8px',
            border: '1px solid #ccc',
            position: 'absolute',
            width: '100%',
            background: '#fff',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {results.map((item) => (
            <li
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{ padding: '4px', cursor: 'pointer',color:'red',backgroundColor:'pink' }}
            >
              {highlightMatch(item.name, query)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoComplete;
