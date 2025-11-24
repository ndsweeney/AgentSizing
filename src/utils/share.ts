import type { Scenario } from '../state/sizingStore';

export const encodeScenario = (scenario: Scenario): string => {
  const json = JSON.stringify(scenario);
  return btoa(encodeURIComponent(json));
};

export const decodeScenario = (encoded: string): Scenario | null => {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to decode scenario', e);
    return null;
  }
};
