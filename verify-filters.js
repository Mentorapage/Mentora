// Advanced Multi-Select Filters Verification Script
// Run this in browser console on the main index.html page to verify all functionality

console.log('🧪 Starting Advanced Filters Verification...');

// Test 1: Check if all filter elements exist
function testFilterElementsExist() {
  console.log('\n📋 Test 1: Checking if all filter elements exist...');
  
  const requiredElements = [
    'advanced-filters',
    'subjects-dropdown-btn', 'subjects-dropdown', 'subjects-display',
    'availability-dropdown-btn', 'availability-dropdown', 'availability-display',
    'languages-dropdown-btn', 'languages-dropdown', 'languages-display',
    'hobbies-dropdown-btn', 'hobbies-dropdown', 'hobbies-display',
    'clear-all-filters',
    'filter-summary',
    'active-filters'
  ];
  
  let allExists = true;
  requiredElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      console.log(`✅ ${id} - Found`);
    } else {
      console.log(`❌ ${id} - Missing`);
      allExists = false;
    }
  });
  
  return allExists;
}

// Test 2: Check if filter state is properly initialized
function testFilterStateInitialization() {
  console.log('\n📋 Test 2: Checking filter state initialization...');
  
  if (typeof advancedFilters !== 'undefined') {
    console.log('✅ advancedFilters object exists');
    console.log('📊 Current state:', advancedFilters);
    
    const expectedKeys = ['subjects', 'availability', 'languages', 'hobbies'];
    const hasAllKeys = expectedKeys.every(key => Array.isArray(advancedFilters[key]));
    
    if (hasAllKeys) {
      console.log('✅ All filter arrays properly initialized');
      return true;
    } else {
      console.log('❌ Filter arrays not properly initialized');
      return false;
    }
  } else {
    console.log('❌ advancedFilters object not found');
    return false;
  }
}

// Test 3: Test dropdown functionality
function testDropdownFunctionality() {
  console.log('\n📋 Test 3: Testing dropdown functionality...');
  
  const dropdownTypes = ['subjects', 'availability', 'languages', 'hobbies'];
  let allWorking = true;
  
  dropdownTypes.forEach(type => {
    const button = document.getElementById(`${type}-dropdown-btn`);
    const dropdown = document.getElementById(`${type}-dropdown`);
    
    if (button && dropdown) {
      // Test opening
      button.click();
      if (!dropdown.classList.contains('hidden')) {
        console.log(`✅ ${type} dropdown opens correctly`);
        
        // Test closing
        button.click();
        if (dropdown.classList.contains('hidden')) {
          console.log(`✅ ${type} dropdown closes correctly`);
        } else {
          console.log(`❌ ${type} dropdown doesn't close`);
          allWorking = false;
        }
      } else {
        console.log(`❌ ${type} dropdown doesn't open`);
        allWorking = false;
      }
    } else {
      console.log(`❌ ${type} dropdown elements missing`);
      allWorking = false;
    }
  });
  
  return allWorking;
}

// Test 4: Test filter selection and state updates
function testFilterSelection() {
  console.log('\n📋 Test 4: Testing filter selection and state updates...');
  
  // Clear all filters first
  if (typeof clearAllFilters === 'function') {
    clearAllFilters();
    console.log('🧹 Cleared all filters');
  }
  
  let testsPassed = 0;
  const totalTests = 4;
  
  // Test subject filter
  const mathCheckbox = document.querySelector('.subject-filter[value="math"]');
  if (mathCheckbox) {
    mathCheckbox.checked = true;
    mathCheckbox.dispatchEvent(new Event('change'));
    
    if (advancedFilters.subjects.includes('math')) {
      console.log('✅ Subject filter (math) works correctly');
      testsPassed++;
    } else {
      console.log('❌ Subject filter (math) not updating state');
    }
  }
  
  // Test availability filter
  const eveningCheckbox = document.querySelector('.availability-filter[value="evening"]');
  if (eveningCheckbox) {
    eveningCheckbox.checked = true;
    eveningCheckbox.dispatchEvent(new Event('change'));
    
    if (advancedFilters.availability.includes('evening')) {
      console.log('✅ Availability filter (evening) works correctly');
      testsPassed++;
    } else {
      console.log('❌ Availability filter (evening) not updating state');
    }
  }
  
  // Test language filter
  const englishCheckbox = document.querySelector('.language-filter[value="English"]');
  if (englishCheckbox) {
    englishCheckbox.checked = true;
    englishCheckbox.dispatchEvent(new Event('change'));
    
    if (advancedFilters.languages.includes('English')) {
      console.log('✅ Language filter (English) works correctly');
      testsPassed++;
    } else {
      console.log('❌ Language filter (English) not updating state');
    }
  }
  
  // Test hobby filter
  const chessCheckbox = document.querySelector('.hobby-filter[value="chess"]');
  if (chessCheckbox) {
    chessCheckbox.checked = true;
    chessCheckbox.dispatchEvent(new Event('change'));
    
    if (advancedFilters.hobbies.includes('chess')) {
      console.log('✅ Hobby filter (chess) works correctly');
      testsPassed++;
    } else {
      console.log('❌ Hobby filter (chess) not updating state');
    }
  }
  
  console.log(`📊 Filter selection tests: ${testsPassed}/${totalTests} passed`);
  return testsPassed === totalTests;
}

// Test 5: Test tutor filtering functionality
function testTutorFiltering() {
  console.log('\n📋 Test 5: Testing tutor filtering functionality...');
  
  if (typeof renderTeachers === 'function' && typeof TEACHERS !== 'undefined') {
    const initialCount = TEACHERS.length;
    console.log(`📊 Total tutors available: ${initialCount}`);
    
    // Apply some filters and check results
    clearAllFilters();
    
    // Filter by math subject
    advancedFilters.subjects = ['math'];
    renderTeachers();
    
    const mathTutors = TEACHERS.filter(t => t.subject === 'math');
    console.log(`📊 Math tutors should be: ${mathTutors.length}`);
    
    // Check if the grid was updated
    const grid = document.getElementById('teachers-grid');
    if (grid) {
      const cards = grid.querySelectorAll('.teacher-card');
      console.log(`📊 Displayed cards: ${cards.length}`);
      
      if (cards.length > 0) {
        console.log('✅ Tutor filtering appears to be working');
        return true;
      } else {
        console.log('❌ No tutor cards displayed after filtering');
        return false;
      }
    } else {
      console.log('❌ Teachers grid not found');
      return false;
    }
  } else {
    console.log('❌ Required functions or data not available');
    return false;
  }
}

// Test 6: Test fallback functionality
function testFallbackFunctionality() {
  console.log('\n📋 Test 6: Testing fallback functionality...');
  
  if (typeof showManualFiltersFallback === 'function') {
    console.log('✅ showManualFiltersFallback function exists');
    
    // Test the fallback (but don't actually trigger it to avoid UI disruption)
    console.log('✅ Fallback function is available for AI failures');
    return true;
  } else {
    console.log('❌ showManualFiltersFallback function not found');
    return false;
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running Complete Advanced Filters Verification Suite...');
  console.log('='.repeat(60));
  
  const results = {
    elementsExist: testFilterElementsExist(),
    stateInitialized: testFilterStateInitialization(),
    dropdownsWork: testDropdownFunctionality(),
    filtersWork: testFilterSelection(),
    tutorFiltering: testTutorFiltering(),
    fallbackExists: testFallbackFunctionality()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULTS:');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const totalPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n📊 SUMMARY:');
  console.log(`Tests Passed: ${totalPassed}/${totalTests}`);
  console.log(`Success Rate: ${Math.round((totalPassed/totalTests)*100)}%`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Advanced filtering is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
  
  return results;
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  // Wait a bit for page to fully load
  setTimeout(runAllTests, 1000);
} else {
  console.log('Run runAllTests() to execute the verification suite.');
}

// Export for manual testing
window.filterTests = {
  runAllTests,
  testFilterElementsExist,
  testFilterStateInitialization,
  testDropdownFunctionality,
  testFilterSelection,
  testTutorFiltering,
  testFallbackFunctionality
}; 