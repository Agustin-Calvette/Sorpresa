export default async function run(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const el = document.querySelector('.entre-regalo.separador-regalo');
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 160);
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "C:/Users/white/OneDrive/Documents/GitHub/Sorpresa/_qa_sep.png", fullPage: false });
  return { ok: true };
}