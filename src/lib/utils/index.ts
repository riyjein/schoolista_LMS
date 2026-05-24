export * from "./icons";

/**
 * Combines classnames with support for conditional classes.
 * Works with tailwind CSS classes.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
