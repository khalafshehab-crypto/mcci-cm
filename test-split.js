const paste = `
ward@makkahcci.org.sa
<ward@makkahcci.org.sa>;
k.shaban@makkahchamber.sa
<k.shaban@makkahchamber.sa>
Cc: Ahmad Alhaaj
<aalhaaj@mzarapp.com>;
Ahmad Alhaaj <aalhaaj@i-
esnaad.com>; Saad Hafez
<saad@mzarapp.com>; Mosab
Alaaql
<eng.mosab@mzarapp.com>;
Hussain Qutub
<<htqutub@rcmc.gov.sa
`;

const items = paste.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
console.log(items);
