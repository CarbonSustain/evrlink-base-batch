import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '@/components/Button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for backgrounds/templates matching the highlighted text fields in the UI
const mockBackgrounds = [
  { 
    id: '1', 
    category: 'Category #1', 
    description: 'Beautiful background for creating unique gift cards.',
    creator: '0x44bf...7897',
    price: '0.0012000000 ETH',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format'
  },
  { 
    id: '2', 
    category: 'Category #2', 
    description: 'Modern abstract design for professional presentations.',
    creator: '0x78de...9921',
    price: '0.0020000000 ETH',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format'
  },
  { 
    id: '3', 
    category: 'Category #3', 
    description: 'Elegant landscape perfect for nature-themed gifts.',
    creator: '0xab12...45ef',
    price: '0.0015000000 ETH',
    imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format'
  },
  { 
    id: '4', 
    category: 'Category #1', 
    description: 'Urban cityscape with futuristic elements.',
    creator: '0x44bf...7897',
    price: '0.0018000000 ETH',
    imageUrl: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&auto=format'
  },
];

// Mock data for received meeps
const mockReceivedMeeps = [
  { id: '1', title: 'Welcome to Evrlink', sender: '0x1234...5678', date: '2025-06-20' },
  { id: '2', title: 'Project Update', sender: '0x8765...4321', date: '2025-06-19' },
];

// Mock data for sent meeps
const mockSentMeeps = [
  { id: '1', title: 'Meeting Notes', recipient: '0x5555...7777', date: '2025-06-21' },
  { id: '2', title: 'Weekly Report', recipient: '0x3333...9999', date: '2025-06-18' },
];

type SearchCategory = 'all' | 'backgrounds' | 'received' | 'sent';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    performSearch(query, activeCategory);
  }, [query, activeCategory]);

  const performSearch = (query: string, category: SearchCategory) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    let searchResults: any[] = [];

    if (category === 'all' || category === 'backgrounds') {
      const backgroundResults = mockBackgrounds.filter(
        bg => 
          bg.category.toLowerCase().includes(searchTerm) || 
          bg.description.toLowerCase().includes(searchTerm) ||
          bg.creator.toLowerCase().includes(searchTerm) ||
          bg.price.toLowerCase().includes(searchTerm)
      );
      
      if (category === 'backgrounds') {
        searchResults = backgroundResults;
      } else {
        searchResults = [...searchResults, ...backgroundResults.map(bg => ({...bg, type: 'background'}))];
      }
    }

    if (category === 'all' || category === 'received') {
      const receivedResults = mockReceivedMeeps.filter(
        meep => meep.title.toLowerCase().includes(searchTerm) || 
                meep.sender.toLowerCase().includes(searchTerm)
      );
      
      if (category === 'received') {
        searchResults = receivedResults;
      } else {
        searchResults = [...searchResults, ...receivedResults.map(meep => ({...meep, type: 'received'}))];
      }
    }

    if (category === 'all' || category === 'sent') {
      const sentResults = mockSentMeeps.filter(
        meep => meep.title.toLowerCase().includes(searchTerm) ||
                meep.recipient.toLowerCase().includes(searchTerm)
      );
      
      if (category === 'sent') {
        searchResults = sentResults;
      } else {
        searchResults = [...searchResults, ...sentResults.map(meep => ({...meep, type: 'sent'}))];
      }
    }

    setResults(searchResults);
  };

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>
      
      {/* Categories */}
      <div className="flex overflow-x-auto space-x-2 pb-4 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            activeCategory === 'all' 
              ? "bg-[#ff6b81] text-white" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          All Results
        </button>
        <button
          onClick={() => setActiveCategory('backgrounds')}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            activeCategory === 'backgrounds' 
              ? "bg-[#ff6b81] text-white" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveCategory('received')}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            activeCategory === 'received' 
              ? "bg-[#ff6b81] text-white" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          Received Meeps
        </button>
        <button
          onClick={() => setActiveCategory('sent')}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            activeCategory === 'sent' 
              ? "bg-[#ff6b81] text-white" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          Sent Meeps
        </button>
      </div>

      {/* No Results State */}
      {results.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No results found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results */}
          {activeCategory === 'all' && (
            <>
              {/* Templates section */}
              {results.some(item => item.type === 'background') && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Templates</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results
                      .filter(item => item.type === 'background')
                      .map(bg => (
                        <div key={bg.id} className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                          <div className="relative">
                            <img 
                              src={bg.imageUrl} 
                              alt={bg.description}
                              className="h-40 w-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-[#00b2c7] text-white px-3 py-1 rounded-full text-sm font-medium">
                              {bg.price}
                            </div>
                          </div>
                          <div className="p-3 flex flex-col space-y-2">
                            <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm inline-block self-start">
                              {bg.category}
                            </div>
                            <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm inline-block self-start">
                              {bg.description}
                            </div>
                            <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm inline-block self-start">
                              By {bg.creator}
                            </div>
                            <button className="w-full mt-2 bg-[#ff6b81] hover:bg-[#ff5a6e] text-white py-2 rounded-md font-medium">
                              Generate Meep
                            </button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Received Meeps section */}
              {results.some(item => item.type === 'received') && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Received Meeps</h2>
                  <div className="space-y-3">
                    {results
                      .filter(item => item.type === 'received')
                      .map(meep => (
                        <div key={meep.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h3 className="font-medium">{meep.title}</h3>
                          <p className="text-sm text-gray-500">From: {meep.sender}</p>
                          <p className="text-sm text-gray-500">Date: {meep.date}</p>
                          <Button className="mt-3" variant="outline" size="sm">Open Meep</Button>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Sent Meeps section */}
              {results.some(item => item.type === 'sent') && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Sent Meeps</h2>
                  <div className="space-y-3">
                    {results
                      .filter(item => item.type === 'sent')
                      .map(meep => (
                        <div key={meep.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h3 className="font-medium">{meep.title}</h3>
                          <p className="text-sm text-gray-500">To: {meep.recipient}</p>
                          <p className="text-sm text-gray-500">Date: {meep.date}</p>
                          <Button className="mt-3" variant="outline" size="sm">View Details</Button>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </>
          )}

          {/* Template Results */}
          {activeCategory === 'backgrounds' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map(bg => (
                <div key={bg.id} className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="relative">
                    <img 
                      src={bg.imageUrl} 
                      alt={bg.description}
                      className="h-40 w-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-[#00b2c7] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {bg.price}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col space-y-2">
                    <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm inline-block self-start">
                      {bg.category}
                    </div>
                    <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm inline-block self-start">
                      {bg.description}
                    </div>
                    <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm inline-block self-start">
                      By {bg.creator}
                    </div>
                    <button className="w-full mt-2 bg-[#ff6b81] hover:bg-[#ff5a6e] text-white py-2 rounded-md font-medium">
                      Generate Meep
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Received Meeps Results */}
          {activeCategory === 'received' && (
            <div className="space-y-3">
              {results.map(meep => (
                <div key={meep.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium">{meep.title}</h3>
                  <p className="text-sm text-gray-500">From: {meep.sender}</p>
                  <p className="text-sm text-gray-500">Date: {meep.date}</p>
                  <Button className="mt-3" variant="outline" size="sm">Open Meep</Button>
                </div>
              ))}
            </div>
          )}

          {/* Sent Meeps Results */}
          {activeCategory === 'sent' && (
            <div className="space-y-3">
              {results.map(meep => (
                <div key={meep.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium">{meep.title}</h3>
                  <p className="text-sm text-gray-500">To: {meep.recipient}</p>
                  <p className="text-sm text-gray-500">Date: {meep.date}</p>
                  <Button className="mt-3" variant="outline" size="sm">View Details</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
