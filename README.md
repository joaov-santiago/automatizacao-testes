# Testes E2E automatizados - Swag Labs

Responsável: João Vitor Santiago Rangel
Sistema: https://www.saucedemo.com/
Ferramenta: Playwright (JavaScript)

## Requisitos validados

| ID | Requisito | Arquivo de teste |
|---|---|---|
| RF01 | Gerenciamento do carrinho | tests/rf01-carrinho.spec.js |
| RF02 | Detalhe do produto | tests/rf02-detalhe.spec.js |
| RF03 | Informações de checkout | tests/rf03-checkout.spec.js |

Os cenários (CN-01 a CN-10) e os casos de teste (CT-001 a CT-032) são os mesmos do documento Projeto de Casos de Teste. O título de cada teste começa com o ID do caso.

## Como rodar

Precisa do Node.js instalado (versão 18 ou mais nova).

```
npm install
npx playwright install chromium
npm test
```

Outros comandos:

```
npm run test:headed          # abre o navegador para acompanhar
npx playwright test -g "CT-025"   # roda só um caso
npm run report               # abre o relatório HTML
```

## O que é gerado

- `relatorio-execucao.md`: relatório da execução com resumo, resultado de cada caso e as inconsistências encontradas
- `playwright-report/`: relatório HTML da ferramenta
- `test-results/`: prints e traces dos testes que falharam

## Estrutura

```
tests/
  support.js              seletores e funções de apoio (login, carrinho, checkout)
  rf01-carrinho.spec.js   CT-001 a CT-009
  rf02-detalhe.spec.js    CT-010 a CT-018
  rf03-checkout.spec.js   CT-019 a CT-032
reporters/
  markdown-reporter.js    gera o relatorio-execucao.md
playwright.config.js
```

## Observações

- O login não faz parte do escopo, mas é feito antes de cada teste com o usuário `standard_user` para chegar na loja.
- O CT-030 (campos só com espaços) e o CT-024 (CEP com letras) são exploratórios. Se falharem, vale analisar se o comportamento do sistema é um defeito ou se o resultado esperado precisa ser ajustado.
