import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          toast.error('Authentication failed: ' + error.message);
          navigate('/admin');
          return;
        }
        if (session) {
          toast.success('Signed in successfully');
          navigate('/admin/dashboard');
        } else {
          toast.error('No session found after sign-in');
          navigate('/admin');
        }
      } catch (err: any) {
        toast.error('Authentication error: ' + (err?.message || 'Unknown error'));
        navigate('/admin');
      }
    };
    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-toronto-gray">
      <p className="text-muted-foreground">Completing sign-in...</p>
    </div>
  );
};

export default AuthCallback;
