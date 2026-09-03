import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

try {
  initializeApp();
  console.log("App initialized.");
  getAuth().getUserByEmail("khalafshehab@gmail.com").then(user => {
    console.log("Found user:", user.uid);
  }).catch(e => {
    console.error("Auth error:", e);
  });
} catch (e) {
  console.error("Init error:", e);
}
