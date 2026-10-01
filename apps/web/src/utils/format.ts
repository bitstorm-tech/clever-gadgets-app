/** "No gadgets yet", "1 gadget", "3 gadgets" */
export function gadgetCountLabel(count: number): string {
  if (count === 0) return "No gadgets yet";
  return count === 1 ? "1 gadget" : `${count} gadgets`;
}
