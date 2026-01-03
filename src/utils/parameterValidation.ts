import { VirusParameters } from '../types/game';

export const validateParameterAllocation = (parameters: VirusParameters): {
  isValid: boolean;
  total: number;
  errors: string[];
} => {
  const values = Object.values(parameters);
  const total = values.reduce((sum, val) => sum + val, 0);
  const errors: string[] = [];

  if (total > 16) {
    errors.push(`Total points must not exceed 16, but got ${total}`);
  }

  for (const [key, value] of Object.entries(parameters)) {
    if (value < 0 || value > 16) {
      errors.push(`${key} must be between 0 and 16, but got ${value}`);
    }
  }

  return {
    isValid: errors.length === 0 && total <= 16,
    total,
    errors
  };
};

export const getParameterBalance = (parameters: VirusParameters): ParameterBalance => {
  // Calculate strategic balance metrics
  const offensive = parameters.aggression + parameters.virulence + parameters.reproduction;
  const defensive = parameters.defense + parameters.resistance + parameters.stability;
  const growth = parameters.speed + parameters.adaptability + parameters.mobility;
  const adaptability = parameters.mutation + parameters.intelligence + parameters.endurance;
  const coordination = parameters.infectivity + parameters.resilience + parameters.stealth;

  return {
    offensive,
    defensive,
    growth,
    adaptability,
    coordination,
    overallBalance: (offensive + defensive + growth + adaptability + coordination) / 5
  };
};

export interface ParameterBalance {
  offensive: number;
  defensive: number;
  growth: number;
  adaptability: number;
  coordination: number;
  overallBalance: number;
}