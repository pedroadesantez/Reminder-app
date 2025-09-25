#!/usr/bin/env node

const net = require('net');

const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.close(() => {
        resolve({ port, available: true });
      });
    });
    
    server.on('error', () => {
      resolve({ port, available: false });
    });
  });
};

const checkPorts = async (startPort, endPort) => {
  console.log(`🔍 Checking ports ${startPort}-${endPort}...`);
  console.log('');
  
  for (let port = startPort; port <= endPort; port++) {
    const result = await checkPort(port);
    const status = result.available ? '✅ Available' : '❌ In use';
    const color = result.available ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    console.log(`${color}Port ${port}: ${status}${reset}`);
    
    if (result.available) {
      console.log(`\n🎯 Found available port: ${port}`);
      console.log(`💡 You can set PORT=${port} in your .env file`);
      break;
    }
  }
};

// Check ports 3000-3010
checkPorts(3000, 3010).catch(console.error);