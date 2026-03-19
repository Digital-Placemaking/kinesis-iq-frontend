import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Save, X, Gift, FileUp, QrCode, Clock, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PdfUploadDialog } from './PdfUploadDialog';
import { ImageUploadDialog } from './ImageUploadDialog';
import CouponQRDialog from './CouponQRDialog';

interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  expires_at: string;
  active: boolean;
  pdf_url?: string;
  image_url?: string;
  created_at: string;
  partner_id?: string;
  valid_days?: string[];
  valid_time_start?: string;
  valid_time_end?: string;
}

interface Partner {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

interface CouponManagerProps {
  selectedPartner?: string;
}

const CouponManager: React.FC<CouponManagerProps> = ({ selectedPartner }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [pdfUploadDialogOpen, setPdfUploadDialogOpen] = useState(false);
  const [selectedCouponForPdf, setSelectedCouponForPdf] = useState<string | null>(null);
  const [imageUploadDialogOpen, setImageUploadDialogOpen] = useState(false);
  const [selectedCouponForImage, setSelectedCouponForImage] = useState<string | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedCouponForQr, setSelectedCouponForQr] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    discount: '',
    expires_at: '',
    active: true,
    partner_id: '',
    valid_days: [] as string[],
    valid_time_start: '',
    valid_time_end: ''
  });

  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchCoupons = async () => {
    try {
      let query = supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Filter by partner if one is selected
      if (selectedPartner && selectedPartner !== 'all') {
        query = query.eq('partner_id', selectedPartner);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error(`Failed to load coupons: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch partners for dropdown
  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, slug, active')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchPartners();
    
    // Set up real-time subscription for coupons
    const channel = supabase
      .channel('public:coupons')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'coupons' },
        () => {
          fetchCoupons();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Re-fetch when partner filter changes
  useEffect(() => {
    fetchCoupons();
  }, [selectedPartner]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      code: '',
      discount: '',
      expires_at: '',
      active: true,
      partner_id: selectedPartner === 'all' ? '' : selectedPartner || '',
      valid_days: [],
      valid_time_start: '',
      valid_time_end: ''
    });
    setEditingCoupon(null);
  };

  const handleAddCoupon = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      title: coupon.title,
      description: coupon.description,
      code: coupon.code,
      discount: coupon.discount,
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '', // Format for date input
      active: coupon.active,
      partner_id: coupon.partner_id || '',
      valid_days: coupon.valid_days || [],
      valid_time_start: coupon.valid_time_start || '',
      valid_time_end: coupon.valid_time_end || ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveCoupon = async () => {
    try {
      const couponData = {
        ...formData,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        partner_id: formData.partner_id || null, // Convert empty string to null
        valid_days: formData.valid_days.length > 0 ? formData.valid_days : null,
        valid_time_start: formData.valid_time_start || null,
        valid_time_end: formData.valid_time_end || null
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);

        if (error) throw error;
        toast.success('Coupon updated successfully');
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([couponData]);

        if (error) throw error;
        toast.success('Coupon created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error('Failed to save coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This will also remove all related user claims and engagement data.')) return;

    try {
      // With CASCADE DELETE enabled, we only need to delete the coupon
      // All related records in user_coupons, engagement_events, and user_wallets will be automatically deleted
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      
      toast.success('Coupon and all related data deleted successfully');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error(`Failed to delete coupon: ${error.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-toronto-blue"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Coupon Management</CardTitle>
            <CardDescription>
              Create and manage promotional coupons for your customers
            </CardDescription>
          </div>
          <Button onClick={handleAddCoupon}>
            <Plus className="mr-2 h-4 w-4" /> Add Coupon
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {coupons.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons yet</h3>
                <p className="text-gray-500 mb-4">Create your first coupon to get started with promotional offers.</p>
                <Button onClick={handleAddCoupon}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Coupon
                </Button>
              </div>
            ) : (
              coupons.map((coupon) => (
                <div key={coupon.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{coupon.title}</h3>
                        <Badge variant={coupon.active ? "default" : "secondary"}>
                          {coupon.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                       <p className="text-gray-600 mb-2">{coupon.description}</p>
                      {coupon.image_url && (
                        <div className="mb-3">
                          <img 
                            src={coupon.image_url} 
                            alt={coupon.title} 
                            className="max-w-xs h-auto rounded-lg border"
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Code:</span> {coupon.code}
                        </div>
                        <div>
                          <span className="font-medium">Discount:</span> {coupon.discount}
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span> {coupon.expires_at ? formatDate(coupon.expires_at) : 'No expiry'}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(coupon.created_at)}
                        </div>
                      </div>
                      {coupon.valid_days && coupon.valid_days.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Schedule:</span>
                          <span>{coupon.valid_days.join(', ')}</span>
                          {coupon.valid_time_start && coupon.valid_time_end && (
                            <span className="text-muted-foreground">
                              ({coupon.valid_time_start} - {coupon.valid_time_end})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedCouponForQr(coupon);
                          setQrDialogOpen(true);
                        }}
                        title="Generate QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCouponForPdf(coupon.id);
                          setPdfUploadDialogOpen(true);
                        }}
                        title={coupon.pdf_url ? 'Update PDF' : 'Upload PDF'}
                      >
                        <FileUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCouponForImage(coupon.id);
                          setImageUploadDialogOpen(true);
                        }}
                        title={coupon.image_url ? 'Update Image' : 'Upload Image'}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCoupon(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon ? 'Update the coupon details below.' : 'Fill in the details to create a new coupon.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter coupon title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter coupon description"
              />
            </div>
            
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Enter coupon code"
              />
            </div>
            
            <div>
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="e.g., 20% off, $10 off, Buy 1 Get 1 Free"
              />
            </div>
            
            <div>
              <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="partner_id">Partner (Optional)</Label>
              <Select
                value={formData.partner_id || 'none'}
                onValueChange={(value) => setFormData({ ...formData, partner_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Partner (Global)</SelectItem>
                  {partners.map(partner => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Recurring Schedule (Optional)</Label>
              <p className="text-sm text-muted-foreground">Select days and time range when this coupon is available each week</p>
              
              <div className="space-y-2">
                <Label className="text-sm">Days of Week</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={formData.valid_days.includes(day)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, valid_days: [...formData.valid_days, day] });
                          } else {
                            setFormData({ ...formData, valid_days: formData.valid_days.filter(d => d !== day) });
                          }
                        }}
                      />
                      <label htmlFor={day} className="text-sm cursor-pointer">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid_time_start" className="text-sm">Start Time</Label>
                  <Input
                    id="valid_time_start"
                    type="time"
                    value={formData.valid_time_start}
                    onChange={(e) => setFormData({ ...formData, valid_time_start: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="valid_time_end" className="text-sm">End Time</Label>
                  <Input
                    id="valid_time_end"
                    type="time"
                    value={formData.valid_time_end}
                    onChange={(e) => setFormData({ ...formData, valid_time_end: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSaveCoupon}>
              <Save className="mr-2 h-4 w-4" /> 
              {editingCoupon ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedCouponForPdf && (
        <PdfUploadDialog
          open={pdfUploadDialogOpen}
          onOpenChange={setPdfUploadDialogOpen}
          couponId={selectedCouponForPdf}
          onSuccess={(url) => {
            toast.success('PDF uploaded successfully');
            fetchCoupons();
            setPdfUploadDialogOpen(false);
            setSelectedCouponForPdf(null);
          }}
        />
      )}

      {selectedCouponForImage && (
        <ImageUploadDialog
          open={imageUploadDialogOpen}
          onOpenChange={setImageUploadDialogOpen}
          couponId={selectedCouponForImage}
          onSuccess={() => {
            toast.success('Image uploaded successfully');
            fetchCoupons();
            setImageUploadDialogOpen(false);
            setSelectedCouponForImage(null);
          }}
        />
      )}

      {selectedCouponForQr && (
        <CouponQRDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          coupon={selectedCouponForQr}
        />
      )}
    </>
  );
};

export default CouponManager;
