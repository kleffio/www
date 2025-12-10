import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email or Username' }).click();
  await page.getByRole('textbox', { name: 'Email or Username' }).fill('Christine');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('froopsie1');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.goto('http://localhost:3000/dashboard');
  await page.getByRole('link', { name: 'Projects' }).click();
  await page.getByRole('button', { name: 'Create Project' }).click();
  await page.getByRole('textbox', { name: 'Project name *' }).click();
  await page.getByRole('textbox', { name: 'Project name *' }).fill('test');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('this is a test');
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
});