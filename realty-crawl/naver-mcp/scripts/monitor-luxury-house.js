#!/usr/bin/env node

import { LuxuryHouseMonitor } from '../src/services/luxury-house-monitor.js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const monitorConfig = {
  checkInterval: parseInt(process.env.MONITOR_INTERVAL || '300000'), // 5 minutes default
  notificationEmail: process.env.NOTIFICATION_EMAIL,
  notificationPhone: process.env.NOTIFICATION_PHONE,
  saveToFile: true,
  filePath: path.join(__dirname, '..', 'data')
};

// Create data directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync(monitorConfig.filePath)) {
  fs.mkdirSync(monitorConfig.filePath, { recursive: true });
}

// Create monitor instance
const monitor = new LuxuryHouseMonitor(monitorConfig);

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Stopping monitor...');
  await monitor.stopMonitoring();
  await monitor.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Stopping monitor...');
  await monitor.stopMonitoring();
  await monitor.close();
  process.exit(0);
});

// Start monitoring
async function startMonitoring() {
  try {
    console.log('🏠 Starting Luxury House Property Monitor...');
    console.log(`📊 Check interval: ${monitorConfig.checkInterval / 1000} seconds`);
    console.log(`💾 Save to file: ${monitorConfig.saveToFile}`);
    console.log(`📁 Data path: ${monitorConfig.filePath}`);
    
    if (monitorConfig.notificationEmail) {
      console.log(`📧 Email notifications: ${monitorConfig.notificationEmail}`);
    }
    
    if (monitorConfig.notificationPhone) {
      console.log(`📱 SMS notifications: ${monitorConfig.notificationPhone}`);
    }
    
    console.log('\n🚀 Starting monitoring...\n');
    
    await monitor.startMonitoring();
    
    // Keep the process running
    setInterval(() => {
      const status = monitor.getStatus();
      console.log(`\n📈 Monitor Status: ${status.isMonitoring ? '🟢 Running' : '🔴 Stopped'} | Properties: ${status.propertyCount}`);
    }, 60000); // Status update every minute
    
  } catch (error) {
    console.error('❌ Error starting monitor:', error);
    process.exit(1);
  }
}

// Start the monitor
startMonitoring();
