const fs = require('fs');

const file = '/app/applet/src/components/Layout.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update header tag
content = content.replace(
  /<header className="bg-\[#e8e4e4\] rounded-2xl shadow-sm border border-gray-200 p-2 flex flex-col lg:flex-row items-stretch xl:items-center justify-between gap-4">/,
  '<header className="bg-[#e8e4e4] rounded-2xl shadow-sm border border-gray-200 p-2 sm:p-3 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">'
);

// Update right section (Logo & Main Navigation) container to be full width on mobile
content = content.replace(
  /<div className="flex items-center gap-4 flex-shrink-0">/,
  '<div className="flex items-center justify-between w-full md:w-auto gap-4 flex-shrink-0">'
);

// Hide flex-grow on mobile
content = content.replace(
  /<div className="flex-grow"><\/div>/,
  '<div className="flex-grow hidden md:block"></div>'
);

// Update left section (Date/Time)
content = content.replace(
  /<div className="flex flex-col md:flex-row-reverse items-stretch md:items-center gap-2">/g,
  '<div className="flex flex-col md:flex-row-reverse items-center justify-center w-full md:w-auto gap-2">'
);

content = content.replace(
  /<div className="flex flex-row-reverse items-center gap-2 pr-0 pt-2 md:pt-0">/g,
  '<div className="flex flex-row-reverse items-center justify-center gap-2 pr-0 w-full md:w-auto">'
);

// Change date cards stacking on mobile to be side-by-side
content = content.replace(
  /<div id="datetime-card" className="flex flex-col gap-1">/g,
  '<div id="datetime-card" className="flex flex-row md:flex-col gap-2 md:gap-1 w-full md:w-auto justify-center">'
);

// Update date cards styling to stretch evenly on mobile
content = content.replace(
  /<div className="flex items-center justify-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm min-w-0 sm:min-w-\[150px\]">/g,
  '<div className="flex items-center justify-between md:justify-center gap-2 bg-white px-2 sm:px-3 py-1 rounded-lg border border-gray-100 shadow-sm min-w-0 sm:min-w-[150px] flex-1 md:flex-none">'
);
content = content.replace(
  /<div className="flex items-center justify-center gap-2 bg-white px-3 py-1 rounded-lg border border-brand\/20 shadow-sm min-w-0 sm:min-w-\[150px\]">/g,
  '<div className="flex items-center justify-between md:justify-center gap-2 bg-white px-2 sm:px-3 py-1 rounded-lg border border-brand/20 shadow-sm min-w-0 sm:min-w-[150px] flex-1 md:flex-none">'
);

// Update Time cards stacking on mobile to be side-by-side (if visible)
content = content.replace(
  /<div className="flex flex-col gap-1 hidden sm:flex">/g,
  '<div className="flex flex-row md:flex-col gap-2 md:gap-1 hidden sm:flex w-full md:w-auto justify-center">'
);

fs.writeFileSync(file, content);
console.log('Fixed header in Layout.tsx');
