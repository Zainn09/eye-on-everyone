"use client"

import { useState, useTransition, useOptimistic } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, FileText,
  MessageSquare, Plus, Trash2, ExternalLink, GitBranch,
  Calendar, AlertTriangle, RefreshCw, Send, Check,
  X, Palette, ThumbsUp, Code, Bug, Monitor, Rocket,
  ListChecks, CheckSquare, Square, ChevronDown, ChevronUp,
  Zap, Shield, Eye, Target
} from "lucide-react"
import { Badge, Button, Input, Label, Textarea, Modal } from "@/components/ui"
import { moveProjectPhase, deleteProject } from "@/actions/projects"
import { addPage, updatePage, deletePage, assignPage } from "@/actions/pages"
import { addComment, createRevision, resolveRevision } from "@/actions/misc"
import { createTask, updateTaskStatus, deleteTask } from "@/actions/tasks"
import { createChecklist, addChecklistItem, toggleChecklistItem, deleteChecklistItem } from "@/actions/checklists"
import {
  getPhaseLabel, getPhaseColor, formatRelativeTime,
  formatDate, getDaysUntilDeadline, calculateProjectProgress,
  getInitials, generateAvatarColor
} from "@/lib/utils"
import { PHASES_ORDER, getNextPhases, type Phase, type UserRole } from "@/lib/workflow"