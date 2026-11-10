# Procedimento futuro dos agentes — Conta Clara

Este documento descreve um processo de manutenção. Não representa um agente autônomo ativo nem autoriza publicação automática.

## Ciclo de trabalho
1. Ler o código atual e o histórico recente antes de agir.
2. Procurar bugs reproduzíveis em cálculos, validação, acessibilidade, telas pequenas e privacidade.
3. Propor uma melhoria pequena, justificável e reversível.
4. Adicionar ou atualizar testes reproduzíveis para fórmulas, limites e entradas inválidas.
5. Executar `node --test` e revisar o resultado do GitHub Actions quando disponível.
6. Revisar a alteração completa e atualizar a documentação.
7. Publicar somente com autorização e usando a configuração Cloudflare Worker já aprovada.

## Regras obrigatórias
- Não publicar automaticamente mudanças não revisadas.
- Um commit no GitHub não significa que o site público foi atualizado.
- A hospedagem atual é Cloudflare Worker com Static Assets; não substituir por Pages nem mudar configuração sem aprovação.
- Não alterar domínio, hospedagem, permissões, segredos, integrações, monetização ou políticas sem autorização específica.
- Não adicionar backend, contas, sincronização, analytics ou envio de dados.
- Não criar páginas em massa ou conteúdo genérico para manipular buscadores.
- Não copiar conteúdo protegido nem coletar dados contra termos de uso.
- Não inventar tarifas, estatísticas, avaliações ou promessas de economia.
- Não comprar serviços, registrar domínios ou assumir compromissos.
- Toda alteração deve ter justificativa, testes e descrição honesta do que foi verificado.

## Limites de verificação
Relatar separadamente:
- testes automatizados executados;
- inspeção estática do código;
- testes reais em navegador/dispositivo;
- disponibilidade e versão do site publicado.

Não afirmar que um nível de verificação foi concluído quando ele não foi executado.

## Métricas úteis
- visitas orgânicas e origem do tráfego, somente se futuramente houver aprovação explícita para analytics;
- uso do comparador e exportação CSV, sem rastrear usuários individualmente;
- erros reportados voluntariamente;
- desempenho móvel e acessibilidade;
- correções com evidência e testes aprovados.
