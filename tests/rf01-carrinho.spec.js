const { test, expect } = require('@playwright/test');
const {
  PRODUTOS, SEL, login, adicionarNaLista, abrirCarrinho,
} = require('./support');

test.describe('RF01 - Gerenciamento do carrinho', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // CN-01 - Adicionar produtos ao carrinho
  test.describe('CN-01 - Adicionar produtos ao carrinho', () => {
    test('CT-001 Adicionar um produto pela lista', async ({ page }) => {
      await adicionarNaLista(page, PRODUTOS.backpack);

      await expect(page.locator(SEL.botaoRemover(PRODUTOS.backpack.slug))).toBeVisible();
      await expect(page.locator(SEL.badge)).toHaveText('1');
    });

    test('CT-002 Adicionar dois produtos diferentes', async ({ page }) => {
      await adicionarNaLista(page, PRODUTOS.backpack);
      await adicionarNaLista(page, PRODUTOS.bikeLight);
      await abrirCarrinho(page);

      await expect(page.locator(SEL.badge)).toHaveText('2');
      await expect(page.locator(SEL.item)).toHaveCount(2);
    });

    test('CT-003 Adicionar os 6 produtos', async ({ page }) => {
      for (let i = 0; i < 6; i++) {
        await page.locator('[data-test^="add-to-cart"]').first().click();
      }

      await expect(page.locator(SEL.badge)).toHaveText('6');
      await expect(page.locator('[data-test^="remove"]')).toHaveCount(6);
      await abrirCarrinho(page);
      await expect(page.locator(SEL.item)).toHaveCount(6);
    });
  });

  // CN-02 - Remover produtos do carrinho
  test.describe('CN-02 - Remover produtos do carrinho', () => {
    test('CT-004 Remover um produto pela lista', async ({ page }) => {
      await adicionarNaLista(page, PRODUTOS.backpack);
      await page.locator(SEL.botaoRemover(PRODUTOS.backpack.slug)).click();

      await expect(page.locator(SEL.botaoAdicionar(PRODUTOS.backpack.slug))).toBeVisible();
      await expect(page.locator(SEL.badge)).toHaveCount(0);
    });

    test('CT-005 Remover um produto pelo carrinho', async ({ page }) => {
      await adicionarNaLista(page, PRODUTOS.backpack);
      await adicionarNaLista(page, PRODUTOS.bikeLight);
      await abrirCarrinho(page);
      await page.locator(SEL.botaoRemover(PRODUTOS.backpack.slug)).click();

      await expect(page.locator(SEL.item)).toHaveCount(1);
      await expect(page.locator(SEL.item)).toContainText(PRODUTOS.bikeLight.nome);
      await expect(page.locator(SEL.badge)).toHaveText('1');
    });

    test('CT-006 Remover o único item do carrinho', async ({ page }) => {
      await adicionarNaLista(page, PRODUTOS.backpack);
      await abrirCarrinho(page);
      await page.locator(SEL.botaoRemover(PRODUTOS.backpack.slug)).click();

      await expect(page.locator(SEL.item)).toHaveCount(0);
      await expect(page.locator(SEL.badge)).toHaveCount(0);
    });
  });

  // CN-03 - Conferir os itens do carrinho
  test.describe('CN-03 - Conferir os itens do carrinho', () => {
    test('CT-007 Manter os itens ao navegar entre as páginas', async ({ page }) => {
      await adicionarNaLista(page, PRODUTOS.backpack);
      await abrirCarrinho(page);
      await page.locator(SEL.continuarComprando).click();
      await expect(page).toHaveURL(/inventory\.html/);
      await adicionarNaLista(page, PRODUTOS.boltTShirt);
      await abrirCarrinho(page);

      await expect(page.locator(SEL.badge)).toHaveText('2');
      await expect(page.locator(SEL.item)).toHaveCount(2);
      await expect(page.locator(SEL.item).nth(0)).toContainText(PRODUTOS.backpack.nome);
      await expect(page.locator(SEL.item).nth(1)).toContainText(PRODUTOS.boltTShirt.nome);
    });

    test('CT-008 Conferir os dados do item no carrinho', async ({ page }) => {
      const itemLista = page.locator(SEL.item, { hasText: PRODUTOS.fleece.nome });
      const nome = await itemLista.locator(SEL.nomeItem).innerText();
      const descricao = await itemLista.locator(SEL.descItem).innerText();
      const preco = await itemLista.locator(SEL.precoItem).innerText();

      await adicionarNaLista(page, PRODUTOS.fleece);
      await abrirCarrinho(page);

      const itemCarrinho = page.locator(SEL.item);
      await expect(itemCarrinho.locator(SEL.nomeItem)).toHaveText(nome);
      await expect(itemCarrinho.locator(SEL.descItem)).toHaveText(descricao);
      await expect(itemCarrinho.locator(SEL.precoItem)).toHaveText(preco);
      await expect(itemCarrinho.locator(SEL.precoItem)).toHaveText('$49.99');
      await expect(itemCarrinho.locator('[data-test="item-quantity"]')).toHaveText('1');
    });

    test('CT-009 Abrir o carrinho vazio', async ({ page }) => {
      await abrirCarrinho(page);
      await expect(page.locator(SEL.item)).toHaveCount(0);

      await page.locator(SEL.continuarComprando).click();
      await expect(page).toHaveURL(/inventory\.html/);
    });
  });
});
