import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with null to avoid hydration mismatches
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null)
  
  React.useEffect(() => {
    // Use media query for better performance and prevent re-render loops
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Use the match result directly to avoid layout shift
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    
    // Set initial value
    setIsMobile(mql.matches)
    
    // Use the more reliable addEventListener with passive option for better performance
    mql.addEventListener("change", handleChange)
    
    return () => mql.removeEventListener("change", handleChange)
  }, [])

  // Return false during SSR/hydration to prevent mismatches
  return isMobile ?? false
}
