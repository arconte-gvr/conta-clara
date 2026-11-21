# Conta Clara

Calculadora estática e gratuita para estimar consumo residencial de energia, custo, economia e retorno simples de troca de aparelhos.

## O que a aplicação faz
- Estima kWh e custo mensal a partir de potência, horas de uso, quantidade, dias e tarifa informados.
- Oferece seleção opcional de tarifa homologada residencial convencional da ANEEL (TE + TUSD), mantendo a tarifa manual como alternativa.
- Atualiza a base de referência por GitHub Actions semanalmente, com validações de vigência, unidade, duplicatas e integridade da população de distribuidoras.
- Compara o consumo de dois aparelhos e calcula economia estimada e retorno simples.
- Simula redução de horas de uso.
- Salva até 24 registros no armazenamento local do navegador.
- Exporta os aparelhos cadastrados em CSV.

## Executar os testes
Requer Node.js 20 ou superior. Não é necessário instalar dependências.

```bash
node --test
```

Os testes atuais verificam a sintaxe do JavaScript da aplicação e as regras do importador ANEEL (filtros, unidades, vigência, conflitos e integridade do lote). Ainda não existe teste automatizado de navegador para todos os fluxos da calculadora.

## Publicação
Versão pública: https://conta-clara.guilhermevross.workers.dev

A hospedagem atual é um **Cloudflare Worker com Static Assets**. Este repositório não contém configuração Wrangler nem fluxo de publicação automática. Portanto:
- Não siga instruções antigas de Cloudflare Pages como se fossem o procedimento atual.
- Não presuma que um commit no GitHub atualiza o site público. A rotina semanal atualiza o arquivo `data/tarifas.json` no repositório; o Worker publicado não está conectado a esse fluxo e precisa de publicação separada para receber o novo arquivo.
- Faça publicação somente usando a configuração e a conta Cloudflare já autorizadas pelo responsável.
- Não altere domínio, hospedagem, permissões, segredos ou integrações sem aprovação específica.

## Privacidade e limitações
- Não há backend, contas ou sincronização entre dispositivos.
- O histórico fica no armazenamento local deste navegador e pode ser apagado pelo usuário.
- Os cálculos são estimativas educativas; o valor real da fatura pode incluir impostos, bandeiras, taxas e condições que não estão modeladas.
- A tarifa padrão de R$ 0,90/kWh é apenas um exemplo editável, não uma tarifa oficial.
- A referência ANEEL usa somente B1 residencial convencional, Tarifa de Aplicação, detalhe “Não se aplica”, sem posto, em R$/MWh convertido para R$/kWh. Não cobre tarifa branca, baixa renda, geração própria ou classes não residenciais.
- A referência é TE + TUSD e não inclui necessariamente tributos, bandeiras, iluminação pública e outros itens da fatura. A seleção é opcional e nunca substitui a tarifa manual sem ação da pessoa.
- Os dados derivados são atribuídos à ANEEL e publicados sob ODbL 1.0; consulte `DATA-LICENSE.md`.
- A página não envia os dados dos aparelhos a um servidor.
- Não há anúncios, rastreamento ou coleta analítica.

## Princípios para manutenção
- Preservar custo zero, arquitetura estática, privacidade local e compatibilidade móvel.
- Corrigir bugs reproduzíveis antes de adicionar funcionalidades.
- Manter os testes atualizados e executar `node --test` antes de concluir mudanças.
- Distinguir testes automatizados, inspeção estática, testes reais em navegador e confirmação de publicação.
- Não prometer economia garantida nem inventar tarifas ou estatísticas.
