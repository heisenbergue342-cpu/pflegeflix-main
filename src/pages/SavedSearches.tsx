import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Bell, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '@/components/EmptyState';
import SEO from '@/components/SEO';

interface SavedSearch {
  id: string;
  name: string;
  filters: {
    cities?: string[];
    facilities?: string[];
    contracts?: string[];
    posted?: string;
    specialties?: string[];
  };
  email_alert: 'none' | 'daily' | 'weekly';
  last_checked_at: string;
  created_at: string;
}

export default function SavedSearches() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState<SavedSearch | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSavedSearches();
    handleUnsubscribe();
  }, [user, navigate]);

  const handleUnsubscribe = async () => {
    const params = new URLSearchParams(window.location.search);
    const unsubscribeId = params.get('unsubscribe');
    
    if (unsubscribeId) {
      const { error } = await supabase
        .from('saved_searches')
        .update({ email_alert: 'none' })
        .eq('id', unsubscribeId)
        .eq('user_id', user?.id);

      if (!error) {
        toast.success(t('saved_searches.unsubscribe_success'));
        // Remove the parameter from URL
        window.history.replaceState({}, '', '/saved-searches');
        fetchSavedSearches();
      }
    }
  };

  const fetchSavedSearches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved searches:', error);
      toast.error(t('error.load_failed'));
    } else {
      setSearches((data || []) as SavedSearch[]);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedSearch) return;

    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', selectedSearch.id);

    if (error) {
      console.error('Error deleting saved search:', error);
      toast.error(t('error.delete_failed'));
    } else {
      toast.success(t('saved_searches.deleted'));
      setSearches(searches.filter(s => s.id !== selectedSearch.id));
    }
    setDeleteDialogOpen(false);
    setSelectedSearch(null);
  };

  const handleRename = async () => {
    if (!selectedSearch || !newName.trim()) return;

    const { error } = await supabase
      .from('saved_searches')
      .update({ name: newName.trim() })
      .eq('id', selectedSearch.id);

    if (error) {
      console.error('Error renaming saved search:', error);
      toast.error(t('error.update_failed'));
    } else {
      toast.success(t('saved_searches.updated'));
      setSearches(searches.map(s => 
        s.id === selectedSearch.id ? { ...s, name: newName.trim() } : s
      ));
    }
    setRenameDialogOpen(false);
    setSelectedSearch(null);
    setNewName('');
  };

  const handleEmailAlertChange = async (searchId: string, alert: string) => {
    const { error } = await supabase
      .from('saved_searches')
      .update({ email_alert: alert })
      .eq('id', searchId);

    if (error) {
      console.error('Error updating email alert:', error);
      toast.error(t('error.update_failed'));
    } else {
      toast.success(t('saved_searches.updated'));
      setSearches(searches.map(s => 
        s.id === searchId ? { ...s, email_alert: alert as any } : s
      ));
    }
  };

  const handleViewResults = (search: SavedSearch) => {
    const params = new URLSearchParams();
    
    if (search.filters.cities?.length) {
      params.set('cities', search.filters.cities.join(','));
    }
    if (search.filters.facilities?.length) {
      params.set('facilities', search.filters.facilities.join(','));
    }
    if (search.filters.contracts?.length) {
      params.set('contracts', search.filters.contracts.join(','));
    }
    if (search.filters.posted) {
      params.set('posted', search.filters.posted);
    }
    if (search.filters.specialties?.length) {
      params.set('specialties', search.filters.specialties.join(','));
    }

    navigate(`/search?${params.toString()}`);
  };

  const getFilterCount = (filters: SavedSearch['filters']) => {
    let count = 0;
    if (filters.cities?.length) count += filters.cities.length;
    if (filters.facilities?.length) count += filters.facilities.length;
    if (filters.contracts?.length) count += filters.contracts.length;
    if (filters.posted) count += 1;
    if (filters.specialties?.length) count += filters.specialties.length;
    return count;
  };

  const getFilterSummary = (filters: SavedSearch['filters']) => {
    const parts: string[] = [];
    if (filters.cities?.length) parts.push(filters.cities.join(', '));
    if (filters.facilities?.length) parts.push(filters.facilities.join(', '));
    if (filters.contracts?.length) parts.push(filters.contracts.join(', '));
    return parts.join(' • ') || t('search.filters');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t('saved_searches.title')}
        description={t('saved_searches.subtitle')}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('saved_searches.title')}</h1>
          <p className="text-muted-foreground">
            {t('saved_searches.subtitle')}
          </p>
        </div>

        {searches.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t('saved_searches.empty_title')}
            description={t('saved_searches.empty_description')}
            action={{
              label: t('saved_searches.empty_action'),
              onClick: () => navigate('/search')
            }}
          />
        ) : (
          <div className="space-y-4">
            {searches.map((search) => (
              <Card key={search.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{search.name}</CardTitle>
                      <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                        <Badge variant="outline">
                          {getFilterCount(search.filters)} {t('saved_searches.filters_applied')}
                        </Badge>
                        <span className="hidden sm:inline">{getFilterSummary(search.filters)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedSearch(search);
                          setNewName(search.name);
                          setRenameDialogOpen(true);
                        }}
                        aria-label={`${search.name} ${t('common.rename')}`}
                      >
                        <Edit2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedSearch(search);
                          setDeleteDialogOpen(true);
                        }}
                        aria-label={`${search.name} ${t('common.delete')}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex-1 w-full sm:w-auto">
                      <Label htmlFor={`alert-${search.id}`} className="flex items-center gap-2 mb-2">
                        <Bell className="h-4 w-4" aria-hidden="true" />
                        {t('saved_searches.email_alerts')}
                      </Label>
                      <Select
                        value={search.email_alert}
                        onValueChange={(value) => handleEmailAlertChange(search.id, value)}
                      >
                        <SelectTrigger id={`alert-${search.id}`} className="w-full sm:w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('saved_searches.alert_none')}</SelectItem>
                          <SelectItem value="daily">{t('saved_searches.alert_daily')}</SelectItem>
                          <SelectItem value="weekly">{t('saved_searches.alert_weekly')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {search.email_alert !== 'none' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('saved_searches.unsubscribe_hint')}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleViewResults(search)}
                      className="w-full sm:w-auto"
                    >
                      {t('saved_searches.view_results')}
                      <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('saved_searches.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('saved_searches.delete_confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('privacy_center.delete_cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t('saved_searches.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('saved_searches.rename')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="search-name">{t('saved_searches.search_name')}</Label>
            <Input
              id="search-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('saved_searches.search_name_placeholder')}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              {t('privacy_center.delete_cancel')}
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}