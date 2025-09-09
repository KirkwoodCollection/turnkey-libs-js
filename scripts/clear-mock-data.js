#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing all mock data indicators...');

const distDir = path.join(__dirname, '..', 'dist');

function clearMockDataFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains mock data indicators
    const hasMockData = content.includes('MOCK_DATA_INDICATOR') || 
                       content.includes('⚠️ MOCK DATA') ||
                       content.includes('_mock:') ||
                       content.includes('_warning:') ||
                       content.includes('MOCK_');
    
    if (hasMockData) {
      console.warn(`❌ WARNING: Mock data found in build output: ${filePath}`);
      console.warn('This file should not be published to production!');
      return false;
    }
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
  }
  
  return true;
}

function scanDirectory(dirPath) {
  let allClear = true;
  
  if (!fs.existsSync(dirPath)) {
    console.log('✅ No dist directory found - nothing to clear');
    return true;
  }

  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    
    if (file.isDirectory()) {
      allClear = scanDirectory(fullPath) && allClear;
    } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.d.ts'))) {
      allClear = clearMockDataFromFile(fullPath) && allClear;
    }
  }
  
  return allClear;
}

// Scan test files for mock data warnings
function checkTestFiles() {
  const testDir = path.join(__dirname, '..', 'tests');
  
  if (!fs.existsSync(testDir)) {
    return true;
  }
  
  console.log('🔍 Checking test files for proper mock data handling...');
  
  function scanTestDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        scanTestDir(fullPath);
      } else if (file.name.endsWith('.test.ts') || file.name.endsWith('.test.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check if test file properly handles mock data
        if (content.includes('MOCK_DATA_INDICATOR') || content.includes('⚠️ MOCK DATA')) {
          const hasWarning = content.includes('🧪 USING MOCK DATA FOR TESTING 🧪');
          
          if (hasWarning) {
            console.log(`✅ Test file properly handles mock data: ${path.relative(testDir, fullPath)}`);
          } else {
            console.warn(`⚠️  Test file uses mock data but lacks warning: ${path.relative(testDir, fullPath)}`);
          }
        }
      }
    }
  }
  
  scanTestDir(testDir);
  return true;
}

// Main execution
const buildClear = scanDirectory(distDir);
const testsClear = checkTestFiles();

if (buildClear && testsClear) {
  console.log('✅ Mock data cleared. Ready for production.');
  console.log('📦 Build output is clean and ready for publishing.');
  process.exit(0);
} else {
  console.error('❌ Mock data found in build output!');
  console.error('DO NOT publish this build to production.');
  console.error('Please review and remove all mock data indicators before publishing.');
  process.exit(1);
}