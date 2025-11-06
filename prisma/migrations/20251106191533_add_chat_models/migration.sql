-- CreateTable
CREATE TABLE `agencia` (
    `id_agencia` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `codigo_agencia` VARCHAR(10) NOT NULL,
    `endereco_id` INTEGER NOT NULL,

    UNIQUE INDEX `codigo_agencia`(`codigo_agencia`),
    INDEX `endereco_id`(`endereco_id`),
    PRIMARY KEY (`id_agencia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditoria_abertura_conta` (
    `id_auditoria` INTEGER NOT NULL AUTO_INCREMENT,
    `id_conta` INTEGER NOT NULL,
    `id_funcionario` INTEGER NULL,
    `data_hora` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `observacao` VARCHAR(200) NULL,

    INDEX `id_conta`(`id_conta`),
    INDEX `id_funcionario`(`id_funcionario`),
    PRIMARY KEY (`id_auditoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente` (
    `id_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `score_credito` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,

    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conta` (
    `id_conta` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_conta` VARCHAR(20) NOT NULL,
    `id_agencia` INTEGER NOT NULL,
    `saldo` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `tipo_conta` ENUM('POUPANCA', 'CORRENTE', 'INVESTIMENTO') NOT NULL,
    `id_cliente` INTEGER NOT NULL,
    `data_abertura` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` ENUM('ATIVA', 'ENCERRADA', 'BLOQUEADA') NOT NULL DEFAULT 'ATIVA',

    UNIQUE INDEX `numero_conta`(`numero_conta`),
    INDEX `id_agencia`(`id_agencia`),
    INDEX `idx_conta_cliente`(`id_cliente`),
    INDEX `idx_conta_numero`(`numero_conta`),
    PRIMARY KEY (`id_conta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conta_corrente` (
    `id_conta_corrente` INTEGER NOT NULL AUTO_INCREMENT,
    `id_conta` INTEGER NOT NULL,
    `limite` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `data_vencimento` DATE NOT NULL,
    `taxa_manutencao` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,

    UNIQUE INDEX `id_conta`(`id_conta`),
    PRIMARY KEY (`id_conta_corrente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conta_investimento` (
    `id_conta_investimento` INTEGER NOT NULL AUTO_INCREMENT,
    `id_conta` INTEGER NOT NULL,
    `perfil_risco` ENUM('BAIXO', 'MEDIO', 'ALTO') NOT NULL,
    `valor_minimo` DECIMAL(15, 2) NOT NULL,
    `taxa_rendimento_base` DECIMAL(5, 2) NOT NULL,

    UNIQUE INDEX `id_conta`(`id_conta`),
    PRIMARY KEY (`id_conta_investimento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conta_poupanca` (
    `id_conta_poupanca` INTEGER NOT NULL AUTO_INCREMENT,
    `id_conta` INTEGER NOT NULL,
    `taxa_rendimento` DECIMAL(5, 2) NOT NULL,
    `ultimo_rendimento` DATETIME(0) NULL,

    UNIQUE INDEX `id_conta`(`id_conta`),
    PRIMARY KEY (`id_conta_poupanca`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `endereco_agencia` (
    `id_endereco_agencia` INTEGER NOT NULL AUTO_INCREMENT,
    `cep` VARCHAR(10) NOT NULL,
    `local` VARCHAR(100) NOT NULL,
    `numero` INTEGER NOT NULL,
    `bairro` VARCHAR(50) NOT NULL,
    `cidade` VARCHAR(50) NOT NULL,
    `estado` CHAR(2) NOT NULL,
    `complemento` VARCHAR(50) NULL,

    PRIMARY KEY (`id_endereco_agencia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `endereco_usuario` (
    `id_endereco` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `cep` VARCHAR(10) NOT NULL,
    `local` VARCHAR(100) NOT NULL,
    `numero_casa` INTEGER NOT NULL,
    `bairro` VARCHAR(50) NOT NULL,
    `cidade` VARCHAR(50) NOT NULL,
    `estado` CHAR(2) NOT NULL,
    `complemento` VARCHAR(50) NULL,

    INDEX `cep`(`cep`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_endereco`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `funcionario` (
    `id_funcionario` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_agencia` INTEGER NOT NULL,
    `codigo_funcionario` VARCHAR(20) NOT NULL,
    `cargo` ENUM('ESTAGIARIO', 'ATENDENTE', 'GERENTE') NOT NULL,
    `id_supervisor` INTEGER NULL,

    UNIQUE INDEX `codigo_funcionario`(`codigo_funcionario`),
    INDEX `id_supervisor`(`id_supervisor`),
    INDEX `id_usuario`(`id_usuario`),
    INDEX `idx_funcionario_agencia`(`id_agencia`),
    PRIMARY KEY (`id_funcionario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historico_encerramento` (
    `id_hist` INTEGER NOT NULL AUTO_INCREMENT,
    `id_conta` INTEGER NOT NULL,
    `motivo` VARCHAR(200) NOT NULL,
    `data_hora` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_conta`(`id_conta`),
    PRIMARY KEY (`id_hist`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relatorio` (
    `id_relatorio` INTEGER NOT NULL AUTO_INCREMENT,
    `id_funcionario` INTEGER NOT NULL,
    `tipo_relatorio` VARCHAR(50) NOT NULL,
    `data_geracao` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `conteudo` JSON NOT NULL,

    INDEX `id_funcionario`(`id_funcionario`),
    PRIMARY KEY (`id_relatorio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transacao` (
    `id_transacao` INTEGER NOT NULL AUTO_INCREMENT,
    `id_conta_origem` INTEGER NULL,
    `id_conta_destino` INTEGER NULL,
    `tipo_transacao` ENUM('DEPOSITO', 'SAQUE', 'TRANSFERENCIA', 'TAXA', 'RENDIMENTO') NOT NULL,
    `valor` DECIMAL(15, 2) NOT NULL,
    `data_hora` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `descricao` VARCHAR(100) NULL,

    INDEX `id_conta_destino`(`id_conta_destino`),
    INDEX `id_conta_origem`(`id_conta_origem`),
    INDEX `idx_tx_data`(`data_hora`),
    INDEX `idx_tx_tipo_data`(`tipo_transacao`, `data_hora`),
    PRIMARY KEY (`id_transacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `cpf` VARCHAR(11) NOT NULL,
    `data_nascimento` DATE NOT NULL,
    `telefone` VARCHAR(15) NOT NULL,
    `tipo_usuario` ENUM('FUNCIONARIO', 'CLIENTE') NOT NULL,
    `senha_hash` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `cpf`(`cpf`),
    INDEX `idx_usuario_cpf`(`cpf`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_session` (
    `id_session` VARCHAR(191) NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `titulo` VARCHAR(200) NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` ENUM('ATIVA', 'ENCERRADA', 'ESCALADA_PARA_ATENDENTE') NOT NULL DEFAULT 'ATIVA',

    INDEX `chat_session_id_usuario_idx`(`id_usuario`),
    INDEX `chat_session_criado_em_idx`(`criado_em`),
    PRIMARY KEY (`id_session`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_message` (
    `id_message` VARCHAR(191) NOT NULL,
    `id_session` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ASSISTANT', 'SYSTEM') NOT NULL,
    `conteudo` TEXT NOT NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `metadados` JSON NULL,

    INDEX `chat_message_id_session_idx`(`id_session`),
    INDEX `chat_message_criado_em_idx`(`criado_em`),
    PRIMARY KEY (`id_message`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `agencia` ADD CONSTRAINT `agencia_ibfk_1` FOREIGN KEY (`endereco_id`) REFERENCES `endereco_agencia`(`id_endereco_agencia`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `auditoria_abertura_conta` ADD CONSTRAINT `auditoria_abertura_conta_ibfk_1` FOREIGN KEY (`id_conta`) REFERENCES `conta`(`id_conta`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `auditoria_abertura_conta` ADD CONSTRAINT `auditoria_abertura_conta_ibfk_2` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario`(`id_funcionario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cliente` ADD CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `conta` ADD CONSTRAINT `conta_ibfk_1` FOREIGN KEY (`id_agencia`) REFERENCES `agencia`(`id_agencia`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `conta` ADD CONSTRAINT `conta_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id_cliente`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `conta_corrente` ADD CONSTRAINT `conta_corrente_ibfk_1` FOREIGN KEY (`id_conta`) REFERENCES `conta`(`id_conta`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `conta_investimento` ADD CONSTRAINT `conta_investimento_ibfk_1` FOREIGN KEY (`id_conta`) REFERENCES `conta`(`id_conta`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `conta_poupanca` ADD CONSTRAINT `conta_poupanca_ibfk_1` FOREIGN KEY (`id_conta`) REFERENCES `conta`(`id_conta`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `endereco_usuario` ADD CONSTRAINT `endereco_usuario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `funcionario` ADD CONSTRAINT `funcionario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `funcionario` ADD CONSTRAINT `funcionario_ibfk_2` FOREIGN KEY (`id_agencia`) REFERENCES `agencia`(`id_agencia`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `funcionario` ADD CONSTRAINT `funcionario_ibfk_3` FOREIGN KEY (`id_supervisor`) REFERENCES `funcionario`(`id_funcionario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `historico_encerramento` ADD CONSTRAINT `historico_encerramento_ibfk_1` FOREIGN KEY (`id_conta`) REFERENCES `conta`(`id_conta`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `relatorio` ADD CONSTRAINT `relatorio_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario`(`id_funcionario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transacao` ADD CONSTRAINT `transacao_ibfk_1` FOREIGN KEY (`id_conta_origem`) REFERENCES `conta`(`id_conta`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transacao` ADD CONSTRAINT `transacao_ibfk_2` FOREIGN KEY (`id_conta_destino`) REFERENCES `conta`(`id_conta`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_session` ADD CONSTRAINT `chat_session_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_message` ADD CONSTRAINT `chat_message_id_session_fkey` FOREIGN KEY (`id_session`) REFERENCES `chat_session`(`id_session`) ON DELETE CASCADE ON UPDATE CASCADE;
