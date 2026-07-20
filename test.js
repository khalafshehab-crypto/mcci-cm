let e = {};
try {
  console.log(e.email?.trim().toLowerCase());
} catch(err) {
  console.error("ERROR 1:", err.message);
}

try {
  let email = undefined;
  console.log(email?.trim().toLowerCase());
} catch(err) {
  console.error("ERROR 2:", err.message);
}
