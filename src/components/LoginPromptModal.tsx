import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogIn, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LoginPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginPromptModal({ open, onOpenChange }: LoginPromptModalProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = () => {
    onOpenChange(false);
    navigate('/auth');
  };

  const handleRegister = () => {
    onOpenChange(false);
    navigate('/auth?mode=signup');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-netflix-card border-netflix-card text-netflix-text max-w-md"
        aria-describedby="login-prompt-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-netflix-text">
            {t('auth.login_required.title')}
          </DialogTitle>
          <DialogDescription id="login-prompt-description" className="text-netflix-text-muted">
            {t('auth.login_required.message')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={handleLogin}
            className="w-full bg-netflix-red hover:bg-netflix-red-dark text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2"
            aria-label="Sign in to your account"
          >
            <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('menu.sign_in')}
          </Button>
          <Button
            onClick={handleRegister}
            variant="outline"
            className="w-full border-netflix-card text-netflix-text hover:bg-netflix-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2"
            aria-label="Create a new account"
          >
            <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('menu.register')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
