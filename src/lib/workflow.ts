// Workflow state machine for project phases

export type Phase =
  | "DESIGN"
  | "DESIGN_QA"
  | "DESIGN_APPROVAL"
  | "DEVELOPMENT"
  | "DEV_QA"
  | "CLIENT_PREVIEW"
  | "DELIVERED"

export type UserRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "DESIGNER"
  | "DEVELOPER"
  | "QA"
  | "VIEWER"

// Defines which phases can come after a given phase
export const PHASE_TRANSITIONS: Record<Phase, Phase[]> = {
  DESIGN: ["DESIGN_QA", "DESIGN_APPROVAL"], // can skip QA
  DESIGN_QA: ["DESIGN_APPROVAL", "DESIGN"], // approve or send back
  DESIGN_APPROVAL: ["DEVELOPMENT", "DESIGN"], // approved or revision requested
  DEVELOPMENT: ["DEV_QA"],
  DEV_QA: ["CLIENT_PREVIEW", "DEVELOPMENT"], // approve or send back
  CLIENT_PREVIEW: ["DELIVERED", "DEVELOPMENT"], // approved or revision
  DELIVERED: ["DEVELOPMENT"], // post-delivery revision
}

// Which roles can trigger which phase transitions
export const TRANSITION_PERMISSIONS: Record<string, UserRole[]> = {
  "DESIGN->DESIGN_QA": ["ADMIN", "PROJECT_MANAGER", "DESIGNER"],
  "DESIGN->DESIGN_APPROVAL": ["ADMIN", "PROJECT_MANAGER"],
  "DESIGN_QA->DESIGN_APPROVAL": ["ADMIN", "PROJECT_MANAGER", "QA"],
  "DESIGN_QA->DESIGN": ["ADMIN", "PROJECT_MANAGER", "QA"],
  "DESIGN_APPROVAL->DEVELOPMENT": ["ADMIN", "PROJECT_MANAGER"],
  "DESIGN_APPROVAL->DESIGN": ["ADMIN", "PROJECT_MANAGER"],
  "DEVELOPMENT->DEV_QA": ["ADMIN", "PROJECT_MANAGER", "DEVELOPER"],
  "DEV_QA->CLIENT_PREVIEW": ["ADMIN", "PROJECT_MANAGER", "QA"],
  "DEV_QA->DEVELOPMENT": ["ADMIN", "PROJECT_MANAGER", "QA"],
  "CLIENT_PREVIEW->DELIVERED": ["ADMIN", "PROJECT_MANAGER"],
  "CLIENT_PREVIEW->DEVELOPMENT": ["ADMIN", "PROJECT_MANAGER"],
  "DELIVERED->DEVELOPMENT": ["ADMIN", "PROJECT_MANAGER"],
}

export function canTransition(
  fromPhase: Phase,
  toPhase: Phase,
  role: UserRole,
  designQAEnabled: boolean = true
): boolean {
  // If QA is disabled, skip DESIGN_QA
  if (!designQAEnabled && toPhase === "DESIGN_QA") return false

  const allowed = PHASE_TRANSITIONS[fromPhase]
  if (!allowed?.includes(toPhase)) return false

  const key = `${fromPhase}->${toPhase}`
  const permittedRoles = TRANSITION_PERMISSIONS[key]
  if (!permittedRoles) return false

  return permittedRoles.includes(role)
}

export function getNextPhases(
  currentPhase: Phase,
  role: UserRole,
  designQAEnabled: boolean = true
): Phase[] {
  const transitions = PHASE_TRANSITIONS[currentPhase] || []
  return transitions.filter((p) =>
    canTransition(currentPhase, p, role, designQAEnabled)
  )
}

export const PHASES_ORDER: Phase[] = [
  "DESIGN",
  "DESIGN_QA",
  "DESIGN_APPROVAL",
  "DEVELOPMENT",
  "DEV_QA",
  "CLIENT_PREVIEW",
  "DELIVERED",
]

export function getPhaseIndex(phase: Phase): number {
  return PHASES_ORDER.indexOf(phase)
}

export function isPhaseCompleted(currentPhase: Phase, checkPhase: Phase): boolean {
  return getPhaseIndex(currentPhase) > getPhaseIndex(checkPhase)
}

export function isPhaseActive(currentPhase: Phase, checkPhase: Phase): boolean {
  return currentPhase === checkPhase
}

// Role-based feature permissions
export const CAN_CREATE_PROJECT: UserRole[] = ["ADMIN", "PROJECT_MANAGER"]
export const CAN_DELETE_PROJECT: UserRole[] = ["ADMIN"]
export const CAN_ASSIGN_ROLES: UserRole[] = ["ADMIN"]
export const CAN_ASSIGN_TASKS: UserRole[] = ["ADMIN", "PROJECT_MANAGER"]
export const CAN_UPLOAD_DESIGN: UserRole[] = ["ADMIN", "PROJECT_MANAGER", "DESIGNER"]
export const CAN_UPDATE_DEV_STATUS: UserRole[] = ["ADMIN", "PROJECT_MANAGER", "DEVELOPER"]
export const CAN_QA_APPROVE: UserRole[] = ["ADMIN", "PROJECT_MANAGER", "QA"]

export function hasPermission(role: string, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(role as UserRole)
}
