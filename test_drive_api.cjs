async function test() {
  const q = `invalid syntax ((`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&key=FAKE_KEY`;
  const res = await fetch(url);
  const data = await res.text();
  console.log("Status:", res.status);
  console.log("Data:", data);
}
test();
