const { test, expect } = require('@playwright/test');
const {
  PRODUTOS, DADOS_VALIDOS, SEL, login, adicionarNaLista, abrirCarrinho,
  irParaInformacoesDoCheckout, preencherInformacoes,
} = require('./support');

test.describe('RF03 - Informações de checkout', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // CN-07 - Acessar a etapa de informações
  test.describe('CN-07 - Acessar a etapa de informações', () => {
    test('CT-019 Iniciar o checkout', async ({ page }) => {
      await adicionarNaLista(page, PRODUTOS.backpack);
      await abrirCarrinho(page);
      await page.locator(SEL.checkout).click();

      await expect(page).toHaveURL(/checkout-step-one\.html/);
      await expect(page.locator(SEL.titulo)).toHaveText('Checkout: Your Information');
      await expect(page.locator(SEL.primeiroNome)).toBeVisible();
      await expect(page.locator(SEL.sobrenome)).toBeVisible();
      await expect(page.locator(SEL.cep)).toBeVisible();
      await expect(page.locator(SEL.cancelar)).toBeVisible();
      await expect(page.locator(SEL.continuar)).toBeVisible();
    });

    test('CT-020 Cancelar o checkout', async ({ page }) => {
      await irParaInformacoesDoCheckout(page);
      await page.locator(SEL.cancelar).click();

      await expect(page).toHaveURL(/cart\.html/);
      await expect(page.locator(SEL.item)).toHaveCount(1);
    });
  });

  // CN-08 - Preencher com dados válidos
  test.describe('CN-08 - Preencher com dados válidos', () => {
    const casosValidos = [
      ['CT-021', 'Todos os campos com dados válidos', DADOS_VALIDOS],
      ['CT-022', 'Um caractere em cada campo', { nome: 'A', sobrenome: 'B', cep: '1' }],
      ['CT-023', 'Textos longos', { nome: 'a'.repeat(100), sobrenome: 'b'.repeat(100), cep: '1'.repeat(100) }],
      ['CT-024', 'CEP com letras e símbolos', { nome: 'João', sobrenome: 'Rangel', cep: 'AB-123!' }],
    ];

    for (const [id, titulo, dados] of casosValidos) {
      test(`${id} ${titulo}`, async ({ page }) => {
        await irParaInformacoesDoCheckout(page);
        await preencherInformacoes(page, dados);
        await page.locator(SEL.continuar).click();

        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(page.locator(SEL.titulo)).toHaveText('Checkout: Overview');
      });
    }
  });

  // CN-09 - Validar os campos obrigatórios
  test.describe('CN-09 - Validar os campos obrigatórios', () => {
    const casosObrigatorios = [
      ['CT-025', 'Primeiro Nome vazio',
        { nome: '', sobrenome: 'Rangel', cep: '29100-000' }, 'First Name is required'],
      ['CT-026', 'Sobrenome vazio',
        { nome: 'João', sobrenome: '', cep: '29100-000' }, 'Last Name is required'],
      ['CT-027', 'CEP vazio',
        { nome: 'João', sobrenome: 'Rangel', cep: '' }, 'Postal Code is required'],
      ['CT-028', 'Todos os campos vazios',
        { nome: '', sobrenome: '', cep: '' }, 'First Name is required'],
      ['CT-029', 'Nome e sobrenome vazios com CEP preenchido',
        { nome: '', sobrenome: '', cep: '29100-000' }, 'First Name is required'],
      // Caso exploratório: espaços em branco deveriam ser tratados como campo vazio.
      ['CT-030', 'Campos só com espaços',
        { nome: '   ', sobrenome: '   ', cep: '   ' }, 'is required'],
    ];

    for (const [id, titulo, dados, mensagem] of casosObrigatorios) {
      test(`${id} ${titulo}`, async ({ page }) => {
        await irParaInformacoesDoCheckout(page);
        await preencherInformacoes(page, dados);
        await page.locator(SEL.continuar).click();

        await expect(page.locator(SEL.erro)).toContainText(mensagem);
        await expect(page).toHaveURL(/checkout-step-one\.html/);
      });
    }
  });

  // CN-10 - Mensagem de erro
  test.describe('CN-10 - Mensagem de erro', () => {
    test('CT-031 Fechar a mensagem de erro', async ({ page }) => {
      await irParaInformacoesDoCheckout(page);
      await page.locator(SEL.continuar).click();
      await expect(page.locator(SEL.erro)).toBeVisible();

      await page.locator(SEL.fecharErro).click();

      await expect(page.locator(SEL.erro)).toHaveCount(0);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });

    test('CT-032 Corrigir o erro e seguir', async ({ page }) => {
      await irParaInformacoesDoCheckout(page);
      await preencherInformacoes(page, { nome: 'João', sobrenome: 'Rangel', cep: '' });
      await page.locator(SEL.continuar).click();
      await expect(page.locator(SEL.erro)).toContainText('Postal Code is required');

      await page.locator(SEL.cep).fill('29100-000');
      await page.locator(SEL.continuar).click();

      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });
  });
});
