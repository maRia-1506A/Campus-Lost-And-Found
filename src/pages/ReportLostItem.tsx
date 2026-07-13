import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useItems } from '../contexts/ItemsContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Tag, FolderOpen, FileText, MapPin, Calendar, Clock,
  Upload, Gift, AlertTriangle, ArrowLeft, CheckCircle2,
} from 'lucide-react';

const CATEGORIES = ['Electronics', 'Wallet', 'Keys', 'ID Card', 'Documents', 'Books', 'Accessories', 'Others'];

export default function ReportLostItem() {
  const navigate = useNavigate();
  const { addItem } = useItems();
  const { user } = useAuth();

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateLost, setDateLost] = useState('');
  const [timeLost, setTimeLost] = useState('');
  const [reward, setReward] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem({
      title: itemName,
      category,
      description,
      location,
      date: dateLost,
      time: timeLost,
      status: 'Lost',
      imageUrl: imagePreview,
      postedBy: user?.name || 'Anonymous',
      type: 'lost',
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Post Submitted!</h2>
          <p className="text-slate-500 mb-6">
            Your lost item report for <span className="font-semibold text-slate-700">"{itemName}"</span> has been posted. We'll notify you if someone finds it.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/lost')}>View Lost Items</Button>
            <Button onClick={() => { setSubmitted(false); setItemName(''); setCategory(''); setDescription(''); setLocation(''); setDateLost(''); setTimeLost(''); setReward(''); setImageFile(null); setImagePreview(''); }}>
              Report Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report a Lost Item</h1>
            </div>
            <p className="text-slate-500 text-sm">Fill in the details below to help others identify and return your item.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Item Details</CardTitle>
              <CardDescription>Describe the item you lost as accurately as possible.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                id="itemName"
                label="Item Name"
                placeholder="e.g. Black Wallet"
                leftIcon={<Tag className="w-4 h-4" />}
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-slate-400" /> Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        category === cat
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-brand-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {!category && <p className="text-xs text-slate-400">Please select a category.</p>}
              </div>

              <Textarea
                id="description"
                label="Description"
                placeholder="e.g. Contains student ID and bank cards. Black leather with a silver clip."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Location & Date */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">When & Where</CardTitle>
              <CardDescription>Tell us where and when you last had this item.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  id="location"
                  label="Location Lost"
                  placeholder="e.g. Library Building"
                  leftIcon={<MapPin className="w-4 h-4" />}
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Input
                id="dateLost"
                label="Date Lost"
                type="date"
                leftIcon={<Calendar className="w-4 h-4" />}
                required
                value={dateLost}
                onChange={(e) => setDateLost(e.target.value)}
              />
              <Input
                id="timeLost"
                label="Time Lost (Optional)"
                type="time"
                leftIcon={<Clock className="w-4 h-4" />}
                value={timeLost}
                onChange={(e) => setTimeLost(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Image & Reward */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Image & Reward</CardTitle>
              <CardDescription>A photo helps greatly in identifying the item.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Item Image</label>
                <label
                  htmlFor="item-image"
                  className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden relative"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Upload className="w-7 h-7" />
                      <span className="text-sm font-medium">Click to upload image</span>
                      <span className="text-xs">PNG, JPG, WEBP up to 10MB</span>
                    </div>
                  )}
                </label>
                <input id="item-image" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </div>

              {/* Reward */}
              <Input
                id="reward"
                label="Reward (Optional)"
                placeholder="e.g. 500 BDT or a thank-you gift"
                leftIcon={<Gift className="w-4 h-4" />}
                value={reward}
                onChange={(e) => setReward(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Status Preview + Submit */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Post Status</p>
                  <Badge variant="danger" className="text-sm px-3 py-1">LOST</Badge>
                  <p className="text-xs text-slate-400 mt-1">This will be the initial status of your post.</p>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                  <Button type="submit" disabled={!itemName || !category || !description || !location || !dateLost}>
                    Submit Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
