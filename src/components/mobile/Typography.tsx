import { cn } from "@/lib/utils"

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Mobile-optimized typography components with proper font sizes for readability
 * Based on iOS/Android guidelines and accessibility standards
 */

// Mobile Headings - Large and readable
export function MobileH1({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 
      className={cn(
        "text-2xl font-bold leading-tight tracking-tight text-foreground", // 24px
        "sm:text-3xl", // 30px on larger screens
        className
      )} 
      {...props}
      data-testid="mobile-h1"
    >
      {children}
    </h1>
  )
}

export function MobileH2({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 
      className={cn(
        "text-xl font-semibold leading-tight text-foreground", // 20px
        "sm:text-2xl", // 24px on larger screens
        className
      )} 
      {...props}
      data-testid="mobile-h2"
    >
      {children}
    </h2>
  )
}

export function MobileH3({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 
      className={cn(
        "text-lg font-semibold leading-snug text-foreground", // 18px
        "sm:text-xl", // 20px on larger screens
        className
      )} 
      {...props}
      data-testid="mobile-h3"
    >
      {children}
    </h3>
  )
}

// Mobile Body Text - Minimum 16px for readability
export function MobileBodyLarge({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={cn(
        "text-lg leading-relaxed text-foreground", // 18px
        className
      )} 
      {...props}
      data-testid="mobile-body-large"
    >
      {children}
    </p>
  )
}

export function MobileBody({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={cn(
        "text-base leading-relaxed text-foreground", // 16px - minimum readable size
        className
      )} 
      {...props}
      data-testid="mobile-body"
    >
      {children}
    </p>
  )
}

export function MobileBodySmall({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={cn(
        "text-sm leading-relaxed text-muted-foreground", // 14px - for secondary info only
        className
      )} 
      {...props}
      data-testid="mobile-body-small"
    >
      {children}
    </p>
  )
}

// Mobile Labels and Captions
export function MobileLabel({ children, className, ...props }: TypographyProps & React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label 
      className={cn(
        "text-base font-medium text-foreground", // 16px - same as body for consistency
        className
      )} 
      {...props}
      data-testid="mobile-label"
    >
      {children}
    </label>
  )
}

export function MobileCaption({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span 
      className={cn(
        "text-sm text-muted-foreground", // 14px - for captions and metadata
        className
      )} 
      {...props}
      data-testid="mobile-caption"
    >
      {children}
    </span>
  )
}

// Mobile Button Text - Enhanced for touch
export function MobileButtonText({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span 
      className={cn(
        "text-base font-medium", // 16px - clear and readable for actions
        className
      )} 
      {...props}
      data-testid="mobile-button-text"
    >
      {children}
    </span>
  )
}

// Mobile Link Text
export function MobileLink({ children, className, href, ...props }: TypographyProps & React.HTMLAttributes<HTMLAnchorElement> & { href?: string }) {
  return (
    <a 
      href={href}
      className={cn(
        "text-base text-primary underline-offset-4 hover:underline", // 16px
        "min-h-[44px] min-w-[44px] inline-flex items-center", // Touch target
        className
      )} 
      {...props}
      data-testid="mobile-link"
    >
      {children}
    </a>
  )
}