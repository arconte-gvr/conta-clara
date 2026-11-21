# Dados tarifários da ANEEL

O Conta Clara utiliza uma seleção derivada do conjunto público **Tarifas de aplicação das distribuidoras de energia elétrica**, publicado pela Agência Nacional de Energia Elétrica (ANEEL).

- Fonte: https://dadosabertos.aneel.gov.br/dataset/tarifas-distribuidoras-energia-eletrica
- Recurso CSV: https://dadosabertos.aneel.gov.br/dataset/5a583f3e-1646-4f67-bf0f-69db4203e89e/resource/fcf2906c-7c32-4b9b-a637-054e7a5234f4/download/tarifas-homologadas-distribuidoras-energia-eletrica.csv
- Licença declarada pela ANEEL: Open Data Commons Open Database License (ODbL) 1.0 — https://opendatacommons.org/licenses/odbl/1-0/

A seleção considera somente tarifa de aplicação, subgrupo B1, modalidade Convencional, classe e subclasse Residencial e detalhe “Não se aplica”. Registros devem estar em R$/MWh, sem posto tarifário, e dentro da vigência na data de referência.

A conversão é (VlrTUSD + VlrTE) / 1.000, resultando em R$/kWh. A base derivada mantém a atribuição à ANEEL e é disponibilizada sob ODbL 1.0.

**Limitação:** TE + TUSD não reproduzem a fatura final. Tributos, bandeiras, iluminação pública, condições individuais e outros componentes podem alterar o valor pago. A aplicação deve manter a tarifa manual disponível e nunca substituir o valor informado pelo consumidor sem ação explícita.
