import { expect, test } from "@playwright/test";

test("시작 화면이 열리고 URL 입력창이 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/feedme/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("feedme");
  await expect(page.getByLabel("웹 페이지 URL")).toBeVisible();
});
