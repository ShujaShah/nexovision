import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { usePatients, usePatient } from '../../hooks/api/usePatients';

const SearchableSelect = ({ value, onChange, placeholder = "Select a patient..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch initial option if value is set but selectedOption is null
  const { data: patientData } = usePatient(value);
  useEffect(() => {
    if (value && !selectedOption && patientData) {
      setSelectedOption(patientData);
    }
  }, [value, selectedOption, patientData]);

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: patientsData, isLoading: loadingPatients } = usePatients(page, debouncedSearch);

  // Update options when data changes
  useEffect(() => {
    if (patientsData) {
      if (page === 1) {
        setOptions(patientsData.data);
      } else {
        setOptions(prev => {
          // Avoid duplicates on strict mode double render
          const existingIds = new Set(prev.map(p => p._id));
          const newOptions = patientsData.data.filter(p => !existingIds.has(p._id));
          return [...prev, ...newOptions];
        });
      }
      setHasMore(page < patientsData.pages);
    }
  }, [patientsData, page]);

  useEffect(() => {
    setLoading(loadingPatients);
  }, [loadingPatients]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleSelect = (option) => {
    setSelectedOption(option);
    onChange(option._id);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="input-field flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-white" : "text-gray-400"}>
          {selectedOption ? `${selectedOption.firstName} ${selectedOption.lastName}` : placeholder}
        </span>
        <ChevronDown size={18} className="text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-[var(--border-color)]">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md py-1.5 pl-8 pr-3 text-sm text-white focus:outline-none focus:border-purple-500"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
          
          <ul 
            className="max-h-60 overflow-y-auto custom-scrollbar p-1"
            onScroll={handleScroll}
          >
            {options.map(option => (
              <li 
                key={option._id}
                className="px-3 py-2 hover:bg-[var(--bg-primary)] cursor-pointer rounded-md flex items-start justify-between border-b border-[var(--border-color)] last:border-0"
                onClick={() => handleSelect(option)}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-white">{option.firstName} {option.lastName}</span>
                  <div className="flex flex-col text-[11px] text-gray-400 leading-tight">
                    <span>Registered: {new Date(option.createdAt).toLocaleDateString()}</span>
                    {option.contactInfo?.address && (
                      <span className="truncate max-w-[200px]" title={option.contactInfo.address}>
                        Addr: {option.contactInfo.address}
                      </span>
                    )}
                  </div>
                </div>
                {value === option._id && <Check size={16} className="text-purple-500 mt-1 flex-shrink-0" />}
              </li>
            ))}
            
            {loading && (
              <li className="px-3 py-2 text-sm text-gray-400 text-center animate-pulse">
                Loading...
              </li>
            )}
            
            {!loading && options.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400 text-center">
                No patients found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
