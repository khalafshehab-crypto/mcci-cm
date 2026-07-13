const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

// Remove SlidersHorizontal from motion/react
code = code.replace(
  'import { SlidersHorizontal, motion, AnimatePresence } from "motion/react";',
  'import { motion, AnimatePresence } from "motion/react";'
);

// Add SlidersHorizontal to lucide-react
if (!code.includes('SlidersHorizontal,')) {
  code = code.replace(
    'Users2, Search, Plus, X, Users, Calendar, CheckCircle, FileText, Trash2,',
    'Users2, Search, Plus, X, Users, Calendar, CheckCircle, FileText, Trash2, SlidersHorizontal,'
  );
}

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
