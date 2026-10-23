import { test, expect } from '@playwright/test';

test('Golden Path: Register -> Create Project -> Task -> Timer -> Dashboard', async ({ page }) => {
  // Install mock clock before anything happens
  await page.clock.install();

  const email = `test-${Date.now()}@example.com`;
  const password = 'password123';

  // 2. Register
  await page.goto('/register');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await expect(page).toHaveURL('/dashboard');

  // 3. Create Project
  await page.click('text=Projects');
  await page.fill('input[name="name"]', 'E2E Project');
  await page.click('button:has-text("Create")');
  await expect(page.locator('text=E2E Project')).toBeVisible();

  // 4. Open Project and Create Task
  await page.click('text=E2E Project');
  await page.fill('input[name="title"]', 'E2E Task');
  await page.click('button:has-text("Add task")');
  await expect(page.locator('text=E2E Task')).toBeVisible();

  // 5. Start Timer
  await page.click('button:has-text("25")');
  await expect(page.locator('button:has-text("Minimize")')).toBeVisible();

  // 6. Minimize the timer so we can access the Navbar
  await page.click('button:has-text("Minimize")');
  
  // Navigate away
  await page.click('text=Dashboard');
  // Verify timer persists (pill is visible)
  await expect(page.locator('button:has-text("E2E Task")')).toBeVisible();

  // 7. Fast-forward time to complete the session
  await page.clock.fastForward(25 * 60 * 1000); // 25 minutes in ms

  // 8. Verify Completion UI
  await expect(page.locator('text=Saving session...')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('button:has-text("Done")')).toBeVisible({ timeout: 10000 });
  await page.click('button:has-text("Done")');

  // 9. Verify Dashboard updated
  await expect(page.locator('text=Focused today')).toBeVisible();
  await expect(page.locator('text=25:00').first()).toBeVisible(); // The total focused time
  await expect(page.locator('text=E2E Task')).toBeVisible(); // Session row

  // 10. Verify Task is STILL PENDING (Rule 2)
  await page.click('text=Projects');
  
  // Wait for the projects list to load
  await expect(page.locator('h1')).toHaveText('Projects');

  await page.click('text=E2E Project');
  
  // Wait for the project detail page to load before looking for the task
  await expect(page.locator('h1')).toHaveText('E2E Project');
  
  // Now we are safely on the task page
  const taskRow = page.locator('li', { hasText: 'E2E Task' });
  await expect(taskRow.locator('button:has-text("Complete")')).toBeVisible();
});