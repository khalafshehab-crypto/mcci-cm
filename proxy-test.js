const url = "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv";
fetch(url).then(res => res.text()).then(t => console.log(t.substring(0, 100))).catch(e => console.error(e));
