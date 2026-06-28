/**
 * FieldError — inline validation message shown directly under a form field.
 *
 * Renders nothing when there's no error, so call sites can pass a possibly-null
 * message unconditionally: `<FieldError message={errors.email} />`.
 *
 * Styling: dark, high-contrast red text (the app's established error colour) so
 * it's clearly readable on the white/dark form surfaces — never white-on-white.
 * No yellow and no emojis, per the brand palette (black / orange / white).
 */
export function FieldError({ message, className = '' }: { message?: string | null; className?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className={`mt-1 text-xs font-medium text-red-600 dark:text-red-400 ${className}`}>
      {message}
    </p>
  );
}
