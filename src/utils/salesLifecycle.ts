export const SALES_STAGES = ["SIMULATION", "PROPOSAL", "CONTRACT_EFFECTIVE"] as const;

export type SalesStage = (typeof SALES_STAGES)[number];

const allowedTransitions: Record<SalesStage, SalesStage[]> = {
  SIMULATION: ["PROPOSAL"],
  PROPOSAL: ["CONTRACT_EFFECTIVE"],
  CONTRACT_EFFECTIVE: [],
};

export function canTransitionSalesStage(current: SalesStage, next: SalesStage) {
  return allowedTransitions[current].includes(next);
}

export function transitionSalesStage(current: SalesStage, next: SalesStage): SalesStage {
  if (!canTransitionSalesStage(current, next)) {
    throw new Error(`Invalid sales lifecycle transition: ${current} -> ${next}`);
  }
  return next;
}
