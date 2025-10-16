import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSecurityEvent?: (e: React.ClipboardEvent | React.DragEvent) => void;
  onSecurityKeyDown?: (e: React.KeyboardEvent) => void;
  onSecurityContextMenu?: (e: React.MouseEvent) => void;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, onSecurityEvent, onSecurityKeyDown, onSecurityContextMenu, onBlur, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isLongPressing, setIsLongPressing] = React.useState(false);
    const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
    const autoHideTimerRef = React.useRef<NodeJS.Timeout | null>(null);
    const { t } = useLanguage();

    const clearTimers = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
        autoHideTimerRef.current = null;
      }
    };

    const startAutoHideTimer = () => {
      clearTimers();
      autoHideTimerRef.current = setTimeout(() => {
        setShowPassword(false);
        setIsLongPressing(false);
      }, 10000);
    };

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => {
        const newState = !prev;
        if (newState) {
          startAutoHideTimer();
        } else {
          clearTimers();
        }
        return newState;
      });
    };

    const handleMouseDown = () => {
      longPressTimerRef.current = setTimeout(() => {
        setIsLongPressing(true);
        setShowPassword(true);
      }, 500);
    };

    const handleMouseUp = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      if (isLongPressing) {
        setShowPassword(false);
        setIsLongPressing(false);
      }
    };

    const handleTouchStart = () => {
      longPressTimerRef.current = setTimeout(() => {
        setIsLongPressing(true);
        setShowPassword(true);
      }, 500);
    };

    const handleTouchEnd = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      if (isLongPressing) {
        setShowPassword(false);
        setIsLongPressing(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePasswordVisibility();
      }
    };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Don't hide password on blur to prevent value loss
    onBlur?.(e);
  };

    React.useEffect(() => {
      return () => {
        clearTimers();
      };
    }, []);

    const ariaLabel = showPassword ? t('auth.password.hide') : t('auth.password.show');

    return (
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background pr-12 pl-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className,
          )}
          ref={ref}
          onCopy={onSecurityEvent}
          onCut={onSecurityEvent}
          onPaste={onSecurityEvent}
          onDrop={onSecurityEvent}
          onKeyDown={onSecurityKeyDown}
          onContextMenu={onSecurityContextMenu}
          onBlur={handleBlur}
          aria-describedby={`${props.id}-visibility`}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onKeyDown={handleKeyDown}
          className="absolute right-0 top-0 h-10 w-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          aria-label={ariaLabel}
          aria-pressed={showPassword}
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <span id={`${props.id}-visibility`} className="sr-only" aria-live="polite">
          {showPassword ? t('auth.password.visible') : t('auth.password.hidden')}
        </span>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
