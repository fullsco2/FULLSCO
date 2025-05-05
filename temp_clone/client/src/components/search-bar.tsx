import { useState } from 'react';
import { useLocation } from 'wouter';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type SearchBarProps = {
  placeholder?: string;
  fullWidth?: boolean;
  buttonText?: string;
  className?: string;
};

const SearchBar = ({
  placeholder = "Search scholarships...",
  fullWidth = false,
  buttonText,
  className
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/scholarships?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`flex ${fullWidth ? 'w-full' : ''} ${className}`}>
      <div className="relative flex-grow">
        <Input
          type="text"
          className="w-full pl-10 pr-4 py-2 rounded-l-md"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      {buttonText ? (
        <Button type="submit" className="rounded-l-none">
          {buttonText}
        </Button>
      ) : (
        <Button type="submit" className="rounded-l-none px-4">
          <Search className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
};

export default SearchBar;
