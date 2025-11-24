export interface CoachTip {
  id: string;
  context: 'general' | 'wizard' | 'results' | 'dimension';
  dimensionId?: string; // If specific to a dimension
  title: string;
  content: string;
  type: 'question' | 'steering' | 'pitfall' | 'tip';
}

export const COACH_CONTENT: CoachTip[] = [
  // General Workshop Tips
  {
    id: 'gen-1',
    context: 'general',
    title: 'Setting the Stage',
    type: 'tip',
    content: 'Start by clarifying that this is a "Sizing" workshop, not a "Solutioning" workshop. We are estimating complexity, not designing the database schema.'
  },
  {
    id: 'gen-2',
    context: 'general',
    title: 'Handling "It Depends"',
    type: 'steering',
    content: 'Stakeholders love to say "It depends". Push back: "It depends on what? Let\'s assume the more complex scenario for sizing purposes to be safe."'
  },
  
  // Wizard - Business Scope
  {
    id: 'wiz-scope-1',
    context: 'dimension',
    dimensionId: 'businessScope',
    title: 'Scope Creep Warning',
    type: 'pitfall',
    content: 'Watch out for "And then..." statements. "We want it to do X, and then Y, and then Z." Each "and then" is likely a separate agent or a new scope.'
  },
  {
    id: 'wiz-scope-2',
    context: 'dimension',
    dimensionId: 'businessScope',
    title: 'Probing Question',
    type: 'question',
    content: 'If this agent fails, what is the business impact? (Helps determine if it is a critical path process).'
  },

  // Wizard - Complexity
  {
    id: 'wiz-complex-1',
    context: 'dimension',
    dimensionId: 'workflowComplexity',
    title: 'Hidden Complexity',
    type: 'pitfall',
    content: 'Stakeholders often underestimate decision trees. Ask: "How many exceptions to the happy path exist?"'
  },

  // Wizard - Data
  {
    id: 'wiz-data-1',
    context: 'dimension',
    dimensionId: 'dataSensitivity',
    title: 'Data Privacy',
    type: 'steering',
    content: 'Remind them that "Internal Only" doesn\'t mean "Public to all employees". HR data is internal but highly sensitive.'
  },

  // Results View
  {
    id: 'res-1',
    context: 'results',
    title: 'Sticker Shock',
    type: 'tip',
    content: 'If the estimate is "Large" and they expected "Small", explain that the complexity comes from the integrations and governance, not just the prompt text.'
  },
  {
    id: 'res-2',
    context: 'results',
    title: 'Phasing Strategy',
    type: 'steering',
    content: 'Suggest breaking a "Large" agent into a "Pilot" (Small) and "Phase 2" (Medium) to show value quicker.'
  }
];
