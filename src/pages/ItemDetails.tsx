import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { type Item } from '../services/mockData';
import { useItems } from '../contexts/ItemsContext';
import { useAuth } from '../contexts/AuthContext';
import { useClaims } from '../contexts/ClaimsContext';
import { ClaimModal } from '../components/claims/ClaimModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { MapPin, Calendar, User, ArrowLeft, Share2, Bookmark, AlertTriangle } from 'lucide-react';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items } = useItems();
  const { user } = useAuth();
  const { getClaimForUserAndItem, claims } = useClaims();
  
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Check if current user has an existing claim for this item
  const existingClaim = user && item ? getClaimForUserAndItem(user.studentId, item.id) : undefined;

  useEffect(() => {
    if (id) {
      const foundItem = items.find((i) => i.id === id);
      if (foundItem) {
        setItem(foundItem);
      }
      setIsLoading(false);
    }
  }, [id, items]);

  if (isLoading) {
    return <div className="flex-1 flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;
  }

  if (!item) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Item Not Found</h2>
        <p className="text-slate-500 mb-6">The item you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to browsing
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white aspect-square shadow-sm relative">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge variant={item.status === 'Lost' ? 'danger' : 'success'} className="text-sm px-3 py-1 shadow-sm">
                  {item.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right: Item Info */}
          <div className="flex flex-col space-y-6">
            <div className="space-y-2">
              <Badge variant="outline">{item.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{item.title}</h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-slate-200 shadow-none">
                <CardContent className="p-4 flex flex-col justify-center">
                  <div className="flex items-center text-slate-500 mb-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium uppercase tracking-wider">{item.status === 'Lost' ? 'Lost at' : 'Found at'}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{item.location}</span>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-none">
                <CardContent className="p-4 flex flex-col justify-center">
                  <div className="flex items-center text-slate-500 mb-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium uppercase tracking-wider">Date</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {new Date(item.date).toLocaleDateString()} {item.time && <span className="text-sm font-normal text-slate-500 ml-1">at {item.time}</span>}
                  </span>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Posted by</p>
                <p className="text-sm font-semibold text-slate-900">{item.postedBy}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-slate-200">
              {item.status === 'Found' ? (
                <>
                  {!user ? (
                    <Button size="lg" className="flex-1" onClick={() => navigate('/login')}>Login to Claim</Button>
                  ) : existingClaim ? (
                    <Button size="lg" className="flex-1" variant={existingClaim.status === 'Approved' ? 'default' : 'outline'} disabled={existingClaim.status !== 'Approved'} onClick={() => existingClaim.status === 'Approved' && navigate(`/messages/${existingClaim.id}`)}>
                      {existingClaim.status === 'Pending' ? 'Claim Pending...' : existingClaim.status === 'Rejected' ? 'Claim Rejected' : 'Message Finder'}
                    </Button>
                  ) : item.postedBy !== user.name ? (
                    <Button size="lg" className="flex-1" onClick={() => setShowClaimModal(true)}>Claim This Item</Button>
                  ) : (
                    <Button size="lg" className="flex-1" variant="outline" disabled>This is your post</Button>
                  )}
                </>
              ) : (
                <Button size="lg" className="flex-1">I Found This</Button>
              )}
              <Button size="lg" variant="outline" className="px-4">
                <Bookmark className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-4">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex justify-center">
              <button className="flex items-center text-xs text-slate-400 hover:text-red-500 transition-colors mt-2">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Report Post
              </button>
            </div>

          </div>
        </div>
      </div>
      
      {showClaimModal && item && (
        <ClaimModal item={item} onClose={() => setShowClaimModal(false)} />
      )}
    </div>
  );
}
