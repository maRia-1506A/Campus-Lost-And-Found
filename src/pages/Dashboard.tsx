import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Package, CheckCircle, Clock, Search, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useClaims } from '../contexts/ClaimsContext';
import { useItems } from '../contexts/ItemsContext';
import { Badge } from '../components/ui/Badge';

export default function Dashboard() {
  const { user } = useAuth();
  const { getClaimsByPoster, getClaimsByClaimer, updateClaimStatus } = useClaims();
  const { items } = useItems();
  const navigate = useNavigate();

  const myClaims = user ? getClaimsByClaimer(user.studentId) : [];
  const incomingClaims = user ? getClaimsByPoster(user.name) : []; // Using name as posterId for mock

  const stats = [
    { title: "Active Lost Posts", value: "12", icon: <Package className="w-5 h-5 text-amber-500" /> },
    { title: "Active Found Posts", value: "28", icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
    { title: "Items Returned", value: "156", icon: <Clock className="w-5 h-5 text-brand-500" /> },
    { title: "My Posts", value: "3", icon: <Search className="w-5 h-5 text-purple-500" /> },
  ];

  if (!user) {
    return (
      <div className="flex-1 flex justify-center items-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user.name}! Here's what's happening today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/lost/new">
              <Button variant="outline">Report Lost Item</Button>
            </Link>
            <Link to="/found/new">
              <Button>Report Found Item</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Claims (Found Items)</CardTitle>
            </CardHeader>
            <CardContent>
              {incomingClaims.length > 0 ? (
                <div className="space-y-4">
                  {incomingClaims.map(claim => {
                    const item = items.find(i => i.id === claim.itemId);
                    return (
                      <div key={claim.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">Item: {item?.title || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">Claimed by {claim.claimerName}</p>
                          </div>
                          <Badge variant={claim.status === 'Approved' ? 'success' : claim.status === 'Rejected' ? 'danger' : 'outline'}>
                            {claim.status}
                          </Badge>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 space-y-2 border border-slate-100">
                          <p><span className="font-medium text-slate-900">Color:</span> {claim.color}</p>
                          <p><span className="font-medium text-slate-900">Marks:</span> {claim.uniqueMarks}</p>
                          <p><span className="font-medium text-slate-900">Proof:</span> {claim.proof}</p>
                        </div>
                        
                        {claim.status === 'Pending' ? (
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateClaimStatus(claim.id, 'Approved')}>Approve</Button>
                            <Button size="sm" variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => updateClaimStatus(claim.id, 'Rejected')}>Reject</Button>
                          </div>
                        ) : claim.status === 'Approved' && (
                          <Button size="sm" className="w-full" variant="outline" onClick={() => navigate(`/messages/${claim.id}`)}>
                            <MessageSquare className="w-4 h-4 mr-2" /> Message {claim.claimerName}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-slate-500 text-center py-8">
                  No incoming claims for your found items.
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>My Claims (Lost Items)</CardTitle>
            </CardHeader>
            <CardContent>
              {myClaims.length > 0 ? (
                <div className="space-y-4">
                  {myClaims.map(claim => {
                    const item = items.find(i => i.id === claim.itemId);
                    return (
                      <div key={claim.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{item?.title || 'Unknown Item'}</p>
                            <p className="text-xs text-slate-500">Date: {new Date(claim.date).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={claim.status === 'Approved' ? 'success' : claim.status === 'Rejected' ? 'danger' : 'outline'}>
                            {claim.status}
                          </Badge>
                        </div>
                        {claim.status === 'Approved' ? (
                          <Button size="sm" className="w-full" onClick={() => navigate(`/messages/${claim.id}`)}>
                            <MessageSquare className="w-4 h-4 mr-2" /> Message Finder
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => updateClaimStatus(claim.id, 'Approved')}>
                            [Test] Simulate Approval
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-slate-500 text-center py-8">
                  You haven't made any claims yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
