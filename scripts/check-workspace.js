#!/usr/bin/env node
const urls = [
  'http://localhost:3000/api/workspace/debug',
  'http://localhost:3000/api/workspace/boards',
  'http://localhost:3000/workspace'
];
(async () => {
  try {
    for (const url of urls) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${url} -> ${res.status}`);
      await res.text();
    }
    console.log('Workspace endpoints responded correctly');
  } catch (err) {
    console.error('Workspace check failed:', err.message);
    process.exit(1);
  }
})();
