const db = JSON.parse(localStorage.getItem('mock_db_committees') || '[]');
console.log(db.map(c => c.id));
