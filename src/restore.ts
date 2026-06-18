import { execSync } from "child_process";

try {
  console.log("Git Status:");
  const status = execSync("git status", { encoding: "utf8" });
  console.log(status);

  console.log("Restoring src/pages/OrgChart.tsx...");
  const checkout = execSync("git checkout -- src/pages/OrgChart.tsx", { encoding: "utf8" });
  console.log("Checkout result:", checkout || "No output (Success)");
} catch (err: any) {
  console.error("Error executing git command:", err.message);
  if (err.stdout) console.log("stdout:", err.stdout);
  if (err.stderr) console.error("stderr:", err.stderr);
}
