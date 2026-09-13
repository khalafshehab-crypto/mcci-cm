async function test() {
  try {
    const res = await fetch("https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/google-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "fake_token",
        url: "https://www.googleapis.com/calendar/v3/calendars/primary/events/fake_id",
        method: "DELETE"
      })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response text:", text);
  } catch (e) {
    console.error(e);
  }
}
test();
