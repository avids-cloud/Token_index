import { test, expect } from '@playwright/test';

// Smoke test: proves the E2E harness works end to end. Story-specific
// E2E tests are written from acceptance criteria before the feature code.

test('the home page loads with the site wordmark', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('banner').getByText('Token Cost Index'),
  ).toBeVisible();
});

for (const label of ['Submit', 'About', 'API']) {
  test(`the ${label} page is reachable from the header nav`, async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: label })
      .click();
    await expect(
      page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: label }),
    ).toHaveAttribute('aria-current', 'page');
  });
}
