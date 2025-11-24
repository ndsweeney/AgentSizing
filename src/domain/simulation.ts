import type { SizingResult } from './scoring';

export type SimulationMode = 'happy-path' | 'error-path' | 'escalation-path';

export interface SimulationStep {
  id: string;
  timestamp: number;
  source: string;
  target: string;
  message: string;
  type: 'command' | 'response' | 'event' | 'error' | 'info';
  status: 'success' | 'failure' | 'pending' | 'skipped';
  duration?: number;
}

export interface SimulationTrace {
  id: string;
  mode: SimulationMode;
  steps: SimulationStep[];
  createdAt: string;
}

export function runSimulation(mode: SimulationMode, _result: SizingResult): SimulationTrace {
  const steps: SimulationStep[] = [];
  let time = 0;

  const addStep = (
    source: string, 
    target: string, 
    message: string, 
    type: SimulationStep['type'] = 'command',
    status: SimulationStep['status'] = 'success'
  ) => {
    time += Math.floor(Math.random() * 500) + 100; // Random delay
    steps.push({
      id: `step-${steps.length + 1}`,
      timestamp: time,
      source,
      target,
      message,
      type,
      status,
      duration: Math.floor(Math.random() * 200) + 50
    });
  };

  // Common Actors
  const User = 'User';
  const ExpAgent = 'Experience Agent';
  const VSAgent = 'Value Stream Agent';
  const ProcAgent = 'Process Agent';
  const TaskAgent = 'Task Agent';
  const FuncAgent = 'Function Agent';
  const CtrlAgent = 'Control Agent';

  // Scenario: Customer Inquiry / Order Processing
  
  if (mode === 'happy-path') {
    addStep(User, ExpAgent, "I need to check the status of my order #12345");
    addStep(ExpAgent, VSAgent, "Route: Order Status Inquiry", 'command');
    addStep(VSAgent, ProcAgent, "Orchestrate: Get Order Details", 'command');
    addStep(ProcAgent, TaskAgent, "Execute: Fetch Order Data", 'command');
    addStep(TaskAgent, FuncAgent, "API Call: GET /orders/12345", 'command');
    addStep(FuncAgent, TaskAgent, "Return: { status: 'Shipped', date: '2023-10-25' }", 'response');
    addStep(TaskAgent, ProcAgent, "Task Complete: Order Found", 'response');
    addStep(ProcAgent, VSAgent, "Process Complete: Order Details Retrieved", 'response');
    addStep(VSAgent, ExpAgent, "Response: Order #12345 is Shipped", 'response');
    addStep(ExpAgent, User, "Your order #12345 has been shipped and is on its way.", 'response');
  } 
  
  else if (mode === 'error-path') {
    addStep(User, ExpAgent, "Update my billing address for order #12345");
    addStep(ExpAgent, VSAgent, "Route: Update Order Address", 'command');
    addStep(VSAgent, ProcAgent, "Orchestrate: Update Address Workflow", 'command');
    addStep(ProcAgent, TaskAgent, "Execute: Validate Address", 'command');
    addStep(TaskAgent, FuncAgent, "API Call: POST /address/validate", 'command');
    addStep(FuncAgent, TaskAgent, "Error: 503 Service Unavailable", 'error', 'failure');
    addStep(TaskAgent, CtrlAgent, "Log: External Service Failure", 'event');
    addStep(TaskAgent, ProcAgent, "Failure: Address Validation Failed", 'error', 'failure');
    addStep(ProcAgent, VSAgent, "Process Failed: Cannot complete update", 'error', 'failure');
    addStep(VSAgent, ExpAgent, "Error: System is currently unavailable", 'error', 'failure');
    addStep(ExpAgent, User, "I'm sorry, I can't update your address right now due to a system error. Please try again later.", 'response');
  } 
  
  else if (mode === 'escalation-path') {
    addStep(User, ExpAgent, "I want to return this item, it's broken!");
    addStep(ExpAgent, VSAgent, "Route: Return Request", 'command');
    addStep(VSAgent, ProcAgent, "Orchestrate: Process Return", 'command');
    addStep(ProcAgent, CtrlAgent, "Check: Return Policy (Item Value > $1000)", 'command');
    addStep(CtrlAgent, ProcAgent, "Result: Approval Required (High Value)", 'response');
    addStep(ProcAgent, TaskAgent, "Execute: Create Approval Request", 'command');
    addStep(TaskAgent, FuncAgent, "API Call: POST /approvals/create", 'command');
    addStep(FuncAgent, TaskAgent, "Return: Approval ID #998877", 'response');
    addStep(TaskAgent, ProcAgent, "Task Complete: Approval Pending", 'response');
    addStep(ProcAgent, VSAgent, "Process Paused: Waiting for Human Agent", 'event');
    addStep(VSAgent, ExpAgent, "Handover: Transfer to Human Agent", 'event');
    addStep(ExpAgent, User, "I've started a return request. Due to the item's value, a human agent needs to finalize this. Connecting you now...", 'response');
  }

  return {
    id: crypto.randomUUID(),
    mode,
    steps,
    createdAt: new Date().toISOString()
  };
}

export function generateSimulationMermaid(trace: SimulationTrace): string {
  let mermaid = "sequenceDiagram\n";
  mermaid += "  autonumber\n";
  mermaid += "  actor User\n";
  mermaid += "  participant Exp as Experience Agent\n";
  mermaid += "  participant VS as Value Stream Agent\n";
  mermaid += "  participant Proc as Process Agent\n";
  mermaid += "  participant Task as Task Agent\n";
  mermaid += "  participant Func as Function Agent\n";
  mermaid += "  participant Ctrl as Control Agent\n";

  const agentMap: Record<string, string> = {
    'User': 'User',
    'Experience Agent': 'Exp',
    'Value Stream Agent': 'VS',
    'Process Agent': 'Proc',
    'Task Agent': 'Task',
    'Function Agent': 'Func',
    'Control Agent': 'Ctrl'
  };

  trace.steps.forEach(step => {
    const src = agentMap[step.source] || 'User';
    const tgt = agentMap[step.target] || 'User';
    
    let arrow = "->>";
    if (step.type === 'response') arrow = "-->>";
    if (step.type === 'error') arrow = "-x";
    
    // Highlight errors
    if (step.status === 'failure') {
      mermaid += `  ${src}${arrow}${tgt}: ❌ ${step.message}\n`;
      mermaid += `  Note over ${src},${tgt}: Error occurred\n`;
    } else {
      mermaid += `  ${src}${arrow}${tgt}: ${step.message}\n`;
    }
  });

  return mermaid;
}
