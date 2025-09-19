// Theme utility functions for dynamic color management

export const applyThemeColor = (color) => {
  if (!color) return
  
  // Convert hex to RGB for better color manipulation
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Create darker and lighter variants
  const darker = `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`
  const lighter = `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`
  
  // Apply CSS custom properties
  document.documentElement.style.setProperty('--primary-color', color)
  document.documentElement.style.setProperty('--primary-600', color)
  document.documentElement.style.setProperty('--primary-700', darker)
  document.documentElement.style.setProperty('--primary-500', lighter)
  
  // Store in localStorage for persistence
  localStorage.setItem('theme-color', color)
}

export const getStoredThemeColor = () => {
  return localStorage.getItem('theme-color') || '#3B82F6'
}

export const initializeTheme = () => {
  const storedColor = getStoredThemeColor()
  applyThemeColor(storedColor)
  return storedColor
}
