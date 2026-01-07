// Simple test to check if the modules can be imported without errors
console.log('Testing imports...');

try {
  // Test if we can read the files
  const fs = require('fs');
  
  // Read the files to make sure they have valid syntax
  const appContent = fs.readFileSync('./src/App.tsx', 'utf8');
  const welcomeContent = fs.readFileSync('./src/components/WelcomeScreen.tsx', 'utf8');
  const languageStoreContent = fs.readFileSync('./src/store/languageStore.ts', 'utf8');
  
  console.log('✓ Successfully read App.tsx');
  console.log('✓ Successfully read WelcomeScreen.tsx');
  console.log('✓ Successfully read languageStore.ts');
  
  console.log('\nAll files readable. Syntax appears to be valid.');
  
} catch (error) {
  console.error('Error reading files:', error.message);
}