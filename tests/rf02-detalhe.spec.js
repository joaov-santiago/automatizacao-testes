const { test, expect } = require('@playwright/test');
const {
  PRODUTOS, SEL, login, adicionarNaLista, abrirCarrinho, abrirDetalhePeloNome,
} = require('./support');

test.describe('RF02 - Detalhe do produto', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // CN-04 - Abrir o detalhe do produto
  test.describe('CN-04 - Abrir o detalhe do produto', () => {
    test('CT-010 Abrir o detalhe pelo nome', async ({ page }) => {
      await abrirDetalhePeloNome(page, PRODUTOS.backpack);

      await expect(page.locator(SEL.nomeItem)).toHaveText(PRODUTOS.backpack.nome);
      await expect(page.locator(SEL.descItem)).not.toBeEmpty();
      await expect(page.locator(SEL.precoItem)).toHaveText('$29.99');
      await expect(page.locator('img.inventory_details_img')).toBeVisible();
      await expect(page.locator(SEL.botaoAdicionar(PRODUTOS.backpack.slug))).toBeVisible();
    });

    test('CT-011 Abrir o detalhe pela imagem', async ({ page }) => {
      await page.locator(`img.inventory_item_img[alt="${PRODUTOS.bikeLight.nome}"]`).click();

      await expect(page).toHaveURL(/inventory-item\.html/);
      await expect(page.locator(SEL.nomeItem)).toHaveText(PRODUTOS.bikeLight.nome);
      await expect(page.locator(SEL.precoItem)).toHaveText('$9.99');
    });

    test('CT-012 Conferir o detalhe dos 6 produtos', async ({ page }) => {
      const total = await page.locator(SEL.item).count();
      expect(total).toBe(6);

      for (let i = 0; i < total; i++) {
        const itemLista = page.locator(SEL.item).nth(i);
        const nome = await itemLista.locator(SEL.nomeItem).innerText();
        const descricao = await itemLista.locator(SEL.descItem).innerText();
        const preco = await itemLista.locator(SEL.precoItem).innerText();

        await itemLista.locator(SEL.nomeItem).click();

        await expect(page.locator(SEL.nomeItem)).toHaveText(nome);
        await expect(page.locator(SEL.descItem)).toHaveText(descricao);
        await expect(page.locator(SEL.precoItem)).toHaveText(preco);

        await page.locator(SEL.voltarParaProdutos).click();
        await expect(page).toHaveURL(/inventory\.html/);
      }
    });
  });

  // CN-05 - Navegar a partir do detalhe
  test.describe('CN-05 - Navegar a partir do detalhe', () => {
    test('CT-013 Voltar pelo botão "Back to products"', async ({ page }) => {
      await abrirDetalhePeloNome(page, PRODUTOS.backpack);
      await page.locator(SEL.voltarParaProdutos).click();

      await expect(page).toHaveURL(/inventory\.html/);
      await expect(page.locator(SEL.item)).toHaveCount(6);
    });

    test('CT-014 Ir para o carrinho a partir do detalhe', async ({ page }) => {
      await abrirDetalhePeloNome(page, PRODUTOS.backpack);
      await abrirCarrinho(page);

      await expect(page).toHaveURL(/cart\.html/);
    });

    test('CT-015 Voltar pelo botão do navegador', async ({ page }) => {
      await abrirDetalhePeloNome(page, PRODUTOS.backpack);
      await page.goBack();

      await expect(page).toHaveURL(/inventory\.html/);
      await expect(page.locator(SEL.item)).toHaveCount(6);
    });
  });

  // CN-06 - Adicionar e remover pelo detalhe
  test.describe('CN-06 - Adicionar e remover pelo detalhe', () => {
    test('CT-016 Adicionar o produto pelo detalhe', async ({ page }) => {
      await abrirDetalhePeloNome(page, PRODUTOS.backpack);
      await page.locator(SEL.botaoAdicionar(PRODUTOS.backpack.slug)).click();

      await expect(page.locator(SEL.botaoRemover(PRODUTOS.backpack.slug))).toBeVisible();
      await expect(page.locator(SEL.badge)).toHaveText('1');
    });

    test('CT-017 Remover o produto pelo detalhe', async ({ page }) => {
      await adicionarNaLista(page, PRODUTOS.backpack);
      await abrirDetalhePeloNome(page, PRODUTOS.backpack);
      await page.locator(SEL.botaoRemover(PRODUTOS.backpack.slug)).click();

      await expect(page.locator(SEL.botaoAdicionar(PRODUTOS.backpack.slug))).toBeVisible();
      await expect(page.locator(SEL.badge)).toHaveCount(0);
    });

    test('CT-018 Botão igual ao da lista', async ({ page }) => {
      await adicionarNaLista(page, PRODUTOS.backpack);
      await abrirDetalhePeloNome(page, PRODUTOS.backpack);
      await expect(page.locator(SEL.botaoRemover(PRODUTOS.backpack.slug))).toBeVisible();

      await page.locator(SEL.voltarParaProdutos).click();
      await expect(page.locator(SEL.botaoRemover(PRODUTOS.backpack.slug))).toBeVisible();
    });
  });
});
