import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link" | "teal"
  size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:pointer-events-none disabled:opacity-50"

    let variantStyles = ""
    switch (variant) {
      case "default":
        variantStyles = "bg-teal-700 text-white hover:bg-teal-600 shadow-md shadow-teal-700/20"
        break
      case "teal":
        variantStyles = "bg-teal-700 text-white hover:bg-teal-600 shadow-md shadow-teal-700/20"
        break
      case "outline":
        variantStyles = "border border-teal-200 bg-white text-teal-800 hover:bg-teal-50 hover:text-teal-950"
        break
      case "secondary":
        variantStyles = "bg-teal-50 text-teal-900 hover:bg-teal-100"
        break
      case "destructive":
        variantStyles = "bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/10"
        break
      case "ghost":
        variantStyles = "text-teal-800 hover:bg-teal-50 hover:text-teal-950"
        break
      case "link":
        variantStyles = "text-teal-700 underline-offset-4 hover:underline"
        break
    }

    let sizeStyles = ""
    switch (size) {
      case "default":
        sizeStyles = "h-10 px-4 py-2"
        break
      case "sm":
        sizeStyles = "h-8 rounded-md px-3 text-xs"
        break
      case "lg":
        sizeStyles = "h-12 rounded-md px-8 text-base"
        break
      case "icon":
        sizeStyles = "h-10 w-10"
        break
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className || ""}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
