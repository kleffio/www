export function generateTestString(identifier: string) {
  return `pw_${Date.now()}_${Math.random().toString(16).slice(2, 8)}_${identifier}`;
}

export function validateTestString(testString: string) {
  if (testString.substring(0, 3) !== "pw_") {
    throw new Error(
      "Invalid Playwright string format! Use the strings generator to create unique strings"
    );
  }
}
