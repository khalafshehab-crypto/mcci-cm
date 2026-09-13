const fs = require('fs');

const file = 'src/pages/CommitteesEvents.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add isSubmitting state
if (!content.includes('const [isSubmitting, setIsSubmitting] = useState(false);')) {
  content = content.replace(
    'const [isConfirmingSeries, setIsConfirmingSeries] = useState(false);',
    'const [isConfirmingSeries, setIsConfirmingSeries] = useState(false);\n  const [isSubmitting, setIsSubmitting] = useState(false);'
  );
}

// 2. Update handleInsertSeries to use isSubmitting
content = content.replace(
  'const handleInsertSeries = async () => {',
  'const handleInsertSeries = async () => {\n    setIsSubmitting(true);'
);
content = content.replace(
  'setIsConfirmingSeries(false);\n    setIsAddOpen(false);',
  'setIsConfirmingSeries(false);\n    setIsAddOpen(false);\n    setIsSubmitting(false);'
);

// We need to carefully replace the ending of handleInsertSeries
