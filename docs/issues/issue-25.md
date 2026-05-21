# Issue 25 — Dashboard Profile & Sell Pages

**Labels:** `feature`, `frontend` | **Priority:** 🟢 Medium | **Depends on:** Issues 06, 07, 12, 23

## Checklist
- [ ] Create `src/app/dashboard/profile/page.jsx`
- [ ] Create `src/app/sell/page.jsx`

## Files to Create

### File 1 — `src/app/dashboard/profile/page.jsx`

```jsx
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import Button from '@/components/ui/Button';
import { Save } from 'lucide-react';

import { updateProfileAction } from '@/lib/actions/auth';

export default function DashboardProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ bio: '', location: '', instagram: '', twitter: '', website: '' });

  useEffect(() => {
    if (user) {
      const social = user.socialLinks;
      setForm({ bio: user.bio || '', location: user.location || '', instagram: social?.instagram || '', twitter: social?.twitter || '', website: social?.website || '' });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsLoading(true);
    try {
      const data = await updateProfileAction({ bio: form.bio, location: form.location, socialLinks: { instagram: form.instagram, twitter: form.twitter, website: form.website } });
      if (data.success) { showToast('Profile updated!', 'success'); refreshUser(); }
      else showToast(data.error || 'Failed', 'error');
    } catch { showToast('Network error', 'error'); }
    finally { setIsLoading(false); }
  };


  const inputClass = "w-full px-4 py-3 border border-border-light rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all";

  return (
    <div>
      <h1 className="font-display text-2xl text-primary uppercase mb-8">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-6 md:p-8 max-w-2xl">
        <div className="space-y-5">
          <div><label htmlFor="bio" className="font-ui text-sm font-medium text-text block mb-1.5">Bio / Story</label><textarea id="bio" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={4} className={inputClass + ' resize-none'} placeholder="Tell your story as an artisan..." /></div>
          <div><label htmlFor="location" className="font-ui text-sm font-medium text-text block mb-1.5">Location</label><input id="location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className={inputClass} placeholder="Portland, Oregon" /></div>
          <hr className="border-border-light" />
          <h3 className="font-display text-lg text-primary uppercase">Social Links</h3>
          <div><label htmlFor="instagram" className="font-ui text-sm font-medium text-text block mb-1.5">Instagram</label><input id="instagram" value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})} className={inputClass} placeholder="https://instagram.com/..." /></div>
          <div><label htmlFor="twitter" className="font-ui text-sm font-medium text-text block mb-1.5">Twitter / X</label><input id="twitter" value={form.twitter} onChange={e => setForm({...form, twitter: e.target.value})} className={inputClass} placeholder="https://twitter.com/..." /></div>
          <div><label htmlFor="website" className="font-ui text-sm font-medium text-text block mb-1.5">Website</label><input id="website" value={form.website} onChange={e => setForm({...form, website: e.target.value})} className={inputClass} placeholder="https://..." /></div>
        </div>
        <div className="mt-8"><Button type="submit" isLoading={isLoading} size="lg"><Save size={18} /> Save Profile</Button></div>
      </form>
    </div>
  );
}
```

---

### File 2 — `src/app/sell/page.jsx`

```jsx
'use client';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { updateProfileAction } from '@/lib/actions/auth';
import { useState, useEffect } from 'react';
import { Store, MapPin, AlignLeft, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';

export default function SellPage() {
  const { user, isLoading, refreshUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/register?role=seller');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return <PageLoader />;

  const handleUpgrade = async (e) => {
    e.preventDefault();
    if (!bio.trim() || !location.trim()) {
      showToast('Please provide a bio and location', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await updateProfileAction({ role: 'seller', bio, location });
      if (data.success) {
        showToast('Welcome to the Artisan Community! Your seller account is ready.', 'success');
        await refreshUser();
        router.push('/dashboard');
      } else {
        showToast(data.error || 'Failed to upgrade account', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-surface-warm pb-20">
      {/* Hero Section */}
      <section className="bg-primary py-20 px-4 text-center">
        <div className="container-app max-w-3xl">
          <Store size={48} className="text-cta mx-auto mb-6" />
          <h1 className="font-display text-4xl md:text-5xl text-white uppercase mb-6">
            Become an Artisan Seller
          </h1>
          <p className="font-body text-lg text-white/80 leading-relaxed mb-8">
            Join our community of creators, makers, and dreamers. Open your shop on Handcrafted Haven and share your passion with customers who value quality and sustainability.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container-app max-w-2xl -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-card p-8 md:p-12">
          
          {/* State 1: Already a Seller */}
          {user.role === 'seller' ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store size={32} className="text-success" />
              </div>
              <h2 className="font-display text-2xl text-primary uppercase mb-3">You&apos;re already a seller!</h2>
              <p className="font-body text-text-muted mb-8">
                Your shop is active and ready for business. Go to your dashboard to manage your products.
              </p>
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto px-12">Go to Dashboard</Button>
              </Link>
            </div>
          ) 
          
          /* State 2: Buyer Upgrading to Seller */
          : (
            <div>
              <div className="text-center mb-10">
                <h2 className="font-display text-2xl text-primary uppercase mb-3">Set Up Your Shop</h2>
                <p className="font-body text-text-muted">
                  Tell us a bit about yourself and where you craft your goods. This information will be displayed on your shop profile.
                </p>
              </div>

              <form onSubmit={handleUpgrade} className="space-y-6">
                <div>
                  <label htmlFor="bio" className="font-ui text-sm font-bold text-text mb-2 flex items-center gap-2">
                    <AlignLeft size={16} className="text-text-muted" /> Your Artisan Story (Bio)
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="E.g., I've been crafting wooden bowls for 10 years, sourcing timber sustainably..."
                    className="w-full px-4 py-3 border border-border-light rounded-xl font-body text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="location" className="font-ui text-sm font-bold text-text mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-text-muted" /> Workshop Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="E.g., Portland, Oregon"
                    className="w-full px-4 py-3 border border-border-light rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    required
                  />
                </div>

                <div className="pt-6 border-t border-border-light">
                  <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
                    Create Seller Account
                  </Button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
```
