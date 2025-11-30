export type ArchetypeTier = "core" | "extended" | "emerging";

export interface AgentArchetype {
  id: string;
  name: string;
  tier: ArchetypeTier;
  shortDescription: string;
  longDescription: string;
  triggerCondition?: string;
  exampleMicrosoftFit: string;
}
