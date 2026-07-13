import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { User, Mail, GraduationCap, Building, Phone, Lock, PackageSearch, Pencil, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile Info State
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  // Edit mode state
  const [editingInfo, setEditingInfo] = useState(false);

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setStudentId(user.studentId || '');
      setDepartment(user.department || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, studentId, department, email, phoneNumber, profilePicture });
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        alert("New passwords don't match!");
        return;
      }
      changePassword(newPassword);
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setEditingInfo(false);
  };

  const handleCancelInfo = () => {
    if (user) {
      setName(user.name || '');
      setStudentId(user.studentId || '');
      setDepartment(user.department || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      setProfilePicture(user.profilePicture || '');
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setEditingInfo(false);
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePicture(url);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-4">Please log in to view your profile.</p>
        <Link to="/login">
          <Button>Log In</Button>
        </Link>
      </div>
    );
  }

  // Mock Personal Posts
  const mockPosts = [
    { id: '1', title: 'Lost: Blue Water Bottle', type: 'Lost', date: 'Oct 24, 2023', status: 'Active' },
    { id: '2', title: 'Found: iPhone 13', type: 'Found', date: 'Oct 20, 2023', status: 'Resolved' },
  ];

  return (
    <div className="container mx-auto p-4 max-w-5xl py-8 space-y-8">
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-brand-600" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{user.name}</h1>
          <p className="text-slate-500">{user.studentId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Settings Sections */}
        <div className="md:col-span-2 space-y-6">

          {/* ── Personal Information ── */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your account details.</CardDescription>
              </div>
              {!editingInfo && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingInfo(true)}
                >
                  <Pencil className="w-4 h-4 mr-2" /> Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingInfo ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="name" label="Full Name" placeholder="John Doe"
                      leftIcon={<User className="w-4 h-4" />} required
                      value={name} onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      id="studentId" label="Student ID" placeholder="e.g. 20210001"
                      leftIcon={<GraduationCap className="w-4 h-4" />} required
                      value={studentId} onChange={(e) => setStudentId(e.target.value)}
                    />
                    <Input
                      id="email" label="University Email" type="email" placeholder="student@university.edu"
                      leftIcon={<Mail className="w-4 h-4" />} required
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                      id="department" label="Department" placeholder="e.g. Computer Science"
                      leftIcon={<Building className="w-4 h-4" />}
                      value={department} onChange={(e) => setDepartment(e.target.value)}
                    />
                    <Input
                      id="phone" label="Phone Number" placeholder="+1 234 567 890"
                      leftIcon={<Phone className="w-4 h-4" />}
                      value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Profile Picture</label>
                      <div className="flex items-center">
                        <div className="flex-1 relative">
                          <label
                            htmlFor="dropzone-file"
                            className="flex items-center justify-center w-full h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-lg cursor-pointer transition-colors text-sm font-medium shadow-sm"
                          >
                            Select Image
                          </label>
                          <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleLocalFileChange} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Change Password — optional, inside edit form */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-700 mb-3">Change Password <span className="text-xs text-slate-400 font-normal">(leave blank to keep current)</span></p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        id="newPassword" label="New Password" type="password"
                        leftIcon={<Lock className="w-4 h-4" />}
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Input
                        id="confirmPassword" label="Confirm New Password" type="password"
                        leftIcon={<Lock className="w-4 h-4" />}
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button type="button" variant="outline" size="sm" onClick={handleCancelInfo}>
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                    <Button type="submit" size="sm">
                      <Check className="w-4 h-4 mr-1" /> Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { icon: <User className="w-4 h-4" />, label: 'Full Name', value: user.name },
                    { icon: <GraduationCap className="w-4 h-4" />, label: 'Student ID', value: user.studentId },
                    { icon: <Mail className="w-4 h-4" />, label: 'Email', value: user.email },
                    { icon: <Building className="w-4 h-4" />, label: 'Department', value: user.department || '—' },
                    { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: user.phoneNumber || '—' },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="mt-0.5 w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                        {icon}
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</dt>
                        <dd className="text-sm font-medium text-slate-800 mt-0.5">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Personal Posts */}
        <div className="md:col-span-1">
          <Card className="shadow-sm border-slate-200 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageSearch className="w-5 h-5 text-brand-600" />
                Your Posts
              </CardTitle>
              <CardDescription>Recent items you've reported.</CardDescription>
            </CardHeader>
            <CardContent>
              {mockPosts.length > 0 ? (
                <div className="space-y-4">
                  {mockPosts.map((post) => (
                    <div key={post.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          post.type === 'Lost' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {post.type}
                        </span>
                        <span className={`text-xs font-medium ${
                          post.status === 'Active' ? 'text-brand-600' : 'text-slate-500'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-900 text-sm line-clamp-1">{post.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{post.date}</p>
                    </div>
                  ))}
                  <div className="pt-4 text-center">
                    <Button variant="ghost" className="text-sm w-full">View All Posts</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>You haven't posted any items yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
