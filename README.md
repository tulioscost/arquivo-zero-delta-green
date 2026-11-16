# ARQUIVO ZERO — Módulo Foundry VTT (Delta Green)

**Versão:** 1.1.0 · **Idioma:** Português brasileiro · **Sistema:** `deltagreen`

> **Atenção:** este pacote foi construído e passou por verificações estáticas e por uma simulação automatizada da importação, mas **não foi executado em uma instância real de Foundry VTT**. Faça backup do mundo antes de importar e execute o teste inicial numa cópia do mundo.

## O que vem no pacote

- **90 entradas de diário**, reunindo **359 páginas** do *Livro do Jogador*, *Livro do Handler*, Bíblia do Cenário, direção visual, dossiês e aventuras.
- **8 operações**, com a Operação 01 (*Linha de Fratura*) desenvolvida integralmente; as Operações 02–08 são dossiês ampliados, não aventuras tão completas quanto o piloto.
- **6 handouts** separados, inicialmente ocultos dos jogadores.
- **12 fichas de NPC** do sistema Delta Green (tipo `npc`), com notas e tokens gráficos. As 5 fichas de NPC do piloto incluem perfis de PV, WP e perícias como texto; seus valores **não são preenchidos automaticamente na estrutura mecânica** do sistema. Os demais NPCs são fichas narrativas sem estatísticas numéricas.
- **5 itens do tipo `gear`**, narrativos e sem modificadores automáticos.
- **6 cenas esquemáticas** da Operação 01, com fundos em WebP, paredes, portas, grade, visão e exploração de neblina. São **plantas esquemáticas**, não mapas artísticos finais; os trajetos e geometrias são sugestivos e devem ser ajustados pelo Handler.
- **6 battle maps artísticos individuais**, em PNG 2×, importados como cenas adicionais (sem paredes automáticas; ajustes de grade e iluminação ficam a cargo do Handler).
- **12 cenas no total**: seis plantas esquemáticas com paredes e seis cenas artísticas.
- **4 macros** de gestão e um painel do Handler, com dois relógios operacionais e mecanismo para revelar handouts.
- Cópias dos livros em PDF na pasta `docs/`.

## Compatibilidade

| Foundry | Delta Green |
|---|---|
| 13 | 1.7.0 |
| 14 | 2.0.1 |

O módulo não depende de Dice So Nice, Dice Tray ou outros complementos. A tradução dos menus próprios está em português; ele **não substitui** nem altera os arquivos de idioma ou fichas do sistema `deltagreen`.

## Instalação manual (ZIP)

1. Crie uma **cópia de segurança do mundo** no Foundry.
2. Para instalar o `module.zip` de uma release manualmente, crie a pasta `Data/modules/arquivo-zero/` em seu **User Data Path** e extraia o conteúdo do ZIP **dentro dela** (o `module.json` está na raiz do ZIP, não em uma subpasta).
3. Confirme a existência do arquivo `Data/modules/arquivo-zero/module.json`. Evite pasta duplicada ou arquivos soltos em `Data/modules/`.
4. Reinicie o servidor Foundry VTT se estiver ligado.
5. Abra um mundo com o sistema **Delta Green** e, em **Gerenciar Módulos**, habilite **Arquivo Zero | Delta Green — Campanha**.
6. Na primeira entrada como GM/Handler, aceite a importação assistida. Ela só ocorre após **confirmação explícita**.
7. Localize os documentos nas abas **Diário**, **Atores**, **Itens**, **Cenas** e **Macros**. Todos os diretórios importados começam por `AZ |`.
8. Abra a **Central de Operações** com `Alt + Shift + Z`, pelo botão de pasta nas ferramentas da cena ou executando a macro `AZ | Painel de operações`.

**Instalação por Manifest URL após a primeira release pública:**

```text
https://github.com/tulioscost/arquivo-zero-delta-green/releases/latest/download/module.json
```

Este endereço **só funcionará depois que a release for publicada com sucesso** pelo GitHub Actions. Veja [PUBLICACAO_GITHUB.md](PUBLICACAO_GITHUB.md).

## Fluxo de jogo e privacidade

- Os diários do **Jogador** e equipamentos têm propriedade padrão `Observer`, para que possam ser lidos pelos jogadores depois da importação.
- Todo o material do **Handler**, NPCs e **evidências** possui propriedade padrão `None` para jogadores. Não arraste conteúdo do Handler para pastas abertas.
- Na macro `AZ | Revelar evidência`, o Handler escolhe qual handout mostrar. A ferramenta altera a permissão do handout escolhido para Observer e publica um link no chat. Essa permissão **permanece** até o Handler a modificar.
- Os dois relógios (Exposição pública 0–4 e Escalada anômala 0–6) ficam armazenados como configuração do mundo e podem ser avançados, recuados ou zerados manualmente. Não modificam SAN, PV ou atributos de personagens.
- As cenas têm neblina de guerra e paredes preparadas, porém a exploração visual depende de tokens com **visão ativada**. A configuração global de luz é neutra e pode ser alterada pelo Handler para o clima da cena.
- Uma segunda importação **só acrescenta documentos faltantes** e não sobrescreve modificações ou notas feitas pelo mestre. Os itens são identificados por flags internas, não pelo nome. Excluir algo do mundo e importar outra vez irá recriá-lo a partir da versão distribuída.

## Organização dos conteúdos

| Abas | Pastas |
|---|---|
| Diário | `AZ | Jogador / Manual do Agente` |
| Diário | `AZ | Handler / Manual e Bíblia`, `Handler / Operações`, `Handler / Referências` |
| Diário | `AZ | Handler / Evidências para revelar` |
| Atores | `AZ | Handler / NPCs` |
| Itens | `AZ | Jogador / Equipamentos` |
| Cenas | `AZ | Handler / Linha de Fratura` |
| Macros | `AZ | Handler / Operações` |

## Resolução de problemas

**O módulo não aparece no Foundry:** confira a pasta raiz e `module.json`, reinicie a instância, confira a versão do Foundry.

**O módulo habilita mas nenhum diário aparece:** entre como GM, pressione `Alt+Shift+Z` e escolha `Importar / completar`. Consulte o console F12 se houver falha.

**Os jogadores estão vendo material indevido:** revise a permissão de cada pasta/diário; o módulo distribui os segredos com `None`, mas permissões alteradas manualmente podem divulgá-los.

**Um mapa está escuro:** ative a visão dos tokens dos personagens; verifique iluminação global e exploração. Um GM poderá sempre editar luzes, portas e paredes.

**Atualizar/instalar via GitHub:** publique uma nova versão e sua tag `vX.Y.Z`. O GitHub Actions empacota e anexa `module.zip` e `module.json` à release; o manifesto estável em `/releases/latest/download/module.json` permite instalar e detectar atualizações. Até a primeira release existir, use a instalação manual.

**Compêndios:** esta edição distribui os documentos por **importação para pastas do mundo**, e não por bancos LevelDB pré-construídos. É um módulo funcional com conteúdo importável; não há pack de compêndio no ZIP. O Handler pode exportar as pastas para compêndios próprios no Foundry.

## Testes incluídos

Execute em um ambiente com Node.js 22 ou superior:

```bash
node tests/smoke.mjs
```

O teste usa um mock de API Foundry e verifica a criação, as permissões, as duplicações e a liberação manual de um handout. **Não substitui testes de interface no Foundry real.**

## Créditos

Conteúdo e direção da campanha: **Arquivo Zero** (projeto original do usuário). Código e estrutura do módulo: adaptação original para Foundry VTT. Delta Green e Foundry VTT são marcas de seus respectivos titulares; este é um trabalho independente, não oficial, sem reprodução das regras oficiais.

## Fonte e releases

A distribuição automatizada usa `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `scripts/validate.mjs` e `scripts/package.py`. Consulte **PUBLICACAO_GITHUB.md** para o roteiro completo e a URL JSON.

## Release automatizada

Depois de obter permissão de escrita e publicar uma tag como `v1.1.0`, o workflow da pasta `.github/workflows/` valida, empacota e anexa os assets `module.json`, `module.zip` e `SHA256SUMS.txt` à release.

- **URL JSON permanente para instalar após publicação:** `https://github.com/tulioscost/arquivo-zero-delta-green/releases/latest/download/module.json`
- **Guia detalhado:** [PUBLICACAO_GITHUB.md](PUBLICACAO_GITHUB.md).
