const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const fs = require('fs');

async function run() {
  const testEnv = await initializeTestEnvironment({
    projectId: 'mcci-cm',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8')
    }
  });

  const unauthedDb = testEnv.unauthenticatedContext().firestore();
  
  try {
    await unauthedDb.collection('join_requests').add({ test: 1 });
    console.log("SUCCESS unauthed add to join_requests");
  } catch (e) {
    console.error("FAIL unauthed add to join_requests:", e.message);
  }
  
  try {
    await unauthedDb.collection('employees').get();
    console.log("SUCCESS unauthed get employees");
  } catch (e) {
    console.error("FAIL unauthed get employees:", e.message);
  }

  await testEnv.cleanup();
}
run();
