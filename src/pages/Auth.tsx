import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PasswordValidator, validatePassword } from '@/components/PasswordValidator';
import { PasswordInput } from '@/components/PasswordInput';
import SEO from '@/components/SEO';
import { TestTube } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const mapSupabaseError = (error: any): string => {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid credentials')) {
    return 'auth.error.invalid_credentials';
  }
  if (errorMessage.includes('email not confirmed')) {
    return 'auth.error.email_not_confirmed';
  }
  if (errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
    return 'auth.error.too_many_requests';
  }
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'auth.error.network';
  }
  
  return 'auth.error.generic';
};

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? false : true;
  const [isLogin, setIsLogin] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('bewerber');
  const [loading, setLoading] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);
  const [showPasswordChecklist, setShowPasswordChecklist] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const { signIn, signUp, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { isValid: isPasswordValid } = validatePassword(password);
  const shouldValidatePassword = !isLogin;
  const isPasswordInvalid = shouldValidatePassword && passwordTouched && !isPasswordValid;
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isConfirmPasswordInvalid = shouldValidatePassword && confirmPasswordTouched && !passwordsMatch && confirmPassword.length > 0;

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Only prevent paste on password fields for security, allow normal typing
  const handlePasswordPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleDemoLogin = async (demoRole: 'candidate' | 'employer') => {
    const demoCredentials = {
      candidate: {
        email: 'demo.candidate@pflegeflix.de',
        password: 'DemoCandidate2025!@'
      },
      employer: {
        email: 'demo.employer@pflegeflix.de',
        password: 'DemoEmployer2025!@'
      }
    };

    const creds = demoCredentials[demoRole];
    setEmail(creds.email);
    setPassword(creds.password);
    setLoading(true);

    try {
      const { error } = await signIn(creds.email, creds.password);
      if (error) {
        toast.error(`Demo ${demoRole} account not found. Please create it first with these credentials: ${creds.email} / ${creds.password}`);
      } else {
        toast.success(`Logged in as demo ${demoRole}!`);
        navigate('/');
      }
    } catch (error: any) {
      toast.error(`Demo login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShake(false);

    // Validate password for Sign Up
    if (shouldValidatePassword && !isPasswordValid) {
      setPasswordTouched(true);
      setShowPasswordChecklist(true);
      setLoading(false);
      passwordRef.current?.focus();
      return;
    }

    // Validate passwords match for Sign Up
    if (shouldValidatePassword && !passwordsMatch) {
      setConfirmPasswordTouched(true);
      setLoading(false);
      confirmPasswordRef.current?.focus();
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          const errorKey = mapSupabaseError(error);
          setErrorMessage(errorKey);
          setErrorModalOpen(true);
        } else {
          toast.success('Login successful!');
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, role);
        if (error) {
          toast.error(error.message);
          // Keep fields on error - don't clear them
        } else {
          toast.success(t('auth.success.account_created'));
          // Only clear fields on successful registration
          setPassword('');
          setConfirmPassword('');
          setPasswordTouched(false);
          setConfirmPasswordTouched(false);
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      const errorKey = mapSupabaseError(error);
      setErrorMessage(errorKey);
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setErrorModalOpen(false);
    setShake(true);
    setTimeout(() => {
      passwordRef.current?.focus();
      passwordRef.current?.select();
      setShake(false);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-netflix-bg flex items-center justify-center px-4 py-8">
      <SEO 
        title={isLogin ? "Anmelden" : "Registrieren"}
        description={isLogin ? "Melde dich bei Pflegeflix an und finde deinen Traumjob in der Pflege." : "Erstelle ein kostenloses Konto bei Pflegeflix und bewirb dich auf Pflegejobs in ganz Deutschland."}
        canonical="/auth"
        noindex={true}
      />
      
      <div className="w-full max-w-md space-y-4">
        <Alert className="bg-amber-900/20 border-amber-500/50 text-amber-200">
          <TestTube className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <strong>Demo Environment</strong> - Quick testing available below
          </AlertDescription>
        </Alert>

        <Card className="bg-netflix-card border-netflix-card">
        <CardHeader>
          <CardTitle className="text-2xl text-white">
            <h1>{isLogin ? t('nav.login') : 'Registrieren'}</h1>
          </CardTitle>
          <CardDescription className="text-netflix-text-muted">
            {isLogin ? 'Melde dich mit deinem Konto an' : 'Erstelle ein neues Konto'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {errorMessage && t(errorMessage)}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-netflix-bg border-netflix-card text-white"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <PasswordInput
                ref={passwordRef}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => {
                  if (!isLogin && password.length > 0) {
                    setPasswordTouched(true);
                  }
                }}
                onFocus={() => {
                  if (!isLogin) {
                    setShowPasswordChecklist(true);
                  }
                }}
                onPaste={!isLogin ? handlePasswordPaste : undefined}
                autoComplete={!isLogin ? "new-password" : "current-password"}
                aria-describedby={!isLogin ? "password-requirements" : undefined}
                required
                className={`bg-netflix-bg border-netflix-card text-white ${shake ? 'animate-shake' : ''} ${
                  isPasswordInvalid ? 'border-red-500' : ''
                }`}
              />
              {!isLogin && (
                <>
                  <p className="text-xs text-netflix-text-muted mt-1">
                    Pasting is disabled for security.
                  </p>
                  <div id="password-requirements">
                    <PasswordValidator 
                      password={password} 
                      showChecklist={showPasswordChecklist || (passwordTouched && !isPasswordValid)} 
                    />
                  </div>
                </>
              )}
            </div>
            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword" className="text-white">
                  {t('auth.confirm_password')}
                </Label>
                <PasswordInput
                  ref={confirmPasswordRef}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => {
                    if (confirmPassword.length > 0) {
                      setConfirmPasswordTouched(true);
                    }
                  }}
                  onPaste={handlePasswordPaste}
                  autoComplete="new-password"
                  aria-describedby="confirm-password-feedback"
                  required
                  className={`bg-netflix-bg border-netflix-card text-white ${
                    isConfirmPasswordInvalid ? 'border-red-500' : ''
                  }`}
                />
                <div id="confirm-password-feedback" className="mt-1">
                  {confirmPassword.length > 0 && passwordsMatch && isPasswordValid && (
                    <p className="text-sm text-green-500">
                      {t('auth.passwords_match')}
                    </p>
                  )}
                  {confirmPasswordTouched && isConfirmPasswordInvalid && (
                    <p className="text-sm text-red-500">
                      {t('auth.passwords_no_match')}
                    </p>
                  )}
                </div>
              </div>
            )}
            {!isLogin && (
              <div>
                <Label htmlFor="role" className="text-white">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-netflix-bg border-netflix-card text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-netflix-card border-netflix-card">
                    <SelectItem value="bewerber">Bewerber/in (Candidate)</SelectItem>
                    <SelectItem value="arbeitgeber">Arbeitgeber/in (Employer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-netflix-red hover:bg-netflix-red-dark text-white"
              disabled={loading || (shouldValidatePassword && (password.length < 8 || confirmPassword.length < 8 || !isPasswordValid || !passwordsMatch))}
            >
              {loading ? 'Loading...' : (isLogin ? t('nav.login') : 'Register')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-netflix-text-muted hover:text-white transition"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-6 pt-6 border-t border-netflix-card">
              <p className="text-xs text-netflix-text-muted text-center mb-3">
                Demo Accounts (Create these first via signup above)
              </p>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2"
                  onClick={() => handleDemoLogin('candidate')}
                  disabled={loading}
                >
                  <TestTube className="h-4 w-4" />
                  Demo as Candidate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2"
                  onClick={() => handleDemoLogin('employer')}
                  disabled={loading}
                >
                  <TestTube className="h-4 w-4" />
                  Demo as Employer
                </Button>
              </div>
              <details className="mt-4">
                <summary className="text-xs text-netflix-text-muted cursor-pointer hover:text-white">
                  Show demo credentials
                </summary>
                <div className="mt-2 p-3 bg-netflix-bg rounded border border-netflix-card text-xs space-y-2">
                  <div>
                    <strong className="text-white">Candidate:</strong>
                    <br />
                    <code className="text-netflix-text-muted">demo.candidate@pflegeflix.de</code>
                    <br />
                    <code className="text-netflix-text-muted">DemoCandidate2025!@</code>
                  </div>
                  <div>
                    <strong className="text-white">Employer:</strong>
                    <br />
                    <code className="text-netflix-text-muted">demo.employer@pflegeflix.de</code>
                    <br />
                    <code className="text-netflix-text-muted">DemoEmployer2025!@</code>
                  </div>
                </div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
        <DialogContent className="bg-netflix-card border-netflix-card text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">{t('auth.error.title')}</DialogTitle>
            <DialogDescription className="text-netflix-text-muted text-center pt-2">
              {t(errorMessage)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
            <Button
              onClick={handleTryAgain}
              className="w-full bg-netflix-red hover:bg-netflix-red-dark text-white"
            >
              {t('auth.error.try_again')}
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <Link to="/reset-password">{t('auth.error.reset_password')}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <Link to="/auth" onClick={() => { setIsLogin(false); setErrorModalOpen(false); }}>
                {t('auth.error.create_account')}
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}