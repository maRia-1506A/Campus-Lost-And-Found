import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { type Item } from '../services/mockData';
import { useItems } from '../contexts/ItemsContext';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, MapPin, Calendar, Filter } from 'lucide-react';

export default function BrowseItems() {
  const location = useLocation();
  const isLost = location.pathname.includes('/lost');
  const type = isLost ? 'lost' : 'found';

  const { items } = useItems();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items
    .filter(item => item.type === type)
    .filter(item => {
      const query = searchQuery.toLowerCase();
      const dateString = new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase();
      const rawDateString = item.date.toLowerCase();
      
      return (
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        dateString.includes(query) ||
        rawDateString.includes(query)
      );
    });

  return (
    <div className="flex-1 bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex-1 w-full space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {isLost ? 'Lost Items' : 'Found Items'}
              </h1>
              <p className="text-slate-500 mt-1">
                {isLost ? 'Browse items reported lost by students.' : 'Browse items found around the campus.'}
              </p>
            </div>
            <div className="flex items-center space-x-3 w-full max-w-xl">
              <Input 
                placeholder="Search by item name, category, or location..." 
                leftIcon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50"
              />
              <Button variant="outline" className="shrink-0">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
          <Link to={`/${type}/new`}>
            <Button>
              {isLost ? 'Report Lost Item' : 'Report Found Item'}
            </Button>
          </Link>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Electronics', 'Wallet', 'Keys', 'ID Card', 'Documents', 'Books', 'Accessories', 'Others'].map((cat) => (
            <Badge 
              key={cat} 
              variant={cat === 'All' ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-slate-100 px-3 py-1 text-sm"
            >
              {cat}
            </Badge>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <Link to={`/item/${item.id}`} key={item.id}>
              <Card className="h-full hover:shadow-lg transition-shadow group overflow-hidden cursor-pointer border-slate-200">
                <div className="relative h-48 overflow-hidden bg-slate-100 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-slate-300 text-sm">No image</span>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={item.status === 'Lost' ? 'danger' : 'success'}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{item.title}</h3>
                  </div>
                  <Badge variant="outline" className="mb-4">{item.category}</Badge>

                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 shrink-0 text-slate-400" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 shrink-0 text-slate-400" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No items found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
