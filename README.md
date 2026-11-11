# QTS Inteligente - Plano de Aulas, Rodízio & Gestão de Instrutores

Aplicação Web & **PWA (Progressive Web App)** completa, responsiva e adaptável para celulares e computadores, desenhada para gestão eficiente de planos de aulas (QTS), rodízio inteligente de matérias e acompanhamento de instrutores com integração ao **Google Sheets**.

---

## 🚀 Principais Funcionalidades

1. **Cadastros Completos**:
   - **Turmas**: Cadastro com nome, sigla, cores personalizadas e turno padrão.
   - **Matérias**: Cadastro de disciplinas com cor, sigla e meta de encontros (carga dias objetivo).
   - **Instrutores**: Cadastro com contato, observações e definição de **matérias com conhecimento pertinente (aptidão)**.
     - *Regra implementada:* O instrutor pode ser vinculado para lecionar **qualquer matéria**, mesmo aquelas não cadastradas em seu perfil (com destaque visual `⭐ Apto` quando houver especialização).

2. **Calendário Bonito & Interativo**:
   - Visualização por **Mês** e **Lista (Agenda)** com navegação cronológica e destaque para a data de hoje.
   - Clique em qualquer dia ou aula para visualizar detalhes, editar ou excluir.
   - Filtros instantâneos por **Turma**, **Matéria**, **Instrutor** e **Status**.
   - **Exclusão em Massa (Seleção Múltipla)**: Botão de seleção múltipla com checkboxes para marcar e deletar várias aulas de uma só vez.

3. **Gerador Inteligente de Períodos & Rodízio de Matérias**:
   - Como o cronograma não pode ser previsto para o ano ou mês inteiro, permite gerar blocos de datas (ex: de data X até data Y).
   - Filtro por dias úteis da semana (Segunda a Sexta, Sábado, etc.) e opção de pular dias já preenchidos.
   - **Estratégias de Rodízio**:
     - *Rodízio Inteligente*: prioriza matérias que tiveram menor frequência de aulas no histórico da turma.
     - *Sequencial Cíclico*: distribuição sequencial das matérias selecionadas.
     - *Aleatório Balanceado*.
   - **Alocação de Instrutores**: seleciona preferencialmente instrutores aptos, balanceando os dias entre eles.
   - **Tabela de Prévia Interativa**: permite ajustar matérias ou instrutores inline antes de salvar no calendário.

4. **Tratamento Inteligente de Prejuízo & Remanejamento**:
   - Quando ocorre um imprevisto (chuva, falta de energia, ausência, manutenção), a aula pode ser marcada como **Prejudicada**.
   - Fluxo inteligente:
     1. **Remanejar**: Escolha uma nova data de reposição; o sistema marca a aula original com aviso visual ⚠️ `Prejudicada (Remanejada)` e cria a nova aula no dia indicado vinculada à original.
     2. **Pular / Cancelar**: Mantém a aula no histórico marcada com o motivo do prejuízo para prestação de contas e relatórios.

5. **Painel de Métricas & Gráficos**:
   - Gráficos interativos com **Recharts**:
     - **Matérias Mais Aplicadas**: Ranking e gráfico de barras com total de encontros por disciplina.
     - **Parametrização de Instrutores por Dia Aplicado**: Contabilização estrita por **dias de aula dados** (não por hora aula).
     - **Taxa de Status**: Proporção entre aulas Realizadas, Agendadas e Prejudicadas.
     - Histórico de prejuízos e justificativas operacionais.

6. **Banco de Dados Google Sheets & PWA**:
   - Sincronização direta com **Planilha Online do Google** através de Google Apps Script (Web App).
   - Código do Apps Script pronto para copiar com 1 clique direto no painel de configurações.
   - Funciona 100% offline ou em modo local caso a planilha ainda não tenha sido configurada.
   - Suporte a Backup (Exportar/Importar JSON).
   - **PWA Instalável**: Banner automático para instalar no Android (Chrome) ou iOS (Safari) em tela cheia.

7. **Controle de Acesso Simples (Logins)**:
   - **Consulta Pública**: Qualquer pessoa pode visualizar o calendário e o cronograma livremente sem login.
   - **Gestor / Administrador**: Login simples via PIN/Senha (`1234` ou `admin`) ou botão de 1 clique para liberar criação, edição e exclusão.

---

## 🛠️ Como Executar Localmente

```bash
# 1. Instalar dependências (já instaladas)
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Compilar para produção
npm run build
```

---

## 📊 Como Configurar a Planilha Google como Banco de Dados

1. Abra uma nova planilha no seu [Google Drive / Sheets](https://sheets.new).
2. No menu superior da planilha, clique em **Extensões** > **Apps Script**.
3. Abra a aba **Ajustes** (ícone de engrenagem) dentro do aplicativo QTS e clique no botão **"Copiar Código Google Script"**.
4. Cole o código copiado no editor do Apps Script e clique em Salvar.
5. Clique em **Implantar** (Deploy) > **Nova Implantação** (New deployment).
6. Selecione o tipo **App da Web** (Web app).
   - *Executar como*: **Eu**
   - *Quem pode acessar*: **Qualquer pessoa**
7. Copie a **URL do App da Web** gerada e cole nas Configurações do seu app QTS!
