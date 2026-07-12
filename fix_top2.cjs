const fs = require('fs');

let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

code = code.replace(/import \{ \n  Users2, \n  Search, \n  Plus, \n  X, \n  Users, \n  Calendar, \n  CheckCircle, \n  FileText, \n  Trash2,\n  Check,\n  ChevronLeft,\n  Settings2,\n  Edit2,\n  Save,\n  Download,\n  MoreVertical,\n  Activity,\n  AlertCircle\n\} from "lucide-react";/, 
`import { 
  Users2, Search, Plus, X, Users, Calendar, CheckCircle, FileText, Trash2,
  Check, ChevronLeft, Settings2, Edit2, Save, Download, MoreVertical, Activity, AlertCircle,
  UserCheck, LayoutGrid, List, FileSpreadsheet, Settings, Upload, AlertTriangle
} from "lucide-react";`);

code = code.replace(/import \{ generateDocx \} from "\.\.\/lib\/docxGenerator";/,
`import { generateDocx } from "../lib/docxGenerator";
import { getCachedAccessToken, createAndPopulateSheet } from "../lib/googleApi";`);

code = code.replace(/export interface Committee \{[\s\S]*?strategicPlan\?: string;\n\}/,
`export interface Committee {
  id: number | string;
  name: string;
  description: string;
  membersCount: number;
  meetingsCount: number;
  recommendationsCount: number;
  eventsCount: number;
  president?: string;
  specialist?: string;
  status: "فعالة" | "غير فعالة";
  active?: boolean;
  libraryLink?: string;
  objectives?: string;
  attachments?: any[];
  strategicPlan?: string;
  desc?: string;
  formationLetter?: string;
  ratingIssues?: string;
}`);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
