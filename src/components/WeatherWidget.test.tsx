import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4**
 * 
 * Property 1: Bug Condition - WeatherWidget Uses Direct Fetch Instead of weatherService
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * 
 * GOAL: Surface counterexamples that demonstrate WeatherWidget bypasses weatherService
 * 
 * Expected Outcome: Test FAILS (this is correct - it proves the architectural violation exists)
 * Counterexamples will show:
 * - WeatherWidget contains direct fetch calls to openweathermap.org
 * - WeatherWidget has hardcoded API key "087b86dceed5408c19f8d2e26e65813b"
 * - WeatherWidget does NOT import or call weatherService.getWeather()
 */
describe("Bug Condition Exploration - WeatherWidget Backend Integration", () => {
  const componentPath = path.join(__dirname, "WeatherWidget.tsx");
  const componentSource = fs.readFileSync(componentPath, "utf-8");

  /**
   * Test 1: WeatherWidget should import weatherService
   * 
   * **Validates: Requirement 2.1**
   * 
   * Expected: Component imports { getWeather } from "@/services/weatherService"
   * Current (unfixed): Component does NOT import weatherService
   * 
   * This test will FAIL on unfixed code, confirming the bug exists
   */
  it("should import weatherService.getWeather (not direct fetch)", () => {
    // Check for weatherService import
    const hasWeatherServiceImport = 
      componentSource.includes('from "@/services/weatherService"') ||
      componentSource.includes("from '@/services/weatherService'");
    
    // Check for getWeather import specifically
    const importsGetWeather = 
      componentSource.includes("import { getWeather") ||
      componentSource.includes("import {getWeather") ||
      componentSource.includes("import { WeatherData, getWeather") ||
      componentSource.includes("import type { WeatherData } from") && componentSource.includes("import { getWeather");

    // EXPECTED BEHAVIOR: Component should import weatherService
    expect(hasWeatherServiceImport).toBe(true);
    expect(importsGetWeather).toBe(true);
    
    // Document the counterexample if test fails
    if (!hasWeatherServiceImport || !importsGetWeather) {
      console.log("COUNTEREXAMPLE: WeatherWidget does NOT import weatherService");
      console.log("This confirms the architectural violation exists");
    }
  });

  /**
   * Test 2: WeatherWidget should NOT have hardcoded API key
   * 
   * **Validates: Requirement 2.2**
   * 
   * Expected: Component uses API key from weatherService (via environment variable)
   * Current (unfixed): Component has hardcoded API key "087b86dceed5408c19f8d2e26e65813b"
   * 
   * This test will FAIL on unfixed code, confirming the bug exists
   */
  it("should NOT contain hardcoded OpenWeather API key", () => {
    const hardcodedApiKey = "087b86dceed5408c19f8d2e26e65813b";
    
    // Check for hardcoded API key
    const hasHardcodedKey = componentSource.includes(hardcodedApiKey);
    
    // Check for OPENWEATHER_KEY constant declaration
    const hasKeyConstant = 
      componentSource.includes("const OPENWEATHER_KEY") ||
      componentSource.includes("let OPENWEATHER_KEY") ||
      componentSource.includes("var OPENWEATHER_KEY");

    // EXPECTED BEHAVIOR: Component should NOT have hardcoded API key
    expect(hasHardcodedKey).toBe(false);
    expect(hasKeyConstant).toBe(false);
    
    // Document the counterexample if test fails
    if (hasHardcodedKey) {
      console.log("COUNTEREXAMPLE: WeatherWidget contains hardcoded API key:", hardcodedApiKey);
      console.log("This confirms the architectural violation exists");
    }
    if (hasKeyConstant) {
      console.log("COUNTEREXAMPLE: WeatherWidget declares OPENWEATHER_KEY constant");
      console.log("This confirms the architectural violation exists");
    }
  });

  /**
   * Test 3: WeatherWidget should NOT make direct fetch calls to OpenWeather API
   * 
   * **Validates: Requirements 1.1, 2.1**
   * 
   * Expected: Component calls weatherService.getWeather() instead of fetch
   * Current (unfixed): Component makes direct fetch calls to api.openweathermap.org
   * 
   * This test will FAIL on unfixed code, confirming the bug exists
   */
  it("should NOT contain direct fetch calls to openweathermap.org", () => {
    // Check for direct fetch calls to OpenWeather API
    const hasDirectFetch = 
      componentSource.includes("api.openweathermap.org") ||
      componentSource.includes("openweathermap.org/data");
    
    // Check for fetch function calls in general
    const hasFetchCalls = componentSource.includes("fetch(");

    // EXPECTED BEHAVIOR: Component should NOT make direct API calls
    expect(hasDirectFetch).toBe(false);
    
    // Document the counterexample if test fails
    if (hasDirectFetch) {
      console.log("COUNTEREXAMPLE: WeatherWidget makes direct fetch calls to openweathermap.org");
      console.log("This confirms the architectural violation exists");
      
      // Extract the fetch calls for documentation
      const fetchMatches = componentSource.match(/fetch\([^)]+openweathermap[^)]+\)/g);
      if (fetchMatches) {
        console.log("Direct fetch calls found:", fetchMatches.length);
        fetchMatches.forEach((match, index) => {
          console.log(`  ${index + 1}. ${match.substring(0, 100)}...`);
        });
      }
    }
    
    if (hasFetchCalls && hasDirectFetch) {
      console.log("Component uses fetch() directly instead of weatherService abstraction");
    }
  });

  /**
   * Test 4: WeatherWidget should call weatherService.getWeather()
   * 
   * **Validates: Requirements 2.1, 2.3, 2.4**
   * 
   * Expected: Component calls getWeather("Guntur") or similar
   * Current (unfixed): Component does NOT call weatherService.getWeather()
   * 
   * This test will FAIL on unfixed code, confirming the bug exists
   */
  it("should call weatherService.getWeather() for data fetching", () => {
    // Check for getWeather function call
    const callsGetWeather = 
      componentSource.includes("getWeather(") ||
      componentSource.includes("await getWeather") ||
      componentSource.includes("weatherService.getWeather");

    // EXPECTED BEHAVIOR: Component should call getWeather()
    expect(callsGetWeather).toBe(true);
    
    // Document the counterexample if test fails
    if (!callsGetWeather) {
      console.log("COUNTEREXAMPLE: WeatherWidget does NOT call weatherService.getWeather()");
      console.log("This confirms the architectural violation exists");
      console.log("Component should use centralized weatherService instead of direct API calls");
    }
  });

  /**
   * Test 5: WeatherWidget should use WeatherData interface from weatherService
   * 
   * **Validates: Requirement 2.4**
   * 
   * Expected: Component imports and uses WeatherData type from weatherService
   * Current (unfixed): Component defines its own local WeatherData interface
   * 
   * This test will FAIL on unfixed code, confirming the bug exists
   */
  it("should use WeatherData interface from weatherService (not local definition)", () => {
    // Check if component defines its own WeatherData interface
    const hasLocalInterface = 
      componentSource.includes("interface WeatherData") &&
      !componentSource.includes("import") &&
      componentSource.indexOf("interface WeatherData") < componentSource.indexOf("export default");

    // Check if component imports WeatherData from weatherService
    const importsWeatherData = 
      (componentSource.includes('from "@/services/weatherService"') || 
       componentSource.includes("from '@/services/weatherService'")) &&
      (componentSource.includes("WeatherData") || 
       componentSource.includes("type WeatherData"));

    // EXPECTED BEHAVIOR: Component should import WeatherData, not define it locally
    // Note: It's acceptable to have a local interface for component-specific state,
    // but the component should also import and use the service's WeatherData type
    expect(importsWeatherData).toBe(true);
    
    // Document the counterexample if test fails
    if (hasLocalInterface && !importsWeatherData) {
      console.log("COUNTEREXAMPLE: WeatherWidget defines local WeatherData interface");
      console.log("Component should import WeatherData from weatherService for consistency");
      console.log("This indicates data transformation logic duplication");
    }
  });

  /**
   * Summary Test: Complete architectural violation check
   * 
   * This test combines all the above checks to provide a comprehensive
   * counterexample of the architectural violation.
   * 
   * This test will FAIL on unfixed code with detailed counterexamples
   */
  it("should follow service layer architecture (comprehensive check)", () => {
    const violations: string[] = [];

    // Check 1: Missing weatherService import
    if (!componentSource.includes('from "@/services/weatherService"') &&
        !componentSource.includes("from '@/services/weatherService'")) {
      violations.push("Missing weatherService import");
    }

    // Check 2: Hardcoded API key
    if (componentSource.includes("087b86dceed5408c19f8d2e26e65813b")) {
      violations.push("Contains hardcoded API key: 087b86dceed5408c19f8d2e26e65813b");
    }

    // Check 3: Direct fetch calls
    if (componentSource.includes("api.openweathermap.org")) {
      violations.push("Makes direct fetch calls to api.openweathermap.org");
    }

    // Check 4: Missing getWeather call
    if (!componentSource.includes("getWeather(")) {
      violations.push("Does not call weatherService.getWeather()");
    }

    // Check 5: Duplicated data transformation
    if (componentSource.includes("filter(") && 
        componentSource.includes("index % 8") &&
        componentSource.includes("map(")) {
      violations.push("Duplicates forecast data transformation logic from weatherService");
    }

    // EXPECTED BEHAVIOR: No architectural violations
    expect(violations.length).toBe(0);

    // Document all counterexamples if test fails
    if (violations.length > 0) {
      console.log("\n=== ARCHITECTURAL VIOLATIONS DETECTED ===");
      console.log(`Found ${violations.length} violation(s):\n`);
      violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation}`);
      });
      console.log("\nThese violations confirm the bug exists:");
      console.log("- WeatherWidget bypasses the centralized weatherService layer");
      console.log("- Component duplicates API access, error handling, and data transformation");
      console.log("- Fix required: Refactor to use weatherService.getWeather()");
      console.log("=====================================\n");
    }
  });
});
