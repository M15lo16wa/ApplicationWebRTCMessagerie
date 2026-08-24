const VARIANTS = {
  primary: "bg-primary text-white hover:opacity-90",
  ghost: "bg-transparent text-ink hover:bg-line",
  danger: "bg-danger text-white hover:opacity-90",
  success: "bg-success text-white hover:opacity-90",
};

export function Button({ variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-full font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
