const fs = require('fs');
const files = ['src/pages/Library.tsx', 'src/pages/CommitteesLibrary.tsx'];

const goodImports = `import React, { useState, useEffect, FormEvent } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  Download,
  Edit2,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  Library as LibraryIcon,
  List,
  Mail,
  Paperclip,
  Plus,
  Presentation,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Trash2,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Check,
  Send,
  Copy,
  Wand2,
  Loader2,
  Printer,
  X
} from "lucide-react";
import { db } from "../lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import GoogleWorkspaceCenter from "../components/GoogleWorkspaceCenter";

`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // replace everything up to export interface TemplateItem
  const idx = content.indexOf('export interface TemplateItem');
  if (idx !== -1) {
    content = goodImports + content.substring(idx);
    fs.writeFileSync(file, content);
    console.log("Fixed " + file);
  }
});
