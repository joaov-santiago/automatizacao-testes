const fs = require('fs');

// Remove códigos de cor do terminal das mensagens de erro
const ANSI = /\u001b\[[0-9;]*m/g;

const REQUISITOS = [
  'RF01 - Gerenciamento do carrinho',
  'RF02 - Detalhe do produto',
  'RF03 - Informações de checkout',
];

class MarkdownReporter {
  constructor() {
    this.resultados = [];
    this.inicio = new Date();
  }

  onTestEnd(test, result) {
    const partes = test.title.match(/^(CT-\d+)\s+(.*)$/);
    const erro = result.error && result.error.message
      ? result.error.message.replace(ANSI, '').split('\n').filter(Boolean).slice(0, 6).join(' | ')
      : '';

    this.resultados.push({
      id: partes ? partes[1] : test.title,
      titulo: partes ? partes[2] : test.title,
      requisito: test.titlePath().find((t) => /^RF\d+/.test(t)) || '',
      cenario: test.titlePath().find((t) => /^CN-\d+/.test(t)) || '',
      status: result.status,
      duracao: result.duration,
      erro,
    });
  }

  onEnd() {
    const ordenados = [...this.resultados].sort((a, b) => a.id.localeCompare(b.id));
    const total = ordenados.length;
    const passou = ordenados.filter((r) => r.status === 'passed').length;
    const falhou = ordenados.filter((r) => r.status !== 'passed').length;
    const rotulo = (s) => (s === 'passed' ? 'Aprovado' : s === 'skipped' ? 'Não executado' : 'Reprovado');

    const linhas = [];
    linhas.push('# Relatório de Execução dos Testes E2E - Swag Labs');
    linhas.push('');
    linhas.push(`Responsável: João Vitor Santiago Rangel`);
    linhas.push(`Data da execução: ${this.inicio.toLocaleString('pt-BR')}`);
    linhas.push('Sistema: https://www.saucedemo.com/');
    linhas.push('Ferramenta: Playwright (Chromium)');
    linhas.push('');
    linhas.push('## Requisitos validados');
    linhas.push('');
    REQUISITOS.forEach((r) => linhas.push(`- ${r}`));
    linhas.push('');
    linhas.push('## Resumo');
    linhas.push('');
    linhas.push('| Total | Aprovados | Reprovados |');
    linhas.push('|---|---|---|');
    linhas.push(`| ${total} | ${passou} | ${falhou} |`);
    linhas.push('');
    linhas.push('## Resultado por caso de teste');
    linhas.push('');
    linhas.push('| ID | Requisito | Cenário | Caso de teste | Resultado | Tempo (ms) |');
    linhas.push('|---|---|---|---|---|---|');
    ordenados.forEach((r) => {
      linhas.push(`| ${r.id} | ${r.requisito.split(' - ')[0]} | ${r.cenario.split(' - ')[0]} | ${r.titulo} | ${rotulo(r.status)} | ${r.duracao} |`);
    });
    linhas.push('');
    linhas.push('## Inconsistências encontradas');
    linhas.push('');
    const falhas = ordenados.filter((r) => r.status !== 'passed' && r.status !== 'skipped');
    if (falhas.length === 0) {
      linhas.push('Nenhum caso reprovado nesta execução.');
    } else {
      falhas.forEach((r) => {
        linhas.push(`### ${r.id} - ${r.titulo}`);
        linhas.push('');
        linhas.push(`- Requisito: ${r.requisito}`);
        linhas.push(`- Cenário: ${r.cenario}`);
        linhas.push(`- Resultado: ${rotulo(r.status)}`);
        linhas.push(`- Mensagem da ferramenta: ${r.erro}`);
        linhas.push('- Evidência: ver a pasta test-results/ (print e trace) e o playwright-report/');
        linhas.push('- Análise: (descrever se é defeito do sistema ou problema no teste e a criticidade)');
        linhas.push('');
      });
    }

    fs.writeFileSync('relatorio-execucao.md', linhas.join('\n'), 'utf8');
  }
}

module.exports = MarkdownReporter;
