import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' })
});

const Auth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: ''
    }
  });
  
  // If user is already logged in, redirect to redeem page
  useEffect(() => {
    if (user) {
      navigate('/redeem');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg('');
    try {
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin + '/auth/callback',
      });
      if (error) {
        console.error('Google sign-in error:', error);
        setErrorMsg(error.message || 'Google sign-in failed');
        toast.error('Google sign-in failed: ' + (error.message || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMsg(err?.message || 'Google sign-in failed');
      toast.error('Google sign-in failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleMagicLink = async (values: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          emailRedirectTo: `${window.location.origin}/redeem`
        }
      });
      
      if (error) {
        console.error('Magic link error:', error);
        setErrorMsg(error.message);
        toast.error('Failed to send login link: ' + error.message);
        return;
      }
      
      setSentToEmail(values.email);
      setEmailSent(true);
      toast.success('Check your email for the login link!');
    } catch (err: any) {
      console.error('Magic link error:', err);
      setErrorMsg(err?.message || 'An unexpected error occurred');
      toast.error('Failed to send login link: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-toronto-gray p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <img 
            src="/lovable-uploads/anthony-perruzza-logo.jpg" 
            alt="Anthony Perruzza - City Councillor, Humber River - Black Creek" 
            className="h-24 mb-4"
          />
          <p className="text-gray-600">
            Staff Login
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-playfair">
                {emailSent ? 'Check Your Email' : 'Passwordless Login'}
              </CardTitle>
              {emailSent ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Mail className="h-6 w-6 text-toronto-blue" />}
            </div>
            <CardDescription>
              {emailSent 
                ? `We sent a login link to ${sentToEmail}` 
                : 'Enter your email to receive a secure login link'
              }
            </CardDescription>
          </CardHeader>
          
          {errorMsg && (
            <div className="px-6">
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            </div>
          )}

          {emailSent ? (
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-green-900">
                      Login link sent!
                    </p>
                    <p className="text-sm text-green-700">
                      Check your inbox and click the link to log in. The link will expire in 1 hour.
                    </p>
                    <p className="text-xs text-green-600">
                      Don't see it? Check your spam folder.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setSentToEmail('');
                  setErrorMsg('');
                  emailForm.reset();
                }}
              >
                Send to a different email
              </Button>
            </CardContent>
          ) : (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleMagicLink)}>
                <CardContent className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isGoogleLoading}
                    onClick={handleGoogleSignIn}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                    </div>
                  </div>

                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter your work email" 
                            {...field} 
                            disabled={isLoading}
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      <strong>No password needed.</strong> We'll send you a secure login link to access the redemption scanner.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-toronto-blue hover:bg-toronto-lightblue"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Mail className="h-4 w-4 mr-2 animate-pulse" />
                        Sending Login Link...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Login Link
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-500">
            <Link to="/" className="text-toronto-blue hover:underline">
              ← Back to Survey
            </Link>
          </p>
          <p className="text-xs text-gray-400">
            Secure passwordless authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;