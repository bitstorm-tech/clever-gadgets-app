/** "Noch keine Gadgets", "1 Gadget", "3 Gadgets" */
export function gadgetCountLabel(count: number): string {
  if (count === 0) return "Noch keine Gadgets";
  return count === 1 ? "1 Gadget" : `${count} Gadgets`;
}
