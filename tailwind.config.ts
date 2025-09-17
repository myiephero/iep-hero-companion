import type { Config } from "tailwindcss";

export default {
        darkMode: ["class"],
        content: [
                "./pages/**/*.{ts,tsx}",
                "./components/**/*.{ts,tsx}",
                "./app/**/*.{ts,tsx}",
                "./src/**/*.{ts,tsx}",
        ],
        prefix: "",
        theme: {
                container: {
                        center: false,
                        padding: '0',
                        screens: {
                                '2xl': '1400px'
                        }
                },
                extend: {
                        colors: {
                                border: 'hsl(var(--border))',
                                'border-light': 'hsl(var(--border-light))',
                                input: 'hsl(var(--input))',
                                ring: 'hsl(var(--ring))',
                                background: 'hsl(var(--background))',
                                foreground: 'hsl(var(--foreground))',
                                hover: 'hsl(var(--hover))',
                                primary: {
                                        DEFAULT: 'hsl(var(--primary))',
                                        foreground: 'hsl(var(--primary-foreground))',
                                        light: 'hsl(var(--primary-light))',
                                        dark: 'hsl(var(--primary-dark))',
                                        glow: 'hsl(var(--primary-glow))'
                                },
                                secondary: {
                                        DEFAULT: 'hsl(var(--secondary))',
                                        foreground: 'hsl(var(--secondary-foreground))',
                                        light: 'hsl(var(--secondary-light))',
                                        soft: 'hsl(var(--secondary-soft))'
                                },
                                accent: {
                                        DEFAULT: 'hsl(var(--accent))',
                                        foreground: 'hsl(var(--accent-foreground))',
                                        light: 'hsl(var(--accent-light))',
                                        soft: 'hsl(var(--accent-soft))'
                                },
                                success: {
                                        DEFAULT: 'hsl(var(--success))',
                                        foreground: 'hsl(var(--success-foreground))',
                                        light: 'hsl(var(--success-light))',
                                        soft: 'hsl(var(--success-soft))'
                                },
                                warning: {
                                        DEFAULT: 'hsl(var(--warning))',
                                        foreground: 'hsl(var(--warning-foreground))',
                                        light: 'hsl(var(--warning-light))',
                                        soft: 'hsl(var(--warning-soft))'
                                },
                                destructive: {
                                        DEFAULT: 'hsl(var(--destructive))',
                                        foreground: 'hsl(var(--destructive-foreground))',
                                        light: 'hsl(var(--destructive-light))',
                                        soft: 'hsl(var(--destructive-soft))'
                                },
                                muted: {
                                        DEFAULT: 'hsl(var(--muted))',
                                        foreground: 'hsl(var(--muted-foreground))'
                                },
                                subtle: {
                                        DEFAULT: 'hsl(var(--subtle))',
                                        foreground: 'hsl(var(--subtle-foreground))'
                                },
                                card: {
                                        DEFAULT: 'hsl(var(--card))',
                                        foreground: 'hsl(var(--card-foreground))'
                                },
                                surface: {
                                        DEFAULT: 'hsl(var(--surface))',
                                        elevated: 'hsl(var(--surface-elevated))',
                                        glass: 'hsl(var(--surface-glass))'
                                },
                                sidebar: {
                                        DEFAULT: 'hsl(var(--sidebar-background))',
                                        foreground: 'hsl(var(--sidebar-foreground))',
                                        primary: 'hsl(var(--sidebar-primary))',
                                        'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                                        accent: 'hsl(var(--sidebar-accent))',
                                        'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                                        border: 'hsl(var(--sidebar-border))',
                                        ring: 'hsl(var(--sidebar-ring))'
                                }
                        },
                        backgroundImage: {
                                'gradient-hero': 'var(--gradient-hero)',
                                'gradient-card': 'var(--gradient-card)',
                                'gradient-glass': 'var(--gradient-glass)',
                                'gradient-sidebar': 'var(--gradient-sidebar)',
                                'gradient-primary': 'var(--gradient-primary)',
                                'gradient-secondary': 'var(--gradient-secondary)',
                                'gradient-accent': 'var(--gradient-accent)',
                                'gradient-rainbow': 'var(--gradient-rainbow)'
                        },
                        boxShadow: {
                                'xs': 'var(--shadow-xs)',
                                'sm': 'var(--shadow-sm)',
                                'md': 'var(--shadow-md)',
                                'lg': 'var(--shadow-lg)',
                                'xl': 'var(--shadow-xl)',
                                'glow': 'var(--shadow-glow)',
                                'glass': 'var(--shadow-glass)',
                                'button': 'var(--shadow-button)',
                                'button-hover': 'var(--shadow-button-hover)'
                        },
                        transitionTimingFunction: {
                                'micro': 'var(--transition-micro)',
                                'fast': 'var(--transition-fast)',
                                'smooth': 'var(--transition-smooth)',
                                'slow': 'var(--transition-slow)',
                                'spring': 'var(--transition-spring)',
                                'bounce': 'var(--transition-bounce)'
                        },
                        borderRadius: {
                                lg: 'var(--radius-lg)',
                                md: 'var(--radius)',
                                sm: 'var(--radius-sm)',
                                full: 'var(--radius-full)'
                        },
                        keyframes: {
                                'accordion-down': {
                                        from: {
                                                height: '0'
                                        },
                                        to: {
                                                height: 'var(--radix-accordion-content-height)'
                                        }
                                },
                                'accordion-up': {
                                        from: {
                                                height: 'var(--radix-accordion-content-height)'
                                        },
                                        to: {
                                                height: '0'
                                        }
                                }
                        },
                        animation: {
                                'accordion-down': 'accordion-down 0.2s ease-out',
                                'accordion-up': 'accordion-up 0.2s ease-out'
                        },
                        spacing: {
                                'safe': 'env(safe-area-inset-bottom)',
                                'safe-top': 'env(safe-area-inset-top)',
                                'safe-bottom': 'env(safe-area-inset-bottom)',
                                'safe-left': 'env(safe-area-inset-left)',
                                'safe-right': 'env(safe-area-inset-right)'
                        }
                }
        },
        plugins: [
                require("tailwindcss-animate"),
                function({ addUtilities }) {
                        const safeAreaUtilities = {
                                '.pt-safe': {
                                        paddingTop: 'max(1rem, env(safe-area-inset-top))'
                                },
                                '.pb-safe': {
                                        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
                                },
                                '.pl-safe': {
                                        paddingLeft: 'max(1rem, env(safe-area-inset-left))'
                                },
                                '.pr-safe': {
                                        paddingRight: 'max(1rem, env(safe-area-inset-right))'
                                },
                                '.p-safe': {
                                        paddingTop: 'max(1rem, env(safe-area-inset-top))',
                                        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                                        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
                                        paddingRight: 'max(1rem, env(safe-area-inset-right))'
                                }
                        };
                        addUtilities(safeAreaUtilities);
                }
        ],
} satisfies Config;
