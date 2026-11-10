# Conta Clara — pacote para publicação

## Conteúdo
- `index.html`: aplicação estática.
- `robots.txt`: permite rastreamento público por mecanismos de busca.

## Publicação recomendada: Cloudflare Pages com Git
Escolhemos integração Git porque o objetivo futuro é permitir que alterações revisadas no repositório sejam publicadas automaticamente. **Atenção:** a documentação da Cloudflare informa que um projeto criado por Direct Upload não pode ser convertido depois para Git integration; se escolher Direct Upload, será necessário criar outro projeto para mudar de estratégia.

1. Crie um repositório no GitHub e envie estes arquivos para a raiz.
2. Entre no painel Cloudflare e abra Workers & Pages.
3. Crie uma aplicação Pages conectada ao GitHub.
4. Selecione o repositório `conta-clara`.
5. Como é um site estático sem etapa de compilação, deixe o comando de build vazio.
6. Defina o diretório de saída como `/` ou `.` conforme o painel aceitar.
7. Conclua o deploy e teste a URL `*.pages.dev` fornecida.

## Custos e limites
O Cloudflare Pages oferece plano Free, sujeito a limites publicados pela Cloudflare. Entre os limites documentados estão até 500 builds por mês, 20.000 arquivos por site e tamanho máximo de 25 MiB por arquivo. Confira a documentação antes de crescer o projeto:
https://developers.cloudflare.com/pages/platform/limits/

Guia de integração Git:
https://developers.cloudflare.com/pages/configuration/git-integration/

## Antes de monetizar
- Não inserir anúncios até existir tráfego e aprovação na plataforma de monetização.
- Não inventar tarifa de energia ou prometer economia garantida.
- Explicar que a estimativa depende da potência, tempo de uso e tarifa informados.
- Revisar privacidade, acessibilidade e precisão dos cálculos.
- Não coletar dados pessoais sem necessidade e sem aviso adequado.

## Limitações atuais
- Não há backend nem sincronização entre dispositivos.
- O histórico usa armazenamento local do navegador.
- Não há agente autônomo conectado ao repositório.
- Publicação e configuração de contas ainda exigem ação e autorização humanas.
