# TRES Arquitetura v1.0

## 1. Nome do sistema
TRES

O nome TRES representa os três módulos iniciais do sistema:
- Solicitação de Cadastro de Hotéis
- Lançamento de Valores a Pagar
- Solicitação de Reembolso

## 2. Objetivo
Centralizar processos operacionais da AD Turismo em uma plataforma web com login, banco de dados, rastreabilidade, filtros, conclusão em massa, histórico e controle de permissões.

## 3. Perfis de acesso
### Usuário
- Criar solicitações e lançamentos.
- Visualizar solicitações conforme regra do módulo.
- Alterar a própria senha.

### Administrador
- Tudo que o usuário faz.
- Visualizar todos os registros quando permitido.
- Preencher campos administrativos, como código de integração e câmbio.
- Concluir registros individualmente ou em massa.
- Excluir solicitações quando permitido.

### Master
- Tudo que o administrador faz.
- Editar usuários e papéis.
- Reabrir registros concluídos.
- Editar informações já lançadas.
- Acessar configurações, auditoria e dashboard gerencial.

## 4. Login
- Login por e-mail e senha usando Supabase Auth.
- Troca obrigatória de senha no primeiro acesso.
- Tela Minha Conta para alteração de senha.
- Sessão persistente enquanto o usuário estiver autenticado.

## 5. Layout e identidade visual
- Estilo corporativo, limpo e moderno.
- Sem emojis dentro do sistema.
- Ícones minimalistas no estilo Lucide Icons.
- Menu lateral recolhível.
- Fundo principal azul-marinho quase preto.
- Cards brancos com cantos arredondados.
- Módulos com cores de apoio:
  - Hotéis: turquesa
  - Valores a pagar: vermelho
  - Reembolso: amarelo

## 6. Módulo Cadastro de Hotéis
### Campos de criação
- Data de hoje, preenchida automaticamente.
- Emissor, preenchido automaticamente pelo login.
- Nome do hotel.
- Rua e número.
- Bairro.
- Cidade/Estado.
- País.
- Tipo: Nacional ou Internacional.
- CNPJ obrigatório somente para Nacional.

### Status
- Pendente: nasce automaticamente ao criar.
- Concluído: usado após finalizar o cadastro.
- Já cadastrado: usado quando já existe cadastro duplicado.

### Regras críticas
- CNPJ nacional é obrigatório.
- CNPJ nacional é único no banco.
- CNPJ será salvo sem máscara.
- CNPJ será exibido com máscara.
- Ao digitar CNPJ, o sistema valida duplicidade antes de salvar.
- Ao duplicar uma solicitação, o CNPJ não será copiado.
- Hotel internacional não usa CNPJ.
- Hotel internacional terá alerta de possível duplicidade por nome + cidade + país.

### Campos administrativos
- Código de integração.
- Responsável.
- Status.
- Data de conclusão.
- Concluído por.

### Ações
- Criar.
- Visualizar.
- Editar, conforme perfil.
- Duplicar.
- Concluir.
- Concluir em massa.
- Reabrir, apenas Master.
- Excluir, Admin/Master.

## 7. Módulo Valores a Pagar
### Campos gerais
- Data de hoje automática.
- Emissor automático.
- Tipo: Nacional ou Internacional.
- OS.
- Cliente.
- Serviço: Aéreo, Hotel, Seguro Viagem, Locação, Transfer, Outros.

### Aéreo
- Consolidador: Flytour, Rextur, Chanteclair, AD Turismo, Globalis, Diversa.
- Se não for Chanteclair: tarifa, taxa de embarque, RC e total automático em reais.
- Se for Chanteclair: tarifa USD, taxa USD, over %, câmbio administrativo e total final calculado.
- Botões Assento e Bagagem Extra alteram a classificação dentro do grupo aéreo.

### Outros serviços
- Fornecedor.
- Diária em reais.
- Taxas/impostos em reais ou percentual.
- Check-in.
- Check-out.
- Quantidade de diárias calculada automaticamente.
- Total automático.

### Status e ações
- Status: Pendente e Concluído.
- Conclusão individual e em massa.
- Reabertura pelo Master.
- Duplicar.
- Histórico e auditoria.

## 8. Módulo Reembolso
### Campos
- Data de hoje automática.
- Emissor automático.
- Cliente.
- OS.
- Fornecedor.
- Valor total cobrado.
- Valor total a ser reembolsado.
- Taxa ADM: 3,5% sobre o valor a ser reembolsado.
- Valor final reembolso: valor a reembolsar menos taxa ADM.

### Filtros
- Período por data inicial e data final.
- Cliente.
- Emissor.
- Fornecedor.
- OS.
- Status.

### Ações
- Criar.
- Visualizar.
- Duplicar.
- Concluir.
- Concluir em massa.
- Reabrir, apenas Master.
- Exportar para Excel/CSV.

## 9. Funcionalidades globais
- Pesquisa global por OS, cliente, fornecedor, hotel, CNPJ e código TRES.
- Central de pendências.
- Histórico/timeline em todos os módulos.
- Comentários internos.
- Duplicação de registros.
- Registros nunca são apagados fisicamente, salvo exceção técnica. Usaremos exclusão lógica.
- Registro de quem criou, alterou, concluiu e reabriu.

## 10. Roadmap
### Sprint 1
- Estrutura do projeto.
- Login.
- Conexão Supabase.
- Layout base.
- Dashboard inicial.

### Sprint 2
- Cadastro de hotéis.

### Sprint 3
- Valores a pagar.

### Sprint 4
- Reembolso.

### Sprint 5
- Administração e usuários.

### Sprint 6
- Dashboard gerencial, auditoria e melhorias.
