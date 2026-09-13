const regex = /^[a-zA-Z0-9_\-]+$/;
console.log(regex.test("some-id_123")); // true
console.log(regex.test("some id"));     // false
