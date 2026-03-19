import QRCode from 'qrcode';

interface OverlayOptions {
  qrSize?: number;
  qrPosition?: 'bottom-right' | 'bottom-center' | 'top-right' | 'center';
  padding?: number;
  backgroundColor?: string;
}

/**
 * Generates a QR code as a data URL
 */
const generateQRCode = async (data: string, size: number): Promise<string> => {
  return QRCode.toDataURL(data, {
    width: size,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
};

/**
 * Loads an image from a URL
 */
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

/**
 * Overlays a QR code on a coupon image
 */
export const overlayQROnCoupon = async (
  couponImageUrl: string,
  redemptionCode: string,
  options: OverlayOptions = {}
): Promise<string> => {
  const {
    qrSize = 200,
    qrPosition = 'bottom-right',
    padding = 20,
    backgroundColor = '#FFFFFF',
  } = options;

  try {
    // Load the coupon image
    const couponImage = await loadImage(couponImageUrl);
    
    // Generate QR code
    const qrDataUrl = await generateQRCode(redemptionCode, qrSize);
    const qrImage = await loadImage(qrDataUrl);

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = couponImage.width;
    canvas.height = couponImage.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw coupon image
    ctx.drawImage(couponImage, 0, 0);

    // Calculate QR code position with white background
    let qrX = 0;
    let qrY = 0;
    const bgPadding = 10;
    const bgSize = qrSize + (bgPadding * 2);

    switch (qrPosition) {
      case 'bottom-right':
        qrX = canvas.width - qrSize - padding - bgPadding;
        qrY = canvas.height - qrSize - padding - bgPadding;
        break;
      case 'bottom-center':
        qrX = (canvas.width - qrSize) / 2 - bgPadding;
        qrY = canvas.height - qrSize - padding - bgPadding;
        break;
      case 'top-right':
        qrX = canvas.width - qrSize - padding - bgPadding;
        qrY = padding;
        break;
      case 'center':
        qrX = (canvas.width - qrSize) / 2 - bgPadding;
        qrY = (canvas.height - qrSize) / 2 - bgPadding;
        break;
    }

    // Draw white background rectangle for QR code
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(qrX, qrY, bgSize, bgSize);

    // Add subtle border
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 2;
    ctx.strokeRect(qrX, qrY, bgSize, bgSize);

    // Draw QR code on top
    ctx.drawImage(qrImage, qrX + bgPadding, qrY + bgPadding, qrSize, qrSize);

    // Add redemption code text below QR (if space available)
    if (qrPosition === 'bottom-right' || qrPosition === 'bottom-center') {
      const textY = qrY + bgSize + 20;
      if (textY < canvas.height - 30) {
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#1F2937';
        ctx.textAlign = 'center';
        ctx.fillText(
          redemptionCode,
          qrX + bgSize / 2,
          textY
        );
      }
    }

    // Convert to data URL
    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Error overlaying QR code:', error);
    throw error;
  }
};

/**
 * Downloads an image from a data URL
 */
export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Converts data URL to Blob for storage
 */
export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return response.blob();
};

/**
 * Upload generated coupon image to storage for sharing
 */
export const uploadCouponImageToStorage = async (
  dataUrl: string,
  filename: string
): Promise<string | null> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Convert data URL to blob
    const blob = await dataUrlToBlob(dataUrl);
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('coupon-images')
      .upload(`shared/${filename}`, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/png',
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('coupon-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading to storage:', error);
    return null;
  }
};

/**
 * Share image via native share API (mobile) or download (desktop)
 */
export const shareImage = async (dataUrl: string, title: string, text: string) => {
  try {
    const blob = await dataUrlToBlob(dataUrl);
    const file = new File([blob], `${title}.png`, { type: 'image/png' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      // Use native share on mobile
      await navigator.share({
        title,
        text,
        files: [file],
      });
      return { success: true, method: 'native' };
    } else {
      // Fallback to download on desktop
      downloadImage(dataUrl, `${title}.png`);
      return { success: true, method: 'download' };
    }
  } catch (error) {
    console.error('Error sharing image:', error);
    return { success: false, error };
  }
};
