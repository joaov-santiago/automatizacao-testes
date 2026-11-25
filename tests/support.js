const { expect } = require('@playwright/test');

const PRODUTOS = {
  backpack: { slug: 'sauce-labs-backpack', nome: 'Sauce Labs Backpack', preco: '$29.99' },
  bikeLight: { slug: 'sauce-labs-bike-light', nome: 'Sauce Labs Bike Light', preco: '$9.99' },
  boltTShirt: { slug: 'sauce-labs-bolt-t-shirt', nome: 'Sauce Labs Bolt T-Shirt', preco: '$15.99' },
  fleece: { slug: 'sauce-labs-fleece-jacket', nome: 'Sauce Labs Fleece Jacket', preco: '$49.99' },
};

const DADOS_VALIDOS = { nome: 'João', sobrenome: 'Rangel', cep: '29100-000' };

// Seletores usados em mais de um teste
const SEL = {
  item: '[data-test="inventory-item"]',
  nomeItem: '[data-test="inventory-item-name"]',
  descItem: '[data-test="inventory-item-desc"]',
  precoItem: '[data-test="inventory-item-price"]',
  badge: '[data-test="shopping-cart-badge"]',
  iconeCarrinho: '[data-test="shopping-cart-link"]',
  botaoAdicionar: (slug) => `[data-test="add-to-cart-${slug}"]`,
  botaoRemover: (slug) => `[data-test="remove-${slug}"]`,
  continuarComprando: '[data-test="continue-shopping"]',
  checkout: '[data-test="checkout"]',
  voltarParaProdutos: '[data-test="back-to-products"]',
  primeiroNome: '[data-test="firstName"]',
  sobrenome: '[data-test="lastName"]',
  cep: '[data-test="postalCode"]',
  continuar: '[data-test="continue"]',
  cancelar: '[data-test="cancel"]',
  erro: '[data-test="error"]',
  fecharErro: '[data-test="error-button"]',
  titulo: '[data-test="title"]',
};

// O login não faz parte do escopo, mas é necessário para chegar na loja.
async function login(page) {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await expect(page).toHaveURL(/inventory\.html/);
}

async function adicionarNaLista(page, produto) {
  await page.locator(SEL.botaoAdicionar(produto.slug)).click();
}

async function abrirCarrinho(page) {
  await page.locator(SEL.iconeCarrinho).click();
  await expect(page).toHaveURL(/cart\.html/);
}

async function abrirDetalhePeloNome(page, produto) {
  await page.locator(SEL.nomeItem, { hasText: produto.nome }).click();
  await expect(page).toHaveURL(/inventory-item\.html/);
}

async function irParaInformacoesDoCheckout(page) {
  await adicionarNaLista(page, PRODUTOS.backpack);
  await abrirCarrinho(page);
  await page.locator(SEL.checkout).click();
  await expect(page).toHaveURL(/checkout-step-one\.html/);
}

async function preencherInformacoes(page, dados) {
  await page.locator(SEL.primeiroNome).fill(dados.nome);
  await page.locator(SEL.sobrenome).fill(dados.sobrenome);
  await page.locator(SEL.cep).fill(dados.cep);
}

module.exports = {
  PRODUTOS,
  DADOS_VALIDOS,
  SEL,
  login,
  adicionarNaLista,
  abrirCarrinho,
  abrirDetalhePeloNome,
  irParaInformacoesDoCheckout,
  preencherInformacoes,
};
