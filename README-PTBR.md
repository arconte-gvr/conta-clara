# Conta Clara

Calculadora estática e gratuita para estimar consumo residencial de energia, custo, economia e retorno simples de troca de aparelhos.

## O que a aplicação faz
- Estima kWh e custo mensal a partir de potência, horas de uso, quantidade, dias e tarifa informados.
- Compara o consumo de dois aparelhos e calcula economia estimada e retorno simples.
- Simula redução de horas de uso.
- Salva até 24 registros no armazenamento local do navegador.
- Exporta os aparelhos cadastrados em CSV.

## Executar os testes
Requer Node.js 20 ou superior. Não é necessário instalar dependências.

```bash
node --test
```

Os testes verificam a sintaxe do JavaScript da aplicação, normalização de dias e tarifa, consumo mensal, economia e proteção contra fórmulas em células CSV. O GitHub Actions executa a mesma suíte em atualizações do branch `main` e em pull requests.

## Publicação
Versão pública: https://conta-clara.guilhermevross.workers.dev

A hospedagem atual é um **Cloudflare Worker com Static Assets**. Este repositório não contém configuração Wrangler nem fluxo de publicação automática. Portanto:
- Não siga instruções antigas de Cloudflare Pages como se fossem o procedimento atual.
- Não presuma que um commit no GitHub atualiza o site público.
- Faça publicação somente usando a configuração e a conta Cloudflare já autorizadas pelo responsável.
- Não altere domínio, hospedagem, permissões, segredos ou integrações sem aprovação específica.

## Privacidade e limitações
- Não há backend, contas ou sincronização entre dispositivos.
- O histórico fica no armazenamento local deste navegador e pode ser apagado pelo usuário.
- Os cálculos são estimativas educativas; o valor real da fatura pode incluir impostos, bandeiras, taxas e condições que não estão modeladas.
- A tarifa padrão de R$ 0,90/kWh é apenas um exemplo editável, não uma tarifa oficial.
- A página não envia os dados dos aparelhos a um servidor.
- Não há anúncios, rastreamento ou coleta analítica.

## Princípios para manutenção
- Preservar custo zero, arquitetura estática, privacidade local e compatibilidade móvel.
- Corrigir bugs reproduzíveis antes de adicionar funcionalidades.
- Manter os testes atualizados e executar `node --test` antes de concluir mudanças.
- Distinguir testes automatizados, inspeção estática, testes reais em navegador e confirmação de publicação.
- Não prometer economia garantida nem inventar tarifas ou estatísticas.
