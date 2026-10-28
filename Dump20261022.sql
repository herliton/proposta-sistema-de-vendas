-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: sva_db
-- ------------------------------------------------------
-- Server version	8.0.16

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `anexos_privados`
--

DROP TABLE IF EXISTS `anexos_privados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anexos_privados` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `cliente_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `negocio_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `categoria` enum('PESSOAL','FINANCEIRO','CONTRATUAL','OUTRO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `chave_armazenamento` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_mime` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tamanho_bytes` bigint(20) unsigned NOT NULL,
  `sha256` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `versao` int(10) unsigned NOT NULL DEFAULT '1',
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `excluido_em` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_anexo_cliente` (`organizacao_id`,`loja_id`,`cliente_id`),
  KEY `fk_anexo_negocio` (`organizacao_id`,`loja_id`,`negocio_id`,`cliente_id`),
  KEY `fk_anexo_usuario` (`organizacao_id`,`loja_id`,`usuario_id`),
  CONSTRAINT `fk_anexo_cliente` FOREIGN KEY (`organizacao_id`, `loja_id`, `cliente_id`) REFERENCES `clientes` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_anexo_negocio` FOREIGN KEY (`organizacao_id`, `loja_id`, `negocio_id`, `cliente_id`) REFERENCES `negocios` (`organizacao_id`, `loja_id`, `id`, `cliente_id`),
  CONSTRAINT `fk_anexo_usuario` FOREIGN KEY (`organizacao_id`, `loja_id`, `usuario_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `ck_anexo_tamanho` CHECK (((`tamanho_bytes` > 0) and (`versao` > 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_anexos_privados_insert` AFTER INSERT ON `anexos_privados` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'anexos_privados', NEW.id, NULL, JSON_OBJECT('cliente_id', NEW.cliente_id, 'negocio_id', NEW.negocio_id, 'usuario_id', NEW.usuario_id, 'categoria', NEW.categoria, 'versao', NEW.versao, 'excluido_em', NEW.excluido_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_anexos_privados_update` AFTER UPDATE ON `anexos_privados` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.cliente_id <=> NEW.cliente_id) OR NOT (OLD.negocio_id <=> NEW.negocio_id) OR NOT (OLD.usuario_id <=> NEW.usuario_id) OR NOT (OLD.categoria <=> NEW.categoria) OR NOT (OLD.chave_armazenamento <=> NEW.chave_armazenamento) OR NOT (OLD.tipo_mime <=> NEW.tipo_mime) OR NOT (OLD.tamanho_bytes <=> NEW.tamanho_bytes) OR NOT (OLD.sha256 <=> NEW.sha256) OR NOT (OLD.versao <=> NEW.versao) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.excluido_em <=> NEW.excluido_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'anexos_privados', NEW.id, JSON_OBJECT('cliente_id', OLD.cliente_id, 'negocio_id', OLD.negocio_id, 'usuario_id', OLD.usuario_id, 'categoria', OLD.categoria, 'versao', OLD.versao, 'excluido_em', OLD.excluido_em), JSON_OBJECT('cliente_id', NEW.cliente_id, 'negocio_id', NEW.negocio_id, 'usuario_id', NEW.usuario_id, 'categoria', NEW.categoria, 'versao', NEW.versao, 'excluido_em', NEW.excluido_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.cliente_id <=> NEW.cliente_id, JSON_ARRAY(), JSON_ARRAY('cliente_id')), IF(OLD.negocio_id <=> NEW.negocio_id, JSON_ARRAY(), JSON_ARRAY('negocio_id')), IF(OLD.usuario_id <=> NEW.usuario_id, JSON_ARRAY(), JSON_ARRAY('usuario_id')), IF(OLD.categoria <=> NEW.categoria, JSON_ARRAY(), JSON_ARRAY('categoria')), IF(OLD.chave_armazenamento <=> NEW.chave_armazenamento, JSON_ARRAY(), JSON_ARRAY('chave_armazenamento')), IF(OLD.tipo_mime <=> NEW.tipo_mime, JSON_ARRAY(), JSON_ARRAY('tipo_mime')), IF(OLD.tamanho_bytes <=> NEW.tamanho_bytes, JSON_ARRAY(), JSON_ARRAY('tamanho_bytes')), IF(OLD.sha256 <=> NEW.sha256, JSON_ARRAY(), JSON_ARRAY('sha256')), IF(OLD.versao <=> NEW.versao, JSON_ARRAY(), JSON_ARRAY('versao')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.excluido_em <=> NEW.excluido_em, JSON_ARRAY(), JSON_ARRAY('excluido_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_anexos_privados_delete` AFTER DELETE ON `anexos_privados` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'anexos_privados', OLD.id, JSON_OBJECT('cliente_id', OLD.cliente_id, 'negocio_id', OLD.negocio_id, 'usuario_id', OLD.usuario_id, 'categoria', OLD.categoria, 'versao', OLD.versao, 'excluido_em', OLD.excluido_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `aprovacoes_negocio`
--

DROP TABLE IF EXISTS `aprovacoes_negocio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aprovacoes_negocio` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `negocio_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `etapa` enum('CREDITO','EXCECAO_PRECO','CONTRATO','CANCELAMENTO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `decisao` enum('APROVADO','RECUSADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_aprovacoes_negocio` (`organizacao_id`,`loja_id`,`negocio_id`,`etapa`,`criado_em`),
  KEY `fk_aprovacoes_usuario` (`organizacao_id`,`loja_id`,`usuario_id`),
  CONSTRAINT `fk_aprovacoes_negocio` FOREIGN KEY (`organizacao_id`, `loja_id`, `negocio_id`) REFERENCES `negocios` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_aprovacoes_usuario` FOREIGN KEY (`organizacao_id`, `loja_id`, `usuario_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_aprovacoes_negocio_insert` AFTER INSERT ON `aprovacoes_negocio` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'aprovacoes_negocio', NEW.id, NULL, JSON_OBJECT('negocio_id', NEW.negocio_id, 'usuario_id', NEW.usuario_id, 'etapa', NEW.etapa, 'decisao', NEW.decisao), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_aprovacoes_negocio_update` BEFORE UPDATE ON `aprovacoes_negocio` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Historico imutavel';
END */;;
DELIMITER ;
/*!50003 SET sql_mod/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_lojas_insert` AFTER INSERT ON `lojas` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.id, 'INSERIR', 'lojas', NEW.id, NULL, JSON_OBJECT('ativo', NEW.ativo, 'excluido_em', NEW.excluido_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_lojas_update` AFTER UPDATE ON `lojas` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.codigo <=> NEW.codigo) OR NOT (OLD.nome <=> NEW.nome) OR NOT (OLD.cnpj <=> NEW.cnpj) OR NOT (OLD.telefone <=> NEW.telefone) OR NOT (OLD.email <=> NEW.email) OR NOT (OLD.cep <=> NEW.cep) OR NOT (OLD.logradouro <=> NEW.logradouro) OR NOT (OLD.numero <=> NEW.numero) OR NOT (OLD.complemento <=> NEW.complemento) OR NOT (OLD.bairro <=> NEW.bairro) OR NOT (OLD.cidade <=> NEW.cidade) OR NOT (OLD.estado <=> NEW.estado) OR NOT (OLD.fuso_horario <=> NEW.fuso_horario) OR NOT (OLD.ativo <=> NEW.ativo) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) OR NOT (OLD.excluido_em <=> NEW.excluido_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.id, 'ALTERAR', 'lojas', NEW.id, JSON_OBJECT('ativo', OLD.ativo, 'excluido_em', OLD.excluido_em), JSON_OBJECT('ativo', NEW.ativo, 'excluido_em', NEW.excluido_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.codigo <=> NEW.codigo, JSON_ARRAY(), JSON_ARRAY('codigo')), IF(OLD.nome <=> NEW.nome, JSON_ARRAY(), JSON_ARRAY('nome')), IF(OLD.cnpj <=> NEW.cnpj, JSON_ARRAY(), JSON_ARRAY('cnpj')), IF(OLD.telefone <=> NEW.telefone, JSON_ARRAY(), JSON_ARRAY('telefone')), IF(OLD.email <=> NEW.email, JSON_ARRAY(), JSON_ARRAY('email')), IF(OLD.cep <=> NEW.cep, JSON_ARRAY(), JSON_ARRAY('cep')), IF(OLD.logradouro <=> NEW.logradouro, JSON_ARRAY(), JSON_ARRAY('logradouro')), IF(OLD.numero <=> NEW.numero, JSON_ARRAY(), JSON_ARRAY('numero')), IF(OLD.complemento <=> NEW.complemento, JSON_ARRAY(), JSON_ARRAY('complemento')), IF(OLD.bairro <=> NEW.bairro, JSON_ARRAY(), JSON_ARRAY('bairro')), IF(OLD.cidade <=> NEW.cidade, JSON_ARRAY(), JSON_ARRAY('cidade')), IF(OLD.estado <=> NEW.estado, JSON_ARRAY(), JSON_ARRAY('estado')), IF(OLD.fuso_horario <=> NEW.fuso_horario, JSON_ARRAY(), JSON_ARRAY('fuso_horario')), IF(OLD.ativo <=> NEW.ativo, JSON_ARRAY(), JSON_ARRAY('ativo')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em')), IF(OLD.excluido_em <=> NEW.excluido_em, JSON_ARRAY(), JSON_ARRAY('excluido_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_lojas_delete` AFTER DELETE ON `lojas` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.id, 'EXCLUIR', 'lojas', OLD.id, JSON_OBJECT('ativo', OLD.ativo, 'excluido_em', OLD.excluido_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `modulos_sistema`
--
e              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_aprovacoes_negocio_update` AFTER UPDATE ON `aprovacoes_negocio` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.negocio_id <=> NEW.negocio_id) OR NOT (OLD.usuario_id <=> NEW.usuario_id) OR NOT (OLD.etapa <=> NEW.etapa) OR NOT (OLD.decisao <=> NEW.decisao) OR NOT (OLD.observacoes <=> NEW.observacoes) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'aprovacoes_negocio', NEW.id, JSON_OBJECT('negocio_id', OLD.negocio_id, 'usuario_id', OLD.usuario_id, 'etapa', OLD.etapa, 'decisao', OLD.decisao), JSON_OBJECT('negocio_id', NEW.negocio_id, 'usuario_id', NEW.usuario_id, 'etapa', NEW.etapa, 'decisao', NEW.decisao), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.negocio_id <=> NEW.negocio_id, JSON_ARRAY(), JSON_ARRAY('negocio_id')), IF(OLD.usuario_id <=> NEW.usuario_id, JSON_ARRAY(), JSON_ARRAY('usuario_id')), IF(OLD.etapa <=> NEW.etapa, JSON_ARRAY(), JSON_ARRAY('etapa')), IF(OLD.decisao <=> NEW.decisao, JSON_ARRAY(), JSON_ARRAY('decisao')), IF(OLD.observacoes <=> NEW.observacoes, JSON_ARRAY(), JSON_ARRAY('observacoes')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_aprovacoes_negocio_delete` BEFORE DELETE ON `aprovacoes_negocio` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_aprovacoes_negocio_delete` AFTER DELETE ON `aprovacoes_negocio` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'aprovacoes_negocio', OLD.id, JSON_OBJECT('negocio_id', OLD.negocio_id, 'usuario_id', OLD.usuario_id, 'etapa', OLD.etapa, 'decisao', OLD.decisao), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `atendimentos_credito`
--

DROP TABLE IF EXISTS `atendimentos_credito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atendimentos_credito` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `cliente_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `negocio_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `responsavel_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `status` enum('ABERTO','EM_ANDAMENTO','AGUARDANDO_CLIENTE','CONCLUIDO','CANCELADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ABERTO',
  `prazo_em` datetime(3) DEFAULT NULL,
  `concluido_em` datetime(3) DEFAULT NULL,
  `resultado` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_atendimento_escopo` (`organizacao_id`,`loja_id`,`id`),
  UNIQUE KEY `uq_atendimento_negocio` (`organizacao_id`,`loja_id`,`negocio_id`),
  KEY `fk_atendimento_negocio` (`organizacao_id`,`loja_id`,`negocio_id`,`cliente_id`),
  KEY `fk_atendimento_responsavel` (`organizacao_id`,`loja_id`,`responsavel_id`),
  CONSTRAINT `fk_atendimento_negocio` FOREIGN KEY (`organizacao_id`, `loja_id`, `negocio_id`, `cliente_id`) REFERENCES `negocios` (`organizacao_id`, `loja_id`, `id`, `cliente_id`),
  CONSTRAINT `fk_atendimento_responsavel` FOREIGN KEY (`organizacao_id`, `loja_id`, `responsavel_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `ck_atendimento_conclusao` CHECK (((`status` <> _utf8mb4'CONCLUIDO') or ((`concluido_em` is not null) and (`resultado` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_atendimento_tipo` BEFORE INSERT ON `atendimentos_credito` FOR EACH ROW BEGIN
  IF NEW.status <> 'ABERTO' OR NOT EXISTS (SELECT 1 FROM negocios WHERE id = NEW.negocio_id
    AND tipo = 'CONSULTORIA_CREDITO' AND status = 'CONTRATO_EFETIVADO') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Atendimento exige consultoria efetivada e estado ABERTO';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_atendimentos_credito_insert` AFTER INSERT ON `atendimentos_credito` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'atendimentos_credito', NEW.id, NULL, JSON_OBJECT('cliente_id', NEW.cliente_id, 'negocio_id', NEW.negocio_id, 'responsavel_id', NEW.responsavel_id, 'status', NEW.status, 'concluido_em', NEW.concluido_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_atendimento_transicao` BEFORE UPDATE ON `atendimentos_credito` FOR EACH ROW BEGIN
  CALL validar_transicao('ATENDIMENTO', OLD.status, NEW.status);
  IF NEW.negocio_id <> OLD.negocio_id OR NEW.cliente_id <> OLD.cliente_id OR NEW.organizacao_id <> OLD.organizacao_id OR NEW.loja_id <> OLD.loja_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Identidade do atendimento e imutavel';
  END IF;
  IF NEW.status = 'CONCLUIDO' AND EXISTS (SELECT 1 FROM tarefas_atendimento WHERE atendimento_id = NEW.id AND status NOT IN ('CONCLUIDA','CANCELADA')) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Concluir ou cancelar tarefas antes de concluir atendimento';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_atendimentos_credito_update` AFTER UPDATE ON `atendimentos_credito` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.cliente_id <=> NEW.cliente_id) OR NOT (OLD.negocio_id <=> NEW.negocio_id) OR NOT (OLD.responsavel_id <=> NEW.responsavel_id) OR NOT (OLD.status <=> NEW.status) OR NOT (OLD.prazo_em <=> NEW.prazo_em) OR NOT (OLD.concluido_em <=> NEW.concluido_em) OR NOT (OLD.resultado <=> NEW.resultado) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'atendimentos_credito', NEW.id, JSON_OBJECT('cliente_id', OLD.cliente_id, 'negocio_id', OLD.negocio_id, 'responsavel_id', OLD.responsavel_id, 'status', OLD.status, 'concluido_em', OLD.concluido_em), JSON_OBJECT('cliente_id', NEW.cliente_id, 'negocio_id', NEW.negocio_id, 'responsavel_id', NEW.responsavel_id, 'status', NEW.status, 'concluido_em', NEW.concluido_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.cliente_id <=> NEW.cliente_id, JSON_ARRAY(), JSON_ARRAY('cliente_id')), IF(OLD.negocio_id <=> NEW.negocio_id, JSON_ARRAY(), JSON_ARRAY('negocio_id')), IF(OLD.responsavel_id <=> NEW.responsavel_id, JSON_ARRAY(), JSON_ARRAY('responsavel_id')), IF(OLD.status <=> NEW.status, JSON_ARRAY(), JSON_ARRAY('status')), IF(OLD.prazo_em <=> NEW.prazo_em, JSON_ARRAY(), JSON_ARRAY('prazo_em')), IF(OLD.concluido_em <=> NEW.concluido_em, JSON_ARRAY(), JSON_ARRAY('concluido_em')), IF(OLD.resultado <=> NEW.resultado, JSON_ARRAY(), JSON_ARRAY('resultado')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_atendimentos_credito_delete` BEFORE DELETE ON `atendimentos_credito` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_atendimentos_credito_delete` AFTER DELETE ON `atendimentos_credito` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'atendimentos_credito', OLD.id, JSON_OBJECT('cliente_id', OLD.cliente_id, 'negocio_id', OLD.negocio_id, 'responsavel_id', OLD.responsavel_id, 'status', OLD.status, 'concluido_em', OLD.concluido_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `baixas_financeiras`
--

DROP TABLE IF EXISTS `baixas_financeiras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `baixas_financeiras` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `lancamento_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `chave_idempotencia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(12,2) NOT NULL,
  `baixado_em` datetime(3) NOT NULL,
  `meio_pagamento` enum('PIX','TRANSFERENCIA_BANCARIA','DINHEIRO','CARTAO','OUTRO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `referencia_pagamento` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estornado_em` datetime(3) DEFAULT NULL,
  `estornado_por_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `motivo_estorno` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_baixa_solicitacao` (`organizacao_id`,`loja_id`,`chave_idempotencia`),
  KEY `idx_baixas_lancamento` (`organizacao_id`,`loja_id`,`lancamento_id`,`baixado_em`),
  KEY `fk_baixas_usuario` (`organizacao_id`,`loja_id`,`usuario_id`),
  KEY `fk_baixas_estornador` (`organizacao_id`,`loja_id`,`estornado_por_id`),
  CONSTRAINT `fk_baixas_estornador` FOREIGN KEY (`organizacao_id`, `loja_id`, `estornado_por_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `fk_baixas_lancamento` FOREIGN KEY (`organizacao_id`, `loja_id`, `lancamento_id`) REFERENCES `lancamentos_financeiros` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_baixas_usuario` FOREIGN KEY (`organizacao_id`, `loja_id`, `usuario_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `ck_baixa_estorno` CHECK ((isnull(`estornado_em`) or (`motivo_estorno` is not null))),
  CONSTRAINT `ck_baixa_valor` CHECK ((`valor` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_baixas_saldo` BEFORE INSERT ON `baixas_financeiras` FOR EACH ROW BEGIN
  IF NEW.estornado_em IS NOT NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nova baixa nao pode iniciar estornada'; END IF;
  UPDATE lancamentos_financeiros SET valor_baixado = valor_baixado + NEW.valor,
    status = IF(valor_baixado = valor,'BAIXADO','BAIXADO_PARCIALMENTE')
    WHERE organizacao_id = NEW.organizacao_id AND loja_id = NEW.loja_id AND id = NEW.lancamento_id
      AND status IN ('PENDENTE','BAIXADO_PARCIALMENTE') AND valor_baixado + NEW.valor <= valor;
  IF ROW_COUNT() <> 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Titulo indisponivel ou baixa acima do saldo'; END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_baixas_financeiras_insert` AFTER INSERT ON `baixas_financeiras` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'baixas_financeiras', NEW.id, NULL, JSON_OBJECT('usuario_id', NEW.usuario_id, 'valor', NEW.valor, 'estornado_em', NEW.estornado_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_baixas_estorno` BEFORE UPDATE ON `baixas_financeiras` FOR EACH ROW BEGIN
  IF NEW.organizacao_id <> OLD.organizacao_id OR NEW.loja_id <> OLD.loja_id OR NEW.lancamento_id <> OLD.lancamento_id
    OR NEW.valor <> OLD.valor OR NEW.usuario_id <> OLD.usuario_id OR NEW.chave_idempotencia <> OLD.chave_idempotencia
    OR NEW.baixado_em <> OLD.baixado_em OR NEW.meio_pagamento <> OLD.meio_pagamento OR NEW.referencia_pagamento <> OLD.referencia_pagamento THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Identidade e valor da baixa sao imutaveis';
  END IF;
  IF OLD.estornado_em IS NOT NULL AND (NOT (OLD.estornado_em <=> NEW.estornado_em) OR NOT (OLD.estornado_por_id <=> NEW.estornado_por_id)
    OR NOT (OLD.motivo_estorno <=> NEW.motivo_estorno)) THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estorno nao pode ser desfeito'; END IF;
  IF OLD.estornado_em IS NULL AND NEW.estornado_em IS NOT NULL THEN
    IF NEW.estornado_por_id IS NULL OR NEW.motivo_estorno IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estorno exige autor e motivo'; END IF;
    UPDATE lancamentos_financeiros SET valor_baixado = valor_baixado - OLD.valor,
      status = IF(valor_baixado = 0,'PENDENTE','BAIXADO_PARCIALMENTE') WHERE id = OLD.lancamento_id;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_baixas_financeiras_update` AFTER UPDATE ON `baixas_financeiras` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.lancamento_id <=> NEW.lancamento_id) OR NOT (OLD.usuario_id <=> NEW.usuario_id) OR NOT (OLD.chave_idempotencia <=> NEW.chave_idempotencia) OR NOT (OLD.valor <=> NEW.valor) OR NOT (OLD.baixado_em <=> NEW.baixado_em) OR NOT (OLD.meio_pagamento <=> NEW.meio_pagamento) OR NOT (OLD.referencia_pagamento <=> NEW.referencia_pagamento) OR NOT (OLD.estornado_em <=> NEW.estornado_em) OR NOT (OLD.estornado_por_id <=> NEW.estornado_por_id) OR NOT (OLD.motivo_estorno <=> NEW.motivo_estorno) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'baixas_financeiras', NEW.id, JSON_OBJECT('usuario_id', OLD.usuario_id, 'valor', OLD.valor, 'estornado_em', OLD.estornado_em), JSON_OBJECT('usuario_id', NEW.usuario_id, 'valor', NEW.valor, 'estornado_em', NEW.estornado_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.lancamento_id <=> NEW.lancamento_id, JSON_ARRAY(), JSON_ARRAY('lancamento_id')), IF(OLD.usuario_id <=> NEW.usuario_id, JSON_ARRAY(), JSON_ARRAY('usuario_id')), IF(OLD.chave_idempotencia <=> NEW.chave_idempotencia, JSON_ARRAY(), JSON_ARRAY('chave_idempotencia')), IF(OLD.valor <=> NEW.valor, JSON_ARRAY(), JSON_ARRAY('valor')), IF(OLD.baixado_em <=> NEW.baixado_em, JSON_ARRAY(), JSON_ARRAY('baixado_em')), IF(OLD.meio_pagamento <=> NEW.meio_pagamento, JSON_ARRAY(), JSON_ARRAY('meio_pagamento')), IF(OLD.referencia_pagamento <=> NEW.referencia_pagamento, JSON_ARRAY(), JSON_ARRAY('referencia_pagamento')), IF(OLD.estornado_em <=> NEW.estornado_em, JSON_ARRAY(), JSON_ARRAY('estornado_em')), IF(OLD.estornado_por_id <=> NEW.estornado_por_id, JSON_ARRAY(), JSON_ARRAY('estornado_por_id')), IF(OLD.motivo_estorno <=> NEW.motivo_estorno, JSON_ARRAY(), JSON_ARRAY('motivo_estorno')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_baixas_financeiras_delete` BEFORE DELETE ON `baixas_financeiras` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_baixas_financeiras_delete` AFTER DELETE ON `baixas_financeiras` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'baixas_financeiras', OLD.id, JSON_OBJECT('usuario_id', OLD.usuario_id, 'valor', OLD.valor, 'estornado_em', OLD.estornado_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `tipo` enum('PF','PJ') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PF',
  `nome_completo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cpf` char(11) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `razao_social` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nome_fantasia` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cnpj` char(14) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `pessoa_contato` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cep` char(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logradouro` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `complemento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bairro` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cidade` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendedor_atual_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `excluido_em` datetime(3) DEFAULT NULL,
  `ocupacao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `renda_mensal` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_clientes_escopo` (`organizacao_id`,`loja_id`,`id`),
  UNIQUE KEY `uq_clientes_cpf` (`organizacao_id`,`loja_id`,`cpf`),
  UNIQUE KEY `uq_clientes_cnpj` (`organizacao_id`,`loja_id`,`cnpj`),
  KEY `idx_clientes_nome` (`organizacao_id`,`loja_id`,`nome_completo`),
  KEY `idx_clientes_empresa` (`organizacao_id`,`loja_id`,`razao_social`),
  KEY `fk_clientes_vendedor` (`organizacao_id`,`loja_id`,`vendedor_atual_id`),
  CONSTRAINT `fk_clientes_loja` FOREIGN KEY (`organizacao_id`, `loja_id`) REFERENCES `lojas` (`organizacao_id`, `id`),
  CONSTRAINT `fk_clientes_vendedor` FOREIGN KEY (`organizacao_id`, `loja_id`, `vendedor_atual_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `ck_cliente_cep` CHECK (regexp_like(`cep`,_utf8mb4'^[0-9]{8}$')),
  CONSTRAINT `ck_cliente_pessoa` CHECK ((((`tipo` = _utf8mb4'PF') and (`nome_completo` is not null) and (char_length(trim(`nome_completo`)) > 0) and (`cpf` is not null) and regexp_like(`cpf`,_ascii'^[0-9]{11}$') and isnull(`cnpj`)) or ((`tipo` = _utf8mb4'PJ') and (`razao_social` is not null) and (char_length(trim(`razao_social`)) > 0) and (`cnpj` is not null) and regexp_like(`cnpj`,_ascii'^[0-9]{14}$') and isnull(`cpf`)))),
  CONSTRAINT `ck_cliente_renda` CHECK ((isnull(`renda_mensal`) or (`renda_mensal` >= 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_clientes_insert` AFTER INSERT ON `clientes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'clientes', NEW.id, NULL, JSON_OBJECT('tipo', NEW.tipo, 'vendedor_atual_id', NEW.vendedor_atual_id, 'excluido_em', NEW.excluido_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_clientes_update` AFTER UPDATE ON `clientes` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.tipo <=> NEW.tipo) OR NOT (OLD.nome_completo <=> NEW.nome_completo) OR NOT (OLD.cpf <=> NEW.cpf) OR NOT (OLD.razao_social <=> NEW.razao_social) OR NOT (OLD.nome_fantasia <=> NEW.nome_fantasia) OR NOT (OLD.cnpj <=> NEW.cnpj) OR NOT (OLD.pessoa_contato <=> NEW.pessoa_contato) OR NOT (OLD.telefone <=> NEW.telefone) OR NOT (OLD.email <=> NEW.email) OR NOT (OLD.cep <=> NEW.cep) OR NOT (OLD.logradouro <=> NEW.logradouro) OR NOT (OLD.numero <=> NEW.numero) OR NOT (OLD.complemento <=> NEW.complemento) OR NOT (OLD.bairro <=> NEW.bairro) OR NOT (OLD.cidade <=> NEW.cidade) OR NOT (OLD.estado <=> NEW.estado) OR NOT (OLD.vendedor_atual_id <=> NEW.vendedor_atual_id) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) OR NOT (OLD.excluido_em <=> NEW.excluido_em) OR NOT (OLD.ocupacao <=> NEW.ocupacao) OR NOT (OLD.renda_mensal <=> NEW.renda_mensal) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'clientes', NEW.id, JSON_OBJECT('tipo', OLD.tipo, 'vendedor_atual_id', OLD.vendedor_atual_id, 'excluido_em', OLD.excluido_em), JSON_OBJECT('tipo', NEW.tipo, 'vendedor_atual_id', NEW.vendedor_atual_id, 'excluido_em', NEW.excluido_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.tipo <=> NEW.tipo, JSON_ARRAY(), JSON_ARRAY('tipo')), IF(OLD.nome_completo <=> NEW.nome_completo, JSON_ARRAY(), JSON_ARRAY('nome_completo')), IF(OLD.cpf <=> NEW.cpf, JSON_ARRAY(), JSON_ARRAY('cpf')), IF(OLD.razao_social <=> NEW.razao_social, JSON_ARRAY(), JSON_ARRAY('razao_social')), IF(OLD.nome_fantasia <=> NEW.nome_fantasia, JSON_ARRAY(), JSON_ARRAY('nome_fantasia')), IF(OLD.cnpj <=> NEW.cnpj, JSON_ARRAY(), JSON_ARRAY('cnpj')), IF(OLD.pessoa_contato <=> NEW.pessoa_contato, JSON_ARRAY(), JSON_ARRAY('pessoa_contato')), IF(OLD.telefone <=> NEW.telefone, JSON_ARRAY(), JSON_ARRAY('telefone')), IF(OLD.email <=> NEW.email, JSON_ARRAY(), JSON_ARRAY('email')), IF(OLD.cep <=> NEW.cep, JSON_ARRAY(), JSON_ARRAY('cep')), IF(OLD.logradouro <=> NEW.logradouro, JSON_ARRAY(), JSON_ARRAY('logradouro')), IF(OLD.numero <=> NEW.numero, JSON_ARRAY(), JSON_ARRAY('numero')), IF(OLD.complemento <=> NEW.complemento, JSON_ARRAY(), JSON_ARRAY('complemento')), IF(OLD.bairro <=> NEW.bairro, JSON_ARRAY(), JSON_ARRAY('bairro')), IF(OLD.cidade <=> NEW.cidade, JSON_ARRAY(), JSON_ARRAY('cidade')), IF(OLD.estado <=> NEW.estado, JSON_ARRAY(), JSON_ARRAY('estado')), IF(OLD.vendedor_atual_id <=> NEW.vendedor_atual_id, JSON_ARRAY(), JSON_ARRAY('vendedor_atual_id')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em')), IF(OLD.excluido_em <=> NEW.excluido_em, JSON_ARRAY(), JSON_ARRAY('excluido_em')), IF(OLD.ocupacao <=> NEW.ocupacao, JSON_ARRAY(), JSON_ARRAY('ocupacao')), IF(OLD.renda_mensal <=> NEW.renda_mensal, JSON_ARRAY(), JSON_ARRAY('renda_mensal'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_clientes_delete` AFTER DELETE ON `clientes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'clientes', OLD.id, JSON_OBJECT('tipo', OLD.tipo, 'vendedor_atual_id', OLD.vendedor_atual_id, 'excluido_em', OLD.excluido_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `comissoes`
--

DROP TABLE IF EXISTS `comissoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comissoes` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `negocio_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `tipo` enum('VENDEDOR','GERENTE','SUPORTE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_calculo` decimal(12,2) NOT NULL,
  `percentual` decimal(7,4) DEFAULT NULL,
  `valor` decimal(12,2) NOT NULL,
  `retrato_regra` json NOT NULL,
  `status` enum('PENDENTE','APROVADO','PAGO','ESTORNADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `pago_em` datetime(3) DEFAULT NULL,
  `pago_por_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `referencia_pagamento` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estornado_em` datetime(3) DEFAULT NULL,
  `motivo_estorno` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `regra_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_comissao_beneficiario` (`organizacao_id`,`loja_id`,`negocio_id`,`usuario_id`,`tipo`),
  KEY `idx_comissoes_relatorio` (`organizacao_id`,`loja_id`,`status`,`criado_em`),
  KEY `fk_comissoes_usuario` (`organizacao_id`,`loja_id`,`usuario_id`),
  KEY `fk_comissoes_pagador` (`organizacao_id`,`pago_por_id`),
  KEY `fk_comissao_regra` (`organizacao_id`,`loja_id`,`regra_id`),
  CONSTRAINT `fk_comissao_regra` FOREIGN KEY (`organizacao_id`, `loja_id`, `regra_id`) REFERENCES `regras_comissao` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_comissoes_negocio` FOREIGN KEY (`organizacao_id`, `loja_id`, `negocio_id`) REFERENCES `negocios` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_comissoes_pagador` FOREIGN KEY (`organizacao_id`, `pago_por_id`) REFERENCES `usuarios` (`organizacao_id`, `id`),
  CONSTRAINT `fk_comissoes_usuario` FOREIGN KEY (`organizacao_id`, `loja_id`, `usuario_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `ck_comissao_estorno` CHECK (((`status` <> _utf8mb4'ESTORNADO') or ((`estornado_em` is not null) and (`motivo_estorno` is not null)))),
  CONSTRAINT `ck_comissao_pagamento` CHECK (((`status` <> _utf8mb4'PAGO') or ((`pago_em` is not null) and (`referencia_pagamento` is not null)))),
  CONSTRAINT `ck_comissao_valor` CHECK (((`base_calculo` >= 0) and (`valor` >= 0) and (isnull(`percentual`) or (`percentual` between 0 and 100))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_comissoes_inicio` BEFORE INSERT ON `comissoes` FOR EACH ROW BEGIN
  IF NEW.status <> 'PENDENTE' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Comissao deve iniciar em PENDENTE'; END IF;
  IF NOT EXISTS (SELECT 1 FROM negocios WHERE id = NEW.negocio_id AND status = 'CONTRATO_EFETIVADO') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Comissao exige negocio efetivado';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_comissoes_insert` AFTER INSERT ON `comissoes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'comissoes', NEW.id, NULL, JSON_OBJECT('negocio_id', NEW.negocio_id, 'usuario_id', NEW.usuario_id, 'tipo', NEW.tipo, 'base_calculo', NEW.base_calculo, 'percentual', NEW.percentual, 'valor', NEW.valor, 'status', NEW.status, 'estornado_em', NEW.estornado_em, 'regra_id', NEW.regra_id), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_comissoes_transicao` BEFORE UPDATE ON `comissoes` FOR EACH ROW BEGIN
  CALL validar_transicao('COMISSAO', OLD.status, NEW.status);
  IF NEW.valor <> OLD.valor OR NEW.base_calculo <> OLD.base_calculo OR NOT (NEW.percentual <=> OLD.percentual)
    OR NOT (NEW.retrato_regra <=> OLD.retrato_regra) OR NOT (NEW.regra_id <=> OLD.regra_id)
    OR NEW.usuario_id <> OLD.usuario_id OR NEW.negocio_id <> OLD.negocio_id OR NEW.tipo <> OLD.tipo
    OR NEW.organizacao_id <> OLD.organizacao_id OR NEW.loja_id <> OLD.loja_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Calculo e beneficiario da comissao sao imutaveis';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_comissoes_update` AFTER UPDATE ON `comissoes` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.negocio_id <=> NEW.negocio_id) OR NOT (OLD.usuario_id <=> NEW.usuario_id) OR NOT (OLD.tipo <=> NEW.tipo) OR NOT (OLD.base_calculo <=> NEW.base_calculo) OR NOT (OLD.percentual <=> NEW.percentual) OR NOT (OLD.valor <=> NEW.valor) OR NOT (OLD.retrato_regra <=> NEW.retrato_regra) OR NOT (OLD.status <=> NEW.status) OR NOT (OLD.pago_em <=> NEW.pago_em) OR NOT (OLD.pago_por_id <=> NEW.pago_por_id) OR NOT (OLD.referencia_pagamento <=> NEW.referencia_pagamento) OR NOT (OLD.estornado_em <=> NEW.estornado_em) OR NOT (OLD.motivo_estorno <=> NEW.motivo_estorno) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) OR NOT (OLD.regra_id <=> NEW.regra_id) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'comissoes', NEW.id, JSON_OBJECT('negocio_id', OLD.negocio_id, 'usuario_id', OLD.usuario_id, 'tipo', OLD.tipo, 'base_calculo', OLD.base_calculo, 'percentual', OLD.percentual, 'valor', OLD.valor, 'status', OLD.status, 'estornado_em', OLD.estornado_em, 'regra_id', OLD.regra_id), JSON_OBJECT('negocio_id', NEW.negocio_id, 'usuario_id', NEW.usuario_id, 'tipo', NEW.tipo, 'base_calculo', NEW.base_calculo, 'percentual', NEW.percentual, 'valor', NEW.valor, 'status', NEW.status, 'estornado_em', NEW.estornado_em, 'regra_id', NEW.regra_id), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.negocio_id <=> NEW.negocio_id, JSON_ARRAY(), JSON_ARRAY('negocio_id')), IF(OLD.usuario_id <=> NEW.usuario_id, JSON_ARRAY(), JSON_ARRAY('usuario_id')), IF(OLD.tipo <=> NEW.tipo, JSON_ARRAY(), JSON_ARRAY('tipo')), IF(OLD.base_calculo <=> NEW.base_calculo, JSON_ARRAY(), JSON_ARRAY('base_calculo')), IF(OLD.percentual <=> NEW.percentual, JSON_ARRAY(), JSON_ARRAY('percentual')), IF(OLD.valor <=> NEW.valor, JSON_ARRAY(), JSON_ARRAY('valor')), IF(OLD.retrato_regra <=> NEW.retrato_regra, JSON_ARRAY(), JSON_ARRAY('retrato_regra')), IF(OLD.status <=> NEW.status, JSON_ARRAY(), JSON_ARRAY('status')), IF(OLD.pago_em <=> NEW.pago_em, JSON_ARRAY(), JSON_ARRAY('pago_em')), IF(OLD.pago_por_id <=> NEW.pago_por_id, JSON_ARRAY(), JSON_ARRAY('pago_por_id')), IF(OLD.referencia_pagamento <=> NEW.referencia_pagamento, JSON_ARRAY(), JSON_ARRAY('referencia_pagamento')), IF(OLD.estornado_em <=> NEW.estornado_em, JSON_ARRAY(), JSON_ARRAY('estornado_em')), IF(OLD.motivo_estorno <=> NEW.motivo_estorno, JSON_ARRAY(), JSON_ARRAY('motivo_estorno')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em')), IF(OLD.regra_id <=> NEW.regra_id, JSON_ARRAY(), JSON_ARRAY('regra_id'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_comissoes_delete` BEFORE DELETE ON `comissoes` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_comissoes_delete` AFTER DELETE ON `comissoes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'comissoes', OLD.id, JSON_OBJECT('negocio_id', OLD.negocio_id, 'usuario_id', OLD.usuario_id, 'tipo', OLD.tipo, 'base_calculo', OLD.base_calculo, 'percentual', OLD.percentual, 'valor', OLD.valor, 'status', OLD.status, 'estornado_em', OLD.estornado_em, 'regra_id', OLD.regra_id), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `compartilhamentos_clientes`
--

DROP TABLE IF EXISTS `compartilhamentos_clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compartilhamentos_clientes` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Origem do cadastro',
  `loja_destino_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `cliente_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `autorizado_por_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `finalidade` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expira_em` datetime(3) NOT NULL,
  `revogado_em` datetime(3) DEFAULT NULL,
  `cliente_ativo_id` char(36) CHARACTER SET ascii COLLATE ascii_bin GENERATED ALWAYS AS ((case when isnull(`revogado_em`) then `cliente_id` else NULL end)) STORED,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_compartilhamento_destino` (`organizacao_id`,`loja_id`,`cliente_ativo_id`,`loja_destino_id`),
  KEY `fk_compartilhamento_cliente` (`organizacao_id`,`loja_id`,`cliente_id`),
  KEY `fk_compartilhamento_destino` (`organizacao_id`,`loja_destino_id`),
  KEY `fk_compartilhamento_autor` (`organizacao_id`,`loja_id`,`autorizado_por_id`),
  CONSTRAINT `fk_compartilhamento_autor` FOREIGN KEY (`organizacao_id`, `loja_id`, `autorizado_por_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `fk_compartilhamento_cliente` FOREIGN KEY (`organizacao_id`, `loja_id`, `cliente_id`) REFERENCES `clientes` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_compartilhamento_destino` FOREIGN KEY (`organizacao_id`, `loja_destino_id`) REFERENCES `lojas` (`organizacao_id`, `id`),
  CONSTRAINT `ck_compartilhamento_prazo` CHECK ((`expira_em` > `criado_em`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_compartilhamento_lojas` BEFORE INSERT ON `compartilhamentos_clientes` FOR EACH ROW BEGIN
  IF NEW.loja_id = NEW.loja_destino_id OR NEW.revogado_em IS NOT NULL OR NEW.expira_em <= UTC_TIMESTAMP(3) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Compartilhar entre lojas distintas com prazo futuro'; END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_compartilhamentos_clientes_insert` AFTER INSERT ON `compartilhamentos_clientes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'compartilhamentos_clientes', NEW.id, NULL, JSON_OBJECT('loja_destino_id', NEW.loja_destino_id, 'cliente_id', NEW.cliente_id, 'expira_em', NEW.expira_em, 'revogado_em', NEW.revogado_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_compartilhamento_identidade` BEFORE UPDATE ON `compartilhamentos_clientes` FOR EACH ROW BEGIN
  IF NEW.organizacao_id<>OLD.organizacao_id OR NEW.loja_id<>OLD.loja_id OR NEW.loja_destino_id<>OLD.loja_destino_id
    OR NEW.cliente_id<>OLD.cliente_id OR NEW.autorizado_por_id<>OLD.autorizado_por_id
    OR (OLD.revogado_em IS NOT NULL AND NOT (NEW.revogado_em <=> OLD.revogado_em)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Compartilhamento revogado ou identidade imutavel';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_compartilhamentos_clientes_update` AFTER UPDATE ON `compartilhamentos_clientes` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.loja_destino_id <=> NEW.loja_destino_id) OR NOT (OLD.cliente_id <=> NEW.cliente_id) OR NOT (OLD.autorizado_por_id <=> NEW.autorizado_por_id) OR NOT (OLD.finalidade <=> NEW.finalidade) OR NOT (OLD.expira_em <=> NEW.expira_em) OR NOT (OLD.revogado_em <=> NEW.revogado_em) OR NOT (OLD.cliente_ativo_id <=> NEW.cliente_ativo_id) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'compartilhamentos_clientes', NEW.id, JSON_OBJECT('loja_destino_id', OLD.loja_destino_id, 'cliente_id', OLD.cliente_id, 'expira_em', OLD.expira_em, 'revogado_em', OLD.revogado_em), JSON_OBJECT('loja_destino_id', NEW.loja_destino_id, 'cliente_id', NEW.cliente_id, 'expira_em', NEW.expira_em, 'revogado_em', NEW.revogado_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.loja_destino_id <=> NEW.loja_destino_id, JSON_ARRAY(), JSON_ARRAY('loja_destino_id')), IF(OLD.cliente_id <=> NEW.cliente_id, JSON_ARRAY(), JSON_ARRAY('cliente_id')), IF(OLD.autorizado_por_id <=> NEW.autorizado_por_id, JSON_ARRAY(), JSON_ARRAY('autorizado_por_id')), IF(OLD.finalidade <=> NEW.finalidade, JSON_ARRAY(), JSON_ARRAY('finalidade')), IF(OLD.expira_em <=> NEW.expira_em, JSON_ARRAY(), JSON_ARRAY('expira_em')), IF(OLD.revogado_em <=> NEW.revogado_em, JSON_ARRAY(), JSON_ARRAY('revogado_em')), IF(OLD.cliente_ativo_id <=> NEW.cliente_ativo_id, JSON_ARRAY(), JSON_ARRAY('cliente_ativo_id')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_compartilhamentos_clientes_delete` AFTER DELETE ON `compartilhamentos_clientes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'compartilhamentos_clientes', OLD.id, JSON_OBJECT('loja_destino_id', OLD.loja_destino_id, 'cliente_id', OLD.cliente_id, 'expira_em', OLD.expira_em, 'revogado_em', OLD.revogado_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `configuracoes_loja`
--

DROP TABLE IF EXISTS `configuracoes_loja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracoes_loja` (
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `chave` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` json NOT NULL,
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`organizacao_id`,`loja_id`,`chave`),
  CONSTRAINT `fk_loja_configuracoes_loja` FOREIGN KEY (`organizacao_id`, `loja_id`) REFERENCES `lojas` (`organizacao_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_configuracoes_loja_insert` AFTER INSERT ON `configuracoes_loja` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'configuracoes_loja', NULL, NULL, JSON_OBJECT('chave', NEW.chave), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_configuracoes_loja_update` AFTER UPDATE ON `configuracoes_loja` FOR EACH ROW BEGIN
  IF NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.chave <=> NEW.chave) OR NOT (OLD.valor <=> NEW.valor) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'configuracoes_loja', NULL, JSON_OBJECT('chave', OLD.chave), JSON_OBJECT('chave', NEW.chave), JSON_MERGE_PRESERVE(IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.chave <=> NEW.chave, JSON_ARRAY(), JSON_ARRAY('chave')), IF(OLD.valor <=> NEW.valor, JSON_ARRAY(), JSON_ARRAY('valor')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_configuracoes_loja_delete` AFTER DELETE ON `configuracoes_loja` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'configuracoes_loja', NULL, JSON_OBJECT('chave', OLD.chave), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `configuracoes_organizacao`
--

DROP TABLE IF EXISTS `configuracoes_organizacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracoes_organizacao` (
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `chave` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` json NOT NULL,
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`organizacao_id`,`chave`),
  CONSTRAINT `fk_organizacao_configuracoes_organizacao` FOREIGN KEY (`organizacao_id`) REFERENCES `organizacoes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_configuracoes_organizacao_insert` AFTER INSERT ON `configuracoes_organizacao` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NULL, 'INSERIR', 'configuracoes_organizacao', NULL, NULL, JSON_OBJECT('chave', NEW.chave), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_configuracoes_organizacao_update` AFTER UPDATE ON `configuracoes_organizacao` FOR EACH ROW BEGIN
  IF NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.chave <=> NEW.chave) OR NOT (OLD.valor <=> NEW.valor) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NULL, 'ALTERAR', 'configuracoes_organizacao', NULL, JSON_OBJECT('chave', OLD.chave), JSON_OBJECT('chave', NEW.chave), JSON_MERGE_PRESERVE(IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.chave <=> NEW.chave, JSON_ARRAY(), JSON_ARRAY('chave')), IF(OLD.valor <=> NEW.valor, JSON_ARRAY(), JSON_ARRAY('valor')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_configuracoes_organizacao_delete` AFTER DELETE ON `configuracoes_organizacao` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, NULL, 'EXCLUIR', 'configuracoes_organizacao', NULL, JSON_OBJECT('chave', OLD.chave), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `contratos`
--

DROP TABLE IF EXISTS `contratos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contratos` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `negocio_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `status` enum('RASCUNHO','ASSINADO','EFETIVADO','CANCELADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RASCUNHO',
  `valor` decimal(12,2) NOT NULL,
  `assinado_em` datetime(3) DEFAULT NULL,
  `efetivado_em` datetime(3) DEFAULT NULL,
  `cancelado_em` datetime(3) DEFAULT NULL,
  `motivo_cancelamento` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `retrato_condicoes` json NOT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_contratos_escopo` (`organizacao_id`,`loja_id`,`id`),
  UNIQUE KEY `uq_contratos_negocio` (`organizacao_id`,`loja_id`,`negocio_id`),
  KEY `idx_contratos_relatorio` (`organizacao_id`,`loja_id`,`status`,`efetivado_em`),
  CONSTRAINT `fk_contratos_negocio` FOREIGN KEY (`organizacao_id`, `loja_id`, `negocio_id`) REFERENCES `negocios` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `ck_contrato_datas` CHECK ((((`status` not in (_utf8mb4'ASSINADO',_utf8mb4'EFETIVADO')) or (`assinado_em` is not null)) and ((`status` <> _utf8mb4'EFETIVADO') or (`efetivado_em` is not null)) and ((`status` <> _utf8mb4'CANCELADO') or ((`cancelado_em` is not null) and (`motivo_cancelamento` is not null))) and (isnull(`efetivado_em`) or ((`assinado_em` is not null) and (`efetivado_em` >= `assinado_em`))))),
  CONSTRAINT `ck_contrato_valor` CHECK ((`valor` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_contratos_inicio` BEFORE INSERT ON `contratos` FOR EACH ROW BEGIN
  IF NEW.status <> 'RASCUNHO' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Contrato deve iniciar em RASCUNHO'; END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_contratos_insert` AFTER INSERT ON `contratos` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'contratos', NEW.id, NULL, JSON_OBJECT('negocio_id', NEW.negocio_id, 'status', NEW.status, 'valor', NEW.valor, 'efetivado_em', NEW.efetivado_em, 'cancelado_em', NEW.cancelado_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_contratos_transicao` BEFORE UPDATE ON `contratos` FOR EACH ROW BEGIN
  CALL validar_transicao('CONTRATO', OLD.status, NEW.status);
  IF NEW.negocio_id <> OLD.negocio_id OR NEW.loja_id <> OLD.loja_id OR NEW.organizacao_id <> OLD.organizacao_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Identidade contratual imutavel';
  END IF;
  IF OLD.status <> 'RASCUNHO' AND (NEW.valor <> OLD.valor OR NOT (NEW.retrato_condicoes <=> OLD.retrato_condicoes)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Contrato assinado exige novo instrumento para mudar condicoes';
  END IF;
  IF NEW.status = 'EFETIVADO' AND OLD.status <> NEW.status AND NOT EXISTS (
    SELECT 1 FROM negocios WHERE id = NEW.negocio_id AND organizacao_id = NEW.organizacao_id AND loja_id = NEW.loja_id
      AND status IN ('PROPOSTA','CREDITO_APROVADO') AND valor_negociado = NEW.valor
  ) THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Negocio deve estar aprovado ou proposto com mesmo valor'; END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_contratos_update` AFTER UPDATE ON `contratos` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.negocio_id <=> NEW.negocio_id) OR NOT (OLD.status <=> NEW.status) OR NOT (OLD.valor <=> NEW.valor) OR NOT (OLD.assinado_em <=> NEW.assinado_em) OR NOT (OLD.efetivado_em <=> NEW.efetivado_em) OR NOT (OLD.cancelado_em <=> NEW.cancelado_em) OR NOT (OLD.motivo_cancelamento <=> NEW.motivo_cancelamento) OR NOT (OLD.retrato_condicoes <=> NEW.retrato_condicoes) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'contratos', NEW.id, JSON_OBJECT('negocio_id', OLD.negocio_id, 'status', OLD.status, 'valor', OLD.valor, 'efetivado_em', OLD.efetivado_em, 'cancelado_em', OLD.cancelado_em), JSON_OBJECT('negocio_id', NEW.negocio_id, 'status', NEW.status, 'valor', NEW.valor, 'efetivado_em', NEW.efetivado_em, 'cancelado_em', NEW.cancelado_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.negocio_id <=> NEW.negocio_id, JSON_ARRAY(), JSON_ARRAY('negocio_id')), IF(OLD.status <=> NEW.status, JSON_ARRAY(), JSON_ARRAY('status')), IF(OLD.valor <=> NEW.valor, JSON_ARRAY(), JSON_ARRAY('valor')), IF(OLD.assinado_em <=> NEW.assinado_em, JSON_ARRAY(), JSON_ARRAY('assinado_em')), IF(OLD.efetivado_em <=> NEW.efetivado_em, JSON_ARRAY(), JSON_ARRAY('efetivado_em')), IF(OLD.cancelado_em <=> NEW.cancelado_em, JSON_ARRAY(), JSON_ARRAY('cancelado_em')), IF(OLD.motivo_cancelamento <=> NEW.motivo_cancelamento, JSON_ARRAY(), JSON_ARRAY('motivo_cancelamento')), IF(OLD.retrato_condicoes <=> NEW.retrato_condicoes, JSON_ARRAY(), JSON_ARRAY('retrato_condicoes')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_contratos_delete` BEFORE DELETE ON `contratos` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_contratos_delete` AFTER DELETE ON `contratos` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'contratos', OLD.id, JSON_OBJECT('negocio_id', OLD.negocio_id, 'status', OLD.status, 'valor', OLD.valor, 'efetivado_em', OLD.efetivado_em, 'cancelado_em', OLD.cancelado_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `custos_estoque`
--

DROP TABLE IF EXISTS `custos_estoque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custos_estoque` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `item_estoque_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `categoria` enum('MANUTENCAO','TRANSPORTE','DOCUMENTACAO','PREPARACAO','OUTRO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(12,2) NOT NULL,
  `ocorrido_em` datetime(3) NOT NULL,
  `estornado_em` datetime(3) DEFAULT NULL,
  `motivo_estorno` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_custos_item` (`organizacao_id`,`loja_id`,`item_estoque_id`),
  CONSTRAINT `fk_custos_item` FOREIGN KEY (`organizacao_id`, `loja_id`, `item_estoque_id`) REFERENCES `itens_estoque` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `ck_custo_estorno` CHECK ((isnull(`estornado_em`) or (`motivo_estorno` is not null))),
  CONSTRAINT `ck_custo_valor` CHECK ((`valor` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_custos_estoque_insert` AFTER INSERT ON `custos_estoque` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'custos_estoque', NEW.id, NULL, JSON_OBJECT('item_estoque_id', NEW.item_estoque_id, 'categoria', NEW.categoria, 'valor', NEW.valor, 'estornado_em', NEW.estornado_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_custos_estoque_update` AFTER UPDATE ON `custos_estoque` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.item_estoque_id <=> NEW.item_estoque_id) OR NOT (OLD.categoria <=> NEW.categoria) OR NOT (OLD.descricao <=> NEW.descricao) OR NOT (OLD.valor <=> NEW.valor) OR NOT (OLD.ocorrido_em <=> NEW.ocorrido_em) OR NOT (OLD.estornado_em <=> NEW.estornado_em) OR NOT (OLD.motivo_estorno <=> NEW.motivo_estorno) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'custos_estoque', NEW.id, JSON_OBJECT('item_estoque_id', OLD.item_estoque_id, 'categoria', OLD.categoria, 'valor', OLD.valor, 'estornado_em', OLD.estornado_em), JSON_OBJECT('item_estoque_id', NEW.item_estoque_id, 'categoria', NEW.categoria, 'valor', NEW.valor, 'estornado_em', NEW.estornado_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.item_estoque_id <=> NEW.item_estoque_id, JSON_ARRAY(), JSON_ARRAY('item_estoque_id')), IF(OLD.categoria <=> NEW.categoria, JSON_ARRAY(), JSON_ARRAY('categoria')), IF(OLD.descricao <=> NEW.descricao, JSON_ARRAY(), JSON_ARRAY('descricao')), IF(OLD.valor <=> NEW.valor, JSON_ARRAY(), JSON_ARRAY('valor')), IF(OLD.ocorrido_em <=> NEW.ocorrido_em, JSON_ARRAY(), JSON_ARRAY('ocorrido_em')), IF(OLD.estornado_em <=> NEW.estornado_em, JSON_ARRAY(), JSON_ARRAY('estornado_em')), IF(OLD.motivo_estorno <=> NEW.motivo_estorno, JSON_ARRAY(), JSON_ARRAY('motivo_estorno')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_custos_estoque_delete` BEFORE DELETE ON `custos_estoque` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_custos_estoque_delete` AFTER DELETE ON `custos_estoque` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'custos_estoque', OLD.id, JSON_OBJECT('item_estoque_id', OLD.item_estoque_id, 'categoria', OLD.categoria, 'valor', OLD.valor, 'estornado_em', OLD.estornado_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `documentos_negocio`
--

DROP TABLE IF EXISTS `documentos_negocio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos_negocio` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `negocio_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `versao` int(10) unsigned NOT NULL,
  `tipo_documento` enum('PROPOSTA','CONTRATO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `chave_armazenamento` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sha256` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `retrato_dados` json NOT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_documento_versao` (`organizacao_id`,`loja_id`,`negocio_id`,`tipo_documento`,`versao`),
  CONSTRAINT `fk_documentos_negocio` FOREIGN KEY (`organizacao_id`, `loja_id`, `negocio_id`) REFERENCES `negocios` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `ck_documento_versao` CHECK ((`versao` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_documentos_negocio_insert` AFTER INSERT ON `documentos_negocio` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'documentos_negocio', NEW.id, NULL, JSON_OBJECT('negocio_id', NEW.negocio_id, 'versao', NEW.versao), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_documentos_negocio_update` BEFORE UPDATE ON `documentos_negocio` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Historico imutavel';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_documentos_negocio_update` AFTER UPDATE ON `documentos_negocio` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.negocio_id <=> NEW.negocio_id) OR NOT (OLD.versao <=> NEW.versao) OR NOT (OLD.tipo_documento <=> NEW.tipo_documento) OR NOT (OLD.chave_armazenamento <=> NEW.chave_armazenamento) OR NOT (OLD.sha256 <=> NEW.sha256) OR NOT (OLD.retrato_dados <=> NEW.retrato_dados) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'documentos_negocio', NEW.id, JSON_OBJECT('negocio_id', OLD.negocio_id, 'versao', OLD.versao), JSON_OBJECT('negocio_id', NEW.negocio_id, 'versao', NEW.versao), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.negocio_id <=> NEW.negocio_id, JSON_ARRAY(), JSON_ARRAY('negocio_id')), IF(OLD.versao <=> NEW.versao, JSON_ARRAY(), JSON_ARRAY('versao')), IF(OLD.tipo_documento <=> NEW.tipo_documento, JSON_ARRAY(), JSON_ARRAY('tipo_documento')), IF(OLD.chave_armazenamento <=> NEW.chave_armazenamento, JSON_ARRAY(), JSON_ARRAY('chave_armazenamento')), IF(OLD.sha256 <=> NEW.sha256, JSON_ARRAY(), JSON_ARRAY('sha256')), IF(OLD.retrato_dados <=> NEW.retrato_dados, JSON_ARRAY(), JSON_ARRAY('retrato_dados')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_documentos_negocio_delete` BEFORE DELETE ON `documentos_negocio` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_documentos_negocio_delete` AFTER DELETE ON `documentos_negocio` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'documentos_negocio', OLD.id, JSON_OBJECT('negocio_id', OLD.negocio_id, 'versao', OLD.versao), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `equipes`
--

DROP TABLE IF EXISTS `equipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipes` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gerente_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `excluido_em` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_equipes_escopo` (`organizacao_id`,`loja_id`,`id`),
  KEY `fk_equipes_gerente` (`organizacao_id`,`loja_id`,`gerente_id`),
  CONSTRAINT `fk_equipes_gerente` FOREIGN KEY (`organizacao_id`, `loja_id`, `gerente_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `fk_equipes_loja` FOREIGN KEY (`organizacao_id`, `loja_id`) REFERENCES `lojas` (`organizacao_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_equipes_insert` AFTER INSERT ON `equipes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'equipes', NEW.id, NULL, JSON_OBJECT('gerente_id', NEW.gerente_id, 'excluido_em', NEW.excluido_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_equipes_update` AFTER UPDATE ON `equipes` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.nome <=> NEW.nome) OR NOT (OLD.gerente_id <=> NEW.gerente_id) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) OR NOT (OLD.excluido_em <=> NEW.excluido_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'equipes', NEW.id, JSON_OBJECT('gerente_id', OLD.gerente_id, 'excluido_em', OLD.excluido_em), JSON_OBJECT('gerente_id', NEW.gerente_id, 'excluido_em', NEW.excluido_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.nome <=> NEW.nome, JSON_ARRAY(), JSON_ARRAY('nome')), IF(OLD.gerente_id <=> NEW.gerente_id, JSON_ARRAY(), JSON_ARRAY('gerente_id')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em')), IF(OLD.excluido_em <=> NEW.excluido_em, JSON_ARRAY(), JSON_ARRAY('excluido_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_equipes_delete` AFTER DELETE ON `equipes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'equipes', OLD.id, JSON_OBJECT('gerente_id', OLD.gerente_id, 'excluido_em', OLD.excluido_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `fila_eventos`
--

DROP TABLE IF EXISTS `fila_eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fila_eventos` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `tipo` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `chave_evento` varchar(150) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `dados` json NOT NULL,
  `status` enum('PENDENTE','PROCESSANDO','CONCLUIDO','FALHA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `tentativas` int(10) unsigned NOT NULL DEFAULT '0',
  `disponivel_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `bloqueado_ate` datetime(3) DEFAULT NULL,
  `token_processamento` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `ultimo_erro` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `concluido_em` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_evento_chave` (`organizacao_id`,`loja_id`,`chave_evento`),
  KEY `idx_eventos_processamento` (`organizacao_id`,`loja_id`,`status`,`disponivel_em`),
  CONSTRAINT `fk_eventos_loja` FOREIGN KEY (`organizacao_id`, `loja_id`) REFERENCES `lojas` (`organizacao_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_fila_eventos_insert` AFTER INSERT ON `fila_eventos` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'fila_eventos', NEW.id, NULL, JSON_OBJECT('tipo', NEW.tipo, 'status', NEW.status, 'concluido_em', NEW.concluido_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_fila_eventos_update` AFTER UPDATE ON `fila_eventos` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.tipo <=> NEW.tipo) OR NOT (OLD.chave_evento <=> NEW.chave_evento) OR NOT (OLD.dados <=> NEW.dados) OR NOT (OLD.status <=> NEW.status) OR NOT (OLD.tentativas <=> NEW.tentativas) OR NOT (OLD.disponivel_em <=> NEW.disponivel_em) OR NOT (OLD.bloqueado_ate <=> NEW.bloqueado_ate) OR NOT (OLD.token_processamento <=> NEW.token_processamento) OR NOT (OLD.ultimo_erro <=> NEW.ultimo_erro) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.concluido_em <=> NEW.concluido_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'fila_eventos', NEW.id, JSON_OBJECT('tipo', OLD.tipo, 'status', OLD.status, 'concluido_em', OLD.concluido_em), JSON_OBJECT('tipo', NEW.tipo, 'status', NEW.status, 'concluido_em', NEW.concluido_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.tipo <=> NEW.tipo, JSON_ARRAY(), JSON_ARRAY('tipo')), IF(OLD.chave_evento <=> NEW.chave_evento, JSON_ARRAY(), JSON_ARRAY('chave_evento')), IF(OLD.dados <=> NEW.dados, JSON_ARRAY(), JSON_ARRAY('dados')), IF(OLD.status <=> NEW.status, JSON_ARRAY(), JSON_ARRAY('status')), IF(OLD.tentativas <=> NEW.tentativas, JSON_ARRAY(), JSON_ARRAY('tentativas')), IF(OLD.disponivel_em <=> NEW.disponivel_em, JSON_ARRAY(), JSON_ARRAY('disponivel_em')), IF(OLD.bloqueado_ate <=> NEW.bloqueado_ate, JSON_ARRAY(), JSON_ARRAY('bloqueado_ate')), IF(OLD.token_processamento <=> NEW.token_processamento, JSON_ARRAY(), JSON_ARRAY('token_processamento')), IF(OLD.ultimo_erro <=> NEW.ultimo_erro, JSON_ARRAY(), JSON_ARRAY('ultimo_erro')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.concluido_em <=> NEW.concluido_em, JSON_ARRAY(), JSON_ARRAY('concluido_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_fila_eventos_delete` AFTER DELETE ON `fila_eventos` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'fila_eventos', OLD.id, JSON_OBJECT('tipo', OLD.tipo, 'status', OLD.status, 'concluido_em', OLD.concluido_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `historico_atribuicao_clientes`
--

DROP TABLE IF EXISTS `historico_atribuicao_clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_atribuicao_clientes` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `cliente_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `vendedor_anterior_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `novo_vendedor_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `motivo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_atribuicao_cliente` (`organizacao_id`,`loja_id`,`cliente_id`,`criado_em`),
  KEY `fk_atribuicao_anterior` (`organizacao_id`,`loja_id`,`vendedor_anterior_id`),
  KEY `fk_atribuicao_novo` (`organizacao_id`,`loja_id`,`novo_vendedor_id`),
  KEY `fk_atribuicao_usuario` (`organizacao_id`,`usuario_id`),
  CONSTRAINT `fk_atribuicao_anterior` FOREIGN KEY (`organizacao_id`, `loja_id`, `vendedor_anterior_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `fk_atribuicao_cliente` FOREIGN KEY (`organizacao_id`, `loja_id`, `cliente_id`) REFERENCES `clientes` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_atribuicao_novo` FOREIGN KEY (`organizacao_id`, `loja_id`, `novo_vendedor_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `fk_atribuicao_usuario` FOREIGN KEY (`organizacao_id`, `usuario_id`) REFERENCES `usuarios` (`organizacao_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_historico_atribuicao_clientes_insert` AFTER INSERT ON `historico_atribuicao_clientes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'historico_atribuicao_clientes', NEW.id, NULL, JSON_OBJECT('cliente_id', NEW.cliente_id, 'usuario_id', NEW.usuario_id), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_historico_atribuicao_clientes_update` BEFORE UPDATE ON `historico_atribuicao_clientes` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Historico imutavel';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_historico_atribuicao_clientes_update` AFTER UPDATE ON `historico_atribuicao_clientes` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.cliente_id <=> NEW.cliente_id) OR NOT (OLD.vendedor_anterior_id <=> NEW.vendedor_anterior_id) OR NOT (OLD.novo_vendedor_id <=> NEW.novo_vendedor_id) OR NOT (OLD.usuario_id <=> NEW.usuario_id) OR NOT (OLD.motivo <=> NEW.motivo) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'historico_atribuicao_clientes', NEW.id, JSON_OBJECT('cliente_id', OLD.cliente_id, 'usuario_id', OLD.usuario_id), JSON_OBJECT('cliente_id', NEW.cliente_id, 'usuario_id', NEW.usuario_id), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.cliente_id <=> NEW.cliente_id, JSON_ARRAY(), JSON_ARRAY('cliente_id')), IF(OLD.vendedor_anterior_id <=> NEW.vendedor_anterior_id, JSON_ARRAY(), JSON_ARRAY('vendedor_anterior_id')), IF(OLD.novo_vendedor_id <=> NEW.novo_vendedor_id, JSON_ARRAY(), JSON_ARRAY('novo_vendedor_id')), IF(OLD.usuario_id <=> NEW.usuario_id, JSON_ARRAY(), JSON_ARRAY('usuario_id')), IF(OLD.motivo <=> NEW.motivo, JSON_ARRAY(), JSON_ARRAY('motivo')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_historico_atribuicao_clientes_delete` BEFORE DELETE ON `historico_atribuicao_clientes` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_historico_atribuicao_clientes_delete` AFTER DELETE ON `historico_atribuicao_clientes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'historico_atribuicao_clientes', OLD.id, JSON_OBJECT('cliente_id', OLD.cliente_id, 'usuario_id', OLD.usuario_id), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `historico_status_negocios`
--

DROP TABLE IF EXISTS `historico_status_negocios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_status_negocios` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `negocio_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `status_anterior` enum('SIMULACAO','PROPOSTA','CREDITO_APROVADO','CREDITO_RECUSADO','CONTRATO_EFETIVADO','CANCELADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_novo` enum('SIMULACAO','PROPOSTA','CREDITO_APROVADO','CREDITO_RECUSADO','CONTRATO_EFETIVADO','CANCELADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_historico_negocio` (`organizacao_id`,`loja_id`,`negocio_id`,`criado_em`),
  KEY `fk_historico_usuario` (`organizacao_id`,`usuario_id`),
  CONSTRAINT `fk_historico_negocio` FOREIGN KEY (`organizacao_id`, `loja_id`, `negocio_id`) REFERENCES `negocios` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_historico_usuario` FOREIGN KEY (`organizacao_id`, `usuario_id`) REFERENCES `usuarios` (`organizacao_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_historico_status_negocios_insert` AFTER INSERT ON `historico_status_negocios` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'historico_status_negocios', NEW.id, NULL, JSON_OBJECT('negocio_id', NEW.negocio_id, 'usuario_id', NEW.usuario_id), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_historico_status_negocios_update` BEFORE UPDATE ON `historico_status_negocios` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Historico imutavel';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_historico_status_negocios_update` AFTER UPDATE ON `historico_status_negocios` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.negocio_id <=> NEW.negocio_id) OR NOT (OLD.usuario_id <=> NEW.usuario_id) OR NOT (OLD.status_anterior <=> NEW.status_anterior) OR NOT (OLD.status_novo <=> NEW.status_novo) OR NOT (OLD.motivo <=> NEW.motivo) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'historico_status_negocios', NEW.id, JSON_OBJECT('negocio_id', OLD.negocio_id, 'usuario_id', OLD.usuario_id), JSON_OBJECT('negocio_id', NEW.negocio_id, 'usuario_id', NEW.usuario_id), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.negocio_id <=> NEW.negocio_id, JSON_ARRAY(), JSON_ARRAY('negocio_id')), IF(OLD.usuario_id <=> NEW.usuario_id, JSON_ARRAY(), JSON_ARRAY('usuario_id')), IF(OLD.status_anterior <=> NEW.status_anterior, JSON_ARRAY(), JSON_ARRAY('status_anterior')), IF(OLD.status_novo <=> NEW.status_novo, JSON_ARRAY(), JSON_ARRAY('status_novo')), IF(OLD.motivo <=> NEW.motivo, JSON_ARRAY(), JSON_ARRAY('motivo')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_historico_status_negocios_delete` BEFORE DELETE ON `historico_status_negocios` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_historico_status_negocios_delete` AFTER DELETE ON `historico_status_negocios` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'historico_status_negocios', OLD.id, JSON_OBJECT('negocio_id', OLD.negocio_id, 'usuario_id', OLD.usuario_id), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `itens_estoque`
--

DROP TABLE IF EXISTS `itens_estoque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens_estoque` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `veiculo_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `item_origem_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `custo_aquisicao` decimal(12,2) NOT NULL DEFAULT '0.00',
  `preco_sugerido` decimal(12,2) NOT NULL,
  `preco_minimo` decimal(12,2) NOT NULL,
  `status` enum('DISPONIVEL','EM_NEGOCIACAO','RESERVADO','VENDIDO','TRANSFERIDO','BAIXADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DISPONIVEL',
  `entrada_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `encerrado_em` datetime(3) DEFAULT NULL,
  `veiculo_ativo_id` char(36) CHARACTER SET ascii COLLATE ascii_bin GENERATED ALWAYS AS ((case when (`status` in (_utf8mb4'DISPONIVEL',_utf8mb4'EM_NEGOCIACAO',_utf8mb4'RESERVADO')) then `veiculo_id` else NULL end)) STORED,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_estoque_escopo` (`organizacao_id`,`loja_id`,`id`),
  UNIQUE KEY `uq_estoque_veiculo` (`organizacao_id`,`loja_id`,`id`,`veiculo_id`),
  UNIQUE KEY `uq_estoque_identidade` (`organizacao_id`,`id`,`veiculo_id`),
  UNIQUE KEY `uq_estoque_veiculo_ativo` (`organizacao_id`,`veiculo_ativo_id`),
  KEY `idx_estoque_busca` (`organizacao_id`,`loja_id`,`status`,`entrada_em`),
  KEY `fk_estoque_veiculo` (`organizacao_id`,`veiculo_id`),
  KEY `fk_estoque_origem` (`organizacao_id`,`item_origem_id`,`veiculo_id`),
  CONSTRAINT `fk_estoque_loja` FOREIGN KEY (`organizacao_id`, `loja_id`) REFERENCES `lojas` (`organizacao_id`, `id`),
  CONSTRAINT `fk_estoque_origem` FOREIGN KEY (`organizacao_id`, `item_origem_id`, `veiculo_id`) REFERENCES `itens_estoque` (`organizacao_id`, `id`, `veiculo_id`),
  CONSTRAINT `fk_estoque_veiculo` FOREIGN KEY (`organizacao_id`, `veiculo_id`) REFERENCES `veiculos` (`organizacao_id`, `id`),
  CONSTRAINT `ck_estoque_encerramento` CHECK (((`status` not in (_utf8mb4'VENDIDO',_utf8mb4'TRANSFERIDO',_utf8mb4'BAIXADO')) or (`encerrado_em` is not null))),
  CONSTRAINT `ck_estoque_valores` CHECK (((`custo_aquisicao` >= 0) and (`preco_minimo` >= 0) and (`preco_sugerido` >= `preco_minimo`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_itens_estoque_insert` AFTER INSERT ON `itens_estoque` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'itens_estoque', NEW.id, NULL, JSON_OBJECT('veiculo_id', NEW.veiculo_id, 'item_origem_id', NEW.item_origem_id, 'custo_aquisicao', NEW.custo_aquisicao, 'preco_sugerido', NEW.preco_sugerido, 'preco_minimo', NEW.preco_minimo, 'status', NEW.status, 'encerrado_em', NEW.encerrado_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_estoque_identidade` BEFORE UPDATE ON `itens_estoque` FOR EACH ROW BEGIN
  CALL validar_transicao('ESTOQUE', OLD.status, NEW.status);
  IF NOT (NEW.organizacao_id <=> OLD.organizacao_id) OR NOT (NEW.loja_id <=> OLD.loja_id)
    OR NOT (NEW.veiculo_id <=> OLD.veiculo_id) OR NOT (NEW.item_origem_id <=> OLD.item_origem_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transferencia exige novo item, preservando a origem';
  END IF;
  IF OLD.status IN ('VENDIDO','TRANSFERIDO','BAIXADO') AND
    (NEW.custo_aquisicao <> OLD.custo_aquisicao OR NEW.preco_minimo <> OLD.preco_minimo OR NEW.preco_sugerido <> OLD.preco_sugerido) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Valores do estoque encerrado sao imutaveis';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_itens_estoque_update` AFTER UPDATE ON `itens_estoque` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.veiculo_id <=> NEW.veiculo_id) OR NOT (OLD.item_origem_id <=> NEW.item_origem_id) OR NOT (OLD.custo_aquisicao <=> NEW.custo_aquisicao) OR NOT (OLD.preco_sugerido <=> NEW.preco_sugerido) OR NOT (OLD.preco_minimo <=> NEW.preco_minimo) OR NOT (OLD.status <=> NEW.status) OR NOT (OLD.entrada_em <=> NEW.entrada_em) OR NOT (OLD.encerrado_em <=> NEW.encerrado_em) OR NOT (OLD.veiculo_ativo_id <=> NEW.veiculo_ativo_id) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'itens_estoque', NEW.id, JSON_OBJECT('veiculo_id', OLD.veiculo_id, 'item_origem_id', OLD.item_origem_id, 'custo_aquisicao', OLD.custo_aquisicao, 'preco_sugerido', OLD.preco_sugerido, 'preco_minimo', OLD.preco_minimo, 'status', OLD.status, 'encerrado_em', OLD.encerrado_em), JSON_OBJECT('veiculo_id', NEW.veiculo_id, 'item_origem_id', NEW.item_origem_id, 'custo_aquisicao', NEW.custo_aquisicao, 'preco_sugerido', NEW.preco_sugerido, 'preco_minimo', NEW.preco_minimo, 'status', NEW.status, 'encerrado_em', NEW.encerrado_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.veiculo_id <=> NEW.veiculo_id, JSON_ARRAY(), JSON_ARRAY('veiculo_id')), IF(OLD.item_origem_id <=> NEW.item_origem_id, JSON_ARRAY(), JSON_ARRAY('item_origem_id')), IF(OLD.custo_aquisicao <=> NEW.custo_aquisicao, JSON_ARRAY(), JSON_ARRAY('custo_aquisicao')), IF(OLD.preco_sugerido <=> NEW.preco_sugerido, JSON_ARRAY(), JSON_ARRAY('preco_sugerido')), IF(OLD.preco_minimo <=> NEW.preco_minimo, JSON_ARRAY(), JSON_ARRAY('preco_minimo')), IF(OLD.status <=> NEW.status, JSON_ARRAY(), JSON_ARRAY('status')), IF(OLD.entrada_em <=> NEW.entrada_em, JSON_ARRAY(), JSON_ARRAY('entrada_em')), IF(OLD.encerrado_em <=> NEW.encerrado_em, JSON_ARRAY(), JSON_ARRAY('encerrado_em')), IF(OLD.veiculo_ativo_id <=> NEW.veiculo_ativo_id, JSON_ARRAY(), JSON_ARRAY('veiculo_ativo_id')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_itens_estoque_delete` BEFORE DELETE ON `itens_estoque` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_itens_estoque_delete` AFTER DELETE ON `itens_estoque` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'itens_estoque', OLD.id, JSON_OBJECT('veiculo_id', OLD.veiculo_id, 'item_origem_id', OLD.item_origem_id, 'custo_aquisicao', OLD.custo_aquisicao, 'preco_sugerido', OLD.preco_sugerido, 'preco_minimo', OLD.preco_minimo, 'status', OLD.status, 'encerrado_em', OLD.encerrado_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `lancamentos_financeiros`
--

DROP TABLE IF EXISTS `lancamentos_financeiros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lancamentos_financeiros` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `contrato_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `chave_lancamento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Identificador deterministico para evitar geracao duplicada',
  `natureza` enum('RECEBER','PAGAR') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` enum('VENDA_VEICULO','ENTRADA','CONSULTORIA_CREDITO','ENCARGO','OUTRO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(12,2) NOT NULL,
  `data_vencimento` date NOT NULL,
  `status` enum('PENDENTE','BAIXADO_PARCIALMENTE','BAIXADO','CANCELADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `cancelado_em` datetime(3) DEFAULT NULL,
  `motivo_cancelamento` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `valor_baixado` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_financeiro_lancamentos_escopo` (`organizacao_id`,`loja_id`,`id`),
  UNIQUE KEY `uq_financeiro_lancamento_geracao` (`organizacao_id`,`loja_id`,`contrato_id`,`chave_lancamento`),
  KEY `idx_financeiro_lancamentos_relatorio` (`organizacao_id`,`loja_id`,`status`,`data_vencimento`),
  CONSTRAINT `fk_lancamentos_contrato` FOREIGN KEY (`organizacao_id`, `loja_id`, `contrato_id`) REFERENCES `contratos` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `ck_lancamento_cancelamento` CHECK (((`status` <> _utf8mb4'CANCELADO') or ((`cancelado_em` is not null) and (`motivo_cancelamento` is not null)))),
  CONSTRAINT `ck_lancamento_saldo` CHECK (((`valor_baixado` >= 0) and (`valor_baixado` <= `valor`) and (((`status` = _utf8mb4'PENDENTE') and (`valor_baixado` = 0)) or ((`status` = _utf8mb4'BAIXADO_PARCIALMENTE') and (`valor_baixado` > 0) and (`valor_baixado` < `valor`)) or ((`status` = _utf8mb4'BAIXADO') and (`valor_baixado` = `valor`)) or ((`status` = _utf8mb4'CANCELADO') and (`valor_baixado` = 0))))),
  CONSTRAINT `ck_lancamento_valor` CHECK ((`valor` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_lancamentos_financeiros_insert` AFTER INSERT ON `lancamentos_financeiros` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'lancamentos_financeiros', NEW.id, NULL, JSON_OBJECT('natureza', NEW.natureza, 'categoria', NEW.categoria, 'valor', NEW.valor, 'status', NEW.status, 'cancelado_em', NEW.cancelado_em, 'valor_baixado', NEW.valor_baixado), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_lancamentos_financeiros_update` AFTER UPDATE ON `lancamentos_financeiros` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.contrato_id <=> NEW.contrato_id) OR NOT (OLD.chave_lancamento <=> NEW.chave_lancamento) OR NOT (OLD.natureza <=> NEW.natureza) OR NOT (OLD.categoria <=> NEW.categoria) OR NOT (OLD.descricao <=> NEW.descricao) OR NOT (OLD.valor <=> NEW.valor) OR NOT (OLD.data_vencimento <=> NEW.data_vencimento) OR NOT (OLD.status <=> NEW.status) OR NOT (OLD.cancelado_em <=> NEW.cancelado_em) OR NOT (OLD.motivo_cancelamento <=> NEW.motivo_cancelamento) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) OR NOT (OLD.valor_baixado <=> NEW.valor_baixado) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'lancamentos_financeiros', NEW.id, JSON_OBJECT('natureza', OLD.natureza, 'categoria', OLD.categoria, 'valor', OLD.valor, 'status', OLD.status, 'cancelado_em', OLD.cancelado_em, 'valor_baixado', OLD.valor_baixado), JSON_OBJECT('natureza', NEW.natureza, 'categoria', NEW.categoria, 'valor', NEW.valor, 'status', NEW.status, 'cancelado_em', NEW.cancelado_em, 'valor_baixado', NEW.valor_baixado), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.contrato_id <=> NEW.contrato_id, JSON_ARRAY(), JSON_ARRAY('contrato_id')), IF(OLD.chave_lancamento <=> NEW.chave_lancamento, JSON_ARRAY(), JSON_ARRAY('chave_lancamento')), IF(OLD.natureza <=> NEW.natureza, JSON_ARRAY(), JSON_ARRAY('natureza')), IF(OLD.categoria <=> NEW.categoria, JSON_ARRAY(), JSON_ARRAY('categoria')), IF(OLD.descricao <=> NEW.descricao, JSON_ARRAY(), JSON_ARRAY('descricao')), IF(OLD.valor <=> NEW.valor, JSON_ARRAY(), JSON_ARRAY('valor')), IF(OLD.data_vencimento <=> NEW.data_vencimento, JSON_ARRAY(), JSON_ARRAY('data_vencimento')), IF(OLD.status <=> NEW.status, JSON_ARRAY(), JSON_ARRAY('status')), IF(OLD.cancelado_em <=> NEW.cancelado_em, JSON_ARRAY(), JSON_ARRAY('cancelado_em')), IF(OLD.motivo_cancelamento <=> NEW.motivo_cancelamento, JSON_ARRAY(), JSON_ARRAY('motivo_cancelamento')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em')), IF(OLD.valor_baixado <=> NEW.valor_baixado, JSON_ARRAY(), JSON_ARRAY('valor_baixado'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_lancamentos_financeiros_delete` BEFORE DELETE ON `lancamentos_financeiros` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_lancamentos_financeiros_delete` AFTER DELETE ON `lancamentos_financeiros` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'lancamentos_financeiros', OLD.id, JSON_OBJECT('natureza', OLD.natureza, 'categoria', OLD.categoria, 'valor', OLD.valor, 'status', OLD.status, 'cancelado_em', OLD.cancelado_em, 'valor_baixado', OLD.valor_baixado), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `logs_acesso`
--

DROP TABLE IF EXISTS `logs_acesso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_acesso` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `sessao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `evento` enum('LOGIN_SUCESSO','LOGIN_FALHA','LOGOUT','SESSAO_REVOGADA','ACESSO_NEGADO','REQUISICAO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `requisicao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `metodo` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rota` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Template da rota, sem query string ou dados pessoais',
  `codigo_http` smallint(5) unsigned DEFAULT NULL,
  `duracao_ms` int(10) unsigned DEFAULT NULL,
  `ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agente_usuario` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_acesso_escopo_data` (`organizacao_id`,`loja_id`,`criado_em`),
  KEY `idx_acesso_requisicao` (`requisicao_id`),
  KEY `fk_acesso_usuario` (`organizacao_id`,`usuario_id`),
  KEY `fk_acesso_sessao` (`organizacao_id`,`loja_id`,`usuario_id`,`sessao_id`),
  CONSTRAINT `fk_acesso_loja` FOREIGN KEY (`organizacao_id`, `loja_id`) REFERENCES `lojas` (`organizacao_id`, `id`),
  CONSTRAINT `fk_acesso_organizacao` FOREIGN KEY (`organizacao_id`) REFERENCES `organizacoes` (`id`),
  CONSTRAINT `fk_acesso_sessao` FOREIGN KEY (`organizacao_id`, `loja_id`, `usuario_id`, `sessao_id`) REFERENCES `sessoes_acesso` (`organizacao_id`, `loja_id`, `usuario_id`, `id`),
  CONSTRAINT `fk_acesso_usuario` FOREIGN KEY (`organizacao_id`, `usuario_id`) REFERENCES `usuarios` (`organizacao_id`, `id`),
  CONSTRAINT `ck_acesso_contexto` CHECK (((`organizacao_id` is not null) or (isnull(`loja_id`) and isnull(`usuario_id`) and isnull(`sessao_id`)))),
  CONSTRAINT `ck_acesso_http` CHECK ((isnull(`codigo_http`) or (`codigo_http` between 100 and 599)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_acesso_contexto` BEFORE INSERT ON `logs_acesso` FOR EACH ROW BEGIN
  IF NEW.sessao_id IS NOT NULL AND (NEW.organizacao_id IS NULL OR NEW.loja_id IS NULL OR NEW.usuario_id IS NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sessao exige contexto completo';
  END IF;
  IF NEW.loja_id IS NOT NULL AND NEW.organizacao_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Loja exige organizacao';
  END IF;
  IF NEW.evento = 'LOGIN_SUCESSO' AND NEW.sessao_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Login bem sucedido exige sessao persistida';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_acesso_auditoria` AFTER INSERT ON `logs_acesso` FOR EACH ROW BEGIN
  IF NEW.organizacao_id IS NOT NULL THEN
    INSERT INTO logs_auditoria(id, organizacao_id, loja_id, usuario_id, acao, tipo_entidade, entidade_id,
      detalhes, requisicao_id, sessao_id, ip, conta_banco, conexao_id)
    VALUES (UUID(), NEW.organizacao_id, NEW.loja_id, NEW.usuario_id, NEW.evento, 'logs_acesso', NEW.id,
      JSON_OBJECT('evento',NEW.evento,'codigo_http',NEW.codigo_http,'metodo',NEW.metodo,'rota',NEW.rota),
      NEW.requisicao_id, NEW.sessao_id, NEW.ip, USER(), CONNECTION_ID());
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_logs_acesso_update` BEFORE UPDATE ON `logs_acesso` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Historico imutavel';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_logs_acesso_delete` BEFORE DELETE ON `logs_acesso` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `logs_auditoria`
--

DROP TABLE IF EXISTS `logs_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_auditoria` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL COMMENT 'NULL: evento automatico do sistema',
  `acao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_entidade` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entidade_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `detalhes` json DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `requisicao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `sessao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conta_banco` varchar(288) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conexao_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_auditoria_escopo_data` (`organizacao_id`,`loja_id`,`criado_em`),
  KEY `fk_auditoria_usuario` (`organizacao_id`,`usuario_id`),
  KEY `idx_auditoria_requisicao` (`requisicao_id`),
  CONSTRAINT `fk_auditoria_loja` FOREIGN KEY (`organizacao_id`, `loja_id`) REFERENCES `lojas` (`organizacao_id`, `id`),
  CONSTRAINT `fk_auditoria_organizacao` FOREIGN KEY (`organizacao_id`) REFERENCES `organizacoes` (`id`),
  CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`organizacao_id`, `usuario_id`) REFERENCES `usuarios` (`organizacao_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_logs_auditoria_update` BEFORE UPDATE ON `logs_auditoria` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Historico imutavel';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_logs_auditoria_delete` BEFORE DELETE ON `logs_auditoria` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `lojas`
--

DROP TABLE IF EXISTS `lojas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lojas` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `codigo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cnpj` char(14) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `telefone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cep` char(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logradouro` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `complemento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bairro` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cidade` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fuso_horario` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'America/Sao_Paulo',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `excluido_em` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lojas_organizacao_id` (`organizacao_id`,`id`),
  UNIQUE KEY `uq_lojas_organizacao_codigo` (`organizacao_id`,`codigo`),
  CONSTRAINT `fk_lojas_organizacao` FOREIGN KEY (`organizacao_id`) REFERENCES `organizacoes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_lojas_insert` AFTER INSERT ON `lojas` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.id, 'INSERIR', 'lojas', NEW.id, NULL, JSON_OBJECT('ativo', NEW.ativo, 'excluido_em', NEW.excluido_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_lojas_update` AFTER UPDATE ON `lojas` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.codigo <=> NEW.codigo) OR NOT (OLD.nome <=> NEW.nome) OR NOT (OLD.cnpj <=> NEW.cnpj) OR NOT (OLD.telefone <=> NEW.telefone) OR NOT (OLD.email <=> NEW.email) OR NOT (OLD.cep <=> NEW.cep) OR NOT (OLD.logradouro <=> NEW.logradouro) OR NOT (OLD.numero <=> NEW.numero) OR NOT (OLD.complemento <=> NEW.complemento) OR NOT (OLD.bairro <=> NEW.bairro) OR NOT (OLD.cidade <=> NEW.cidade) OR NOT (OLD.estado <=> NEW.estado) OR NOT (OLD.fuso_horario <=> NEW.fuso_horario) OR NOT (OLD.ativo <=> NEW.ativo) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) OR NOT (OLD.excluido_em <=> NEW.excluido_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.id, 'ALTERAR', 'lojas', NEW.id, JSON_OBJECT('ativo', OLD.ativo, 'excluido_em', OLD.excluido_em), JSON_OBJECT('ativo', NEW.ativo, 'excluido_em', NEW.excluido_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.codigo <=> NEW.codigo, JSON_ARRAY(), JSON_ARRAY('codigo')), IF(OLD.nome <=> NEW.nome, JSON_ARRAY(), JSON_ARRAY('nome')), IF(OLD.cnpj <=> NEW.cnpj, JSON_ARRAY(), JSON_ARRAY('cnpj')), IF(OLD.telefone <=> NEW.telefone, JSON_ARRAY(), JSON_ARRAY('telefone')), IF(OLD.email <=> NEW.email, JSON_ARRAY(), JSON_ARRAY('email')), IF(OLD.cep <=> NEW.cep, JSON_ARRAY(), JSON_ARRAY('cep')), IF(OLD.logradouro <=> NEW.logradouro, JSON_ARRAY(), JSON_ARRAY('logradouro')), IF(OLD.numero <=> NEW.numero, JSON_ARRAY(), JSON_ARRAY('numero')), IF(OLD.complemento <=> NEW.complemento, JSON_ARRAY(), JSON_ARRAY('complemento')), IF(OLD.bairro <=> NEW.bairro, JSON_ARRAY(), JSON_ARRAY('bairro')), IF(OLD.cidade <=> NEW.cidade, JSON_ARRAY(), JSON_ARRAY('cidade')), IF(OLD.estado <=> NEW.estado, JSON_ARRAY(), JSON_ARRAY('estado')), IF(OLD.fuso_horario <=> NEW.fuso_horario, JSON_ARRAY(), JSON_ARRAY('fuso_horario')), IF(OLD.ativo <=> NEW.ativo, JSON_ARRAY(), JSON_ARRAY('ativo')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em')), IF(OLD.excluido_em <=> NEW.excluido_em, JSON_ARRAY(), JSON_ARRAY('excluido_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_lojas_delete` AFTER DELETE ON `lojas` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.id, 'EXCLUIR', 'lojas', OLD.id, JSON_OBJECT('ativo', OLD.ativo, 'excluido_em', OLD.excluido_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `modulos_sistema`
--

DROP TABLE IF EXISTS `modulos_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modulos_sistema` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rota` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `icone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `negocios`
--

DROP TABLE IF EXISTS `negocios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `negocios` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `tipo` enum('VENDA_VEICULO','CONSULTORIA_CREDITO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VENDA_VEICULO',
  `cliente_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `item_estoque_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `veiculo_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `vendedor_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `equipe_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `negocio_origem_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `tabela_financiamento_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `status` enum('SIMULACAO','PROPOSTA','CREDITO_APROVADO','CREDITO_RECUSADO','CONTRATO_EFETIVADO','CANCELADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SIMULACAO',
  `valor_negociado` decimal(12,2) NOT NULL,
  `valor_entrada` decimal(12,2) NOT NULL DEFAULT '0.00',
  `valor_financiado` decimal(12,2) NOT NULL DEFAULT '0.00',
  `valor_encargos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `numero_parcelas` smallint(5) unsigned NOT NULL DEFAULT '0',
  `sistema_amortizacao` enum('PRICE','SAC') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `taxa_juros_mensal` decimal(9,6) NOT NULL DEFAULT '0.000000',
  `valor_parcela` decimal(12,2) DEFAULT NULL COMMENT 'Parcela fixa Price; SAC usa cronograma em snapshot',
  `valor_total` decimal(12,2) NOT NULL,
  `retrato_financeiro` json DEFAULT NULL,
  `motivo_recusa` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `motivo_cancelamento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_contrato` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `efetivado_em` datetime(3) DEFAULT NULL,
  `cancelado_em` datetime(3) DEFAULT NULL,
  `versao` int(10) unsigned NOT NULL DEFAULT '1',
  `item_efetivado_id` char(36) CHARACTER SET ascii COLLATE ascii_bin GENERATED ALWAYS AS ((case when ((`tipo` = _utf8mb4'VENDA_VEICULO') and (`status` = _utf8mb4'CONTRATO_EFETIVADO')) then `item_estoque_id` else NULL end)) STORED,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `excluido_em` datetime(3) DEFAULT NULL,
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_negocios_escopo` (`organizacao_id`,`loja_id`,`id`),
  UNIQUE KEY `uq_negocios_escopo_cliente` (`organizacao_id`,`loja_id`,`id`,`cliente_id`),
  UNIQUE KEY `uq_negocios_efetivacao_item` (`organizacao_id`,`item_efetivado_id`),
  UNIQUE KEY `uq_negocios_contrato_numero` (`organizacao_id`,`loja_id`,`numero_contrato`),
  UNIQUE KEY `uq_negocios_item` (`organizacao_id`,`loja_id`,`id`,`item_estoque_id`),
  KEY `idx_negocios_veiculo_status` (`organizacao_id`,`loja_id`,`veiculo_id`,`status`),
  KEY `idx_negocios_vendedor_data` (`organizacao_id`,`loja_id`,`vendedor_id`,`criado_em`),
  KEY `idx_negocios_status_data` (`organizacao_id`,`loja_id`,`status`,`criado_em`),
  KEY `fk_negocios_cliente` (`organizacao_id`,`loja_id`,`cliente_id`),
  KEY `fk_negocios_veiculo` (`organizacao_id`,`veiculo_id`),
  KEY `fk_negocios_item` (`organizacao_id`,`loja_id`,`item_estoque_id`,`veiculo_id`),
  KEY `fk_negocios_equipe` (`organizacao_id`,`loja_id`,`equipe_id`),
  KEY `fk_negocios_banco` (`organizacao_id`,`loja_id`,`tabela_financiamento_id`),
  KEY `fk_negocios_origem_cliente` (`organizacao_id`,`loja_id`,`negocio_origem_id`,`cliente_id`),
  CONSTRAINT `fk_negocios_banco` FOREIGN KEY (`organizacao_id`, `loja_id`, `tabela_financiamento_id`) REFERENCES `tabelas_financiamento` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_negocios_cliente` FOREIGN KEY (`organizacao_id`, `loja_id`, `cliente_id`) REFERENCES `clientes` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_negocios_equipe` FOREIGN KEY (`organizacao_id`, `loja_id`, `equipe_id`) REFERENCES `equipes` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_negocios_item` FOREIGN KEY (`organizacao_id`, `loja_id`, `item_estoque_id`, `veiculo_id`) REFERENCES `itens_estoque` (`organizacao_id`, `loja_id`, `id`, `veiculo_id`),
  CONSTRAINT `fk_negocios_loja` FOREIGN KEY (`organizacao_id`, `loja_id`) REFERENCES `lojas` (`organizacao_id`, `id`),
  CONSTRAINT `fk_negocios_origem_cliente` FOREIGN KEY (`organizacao_id`, `loja_id`, `negocio_origem_id`, `cliente_id`) REFERENCES `negocios` (`organizacao_id`, `loja_id`, `id`, `cliente_id`),
  CONSTRAINT `fk_negocios_veiculo` FOREIGN KEY (`organizacao_id`, `veiculo_id`) REFERENCES `veiculos` (`organizacao_id`, `id`),
  CONSTRAINT `fk_negocios_vendedor` FOREIGN KEY (`organizacao_id`, `loja_id`, `vendedor_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `ck_negocio_cancelamento_data` CHECK (((`status` <> _utf8mb4'CANCELADO') or ((`cancelado_em` is not null) and (`motivo_cancelamento` is not null)))),
  CONSTRAINT `ck_negocio_efetivacao_data` CHECK (((`status` <> _utf8mb4'CONTRATO_EFETIVADO') or (`efetivado_em` is not null))),
  CONSTRAINT `ck_negocio_valores` CHECK (((`valor_negociado` >= 0) and (`valor_entrada` >= 0) and (`valor_entrada` <= `valor_negociado`) and (`valor_financiado` >= 0) and (`valor_encargos` >= 0) and (`taxa_juros_mensal` >= 0) and (`valor_total` >= 0) and (isnull(`valor_parcela`) or (`valor_parcela` >= 0))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_negocios_validar_insercao` BEFORE INSERT ON `negocios` FOR EACH ROW BEGIN
  IF (NEW.tipo = 'VENDA_VEICULO' AND (NEW.veiculo_id IS NULL OR NEW.item_estoque_id IS NULL))
     OR (NEW.tipo = 'CONSULTORIA_CREDITO' AND (NEW.veiculo_id IS NOT NULL OR NEW.item_estoque_id IS NOT NULL)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Veiculo obrigatorio na venda e ausente na consultoria';
  END IF;
  IF NEW.negocio_origem_id = NEW.id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Negocio nao pode referenciar a si mesmo';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_negocios_origem_insercao` BEFORE INSERT ON `negocios` FOR EACH ROW BEGIN
  IF NEW.negocio_origem_id IS NOT NULL AND (NEW.tipo <> 'CONSULTORIA_CREDITO' OR NOT EXISTS (
    SELECT 1 FROM negocios WHERE id = NEW.negocio_origem_id AND organizacao_id = NEW.organizacao_id
      AND loja_id = NEW.loja_id AND cliente_id = NEW.cliente_id AND tipo = 'VENDA_VEICULO'
  )) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Origem deve ser venda do mesmo cliente para consultoria';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_negocios_inicio` BEFORE INSERT ON `negocios` FOR EACH ROW BEGIN
  IF NEW.status <> 'SIMULACAO' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Negocio deve iniciar em SIMULACAO';
  END IF;
  IF NEW.tipo = 'VENDA_VEICULO' AND NOT EXISTS (
    SELECT 1 FROM itens_estoque WHERE organizacao_id = NEW.organizacao_id AND loja_id = NEW.loja_id
      AND id = NEW.item_estoque_id AND veiculo_id = NEW.veiculo_id
      AND status IN ('DISPONIVEL','EM_NEGOCIACAO','RESERVADO') AND preco_minimo <= NEW.valor_negociado
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estoque indisponivel ou valor abaixo do minimo';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_negocios_insert` AFTER INSERT ON `negocios` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'negocios', NEW.id, NULL, JSON_OBJECT('tipo', NEW.tipo, 'cliente_id', NEW.cliente_id, 'item_estoque_id', NEW.item_estoque_id, 'veiculo_id', NEW.veiculo_id, 'vendedor_id', NEW.vendedor_id, 'equipe_id', NEW.equipe_id, 'status', NEW.status, 'valor_negociado', NEW.valor_negociado, 'valor_total', NEW.valor_total, 'efetivado_em', NEW.efetivado_em, 'cancelado_em', NEW.cancelado_em, 'versao', NEW.versao, 'excluido_em', NEW.excluido_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_negocios_validar_alteracao` BEFORE UPDATE ON `negocios` FOR EACH ROW BEGIN
  IF (NEW.tipo = 'VENDA_VEICULO' AND (NEW.veiculo_id IS NULL OR NEW.item_estoque_id IS NULL))
     OR (NEW.tipo = 'CONSULTORIA_CREDITO' AND (NEW.veiculo_id IS NOT NULL OR NEW.item_estoque_id IS NOT NULL)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Veiculo obrigatorio na venda e ausente na consultoria';
  END IF;
  IF NEW.negocio_origem_id = NEW.id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Negocio nao pode referenciar a si mesmo';
  END IF;
  IF NOT (NEW.organizacao_id <=> OLD.organizacao_id) OR NOT (NEW.loja_id <=> OLD.loja_id)
     OR NOT (NEW.item_estoque_id <=> OLD.item_estoque_id) OR NOT (NEW.tipo <=> OLD.tipo) OR NOT (NEW.veiculo_id <=> OLD.veiculo_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Empresa, loja, tipo e veiculo do negocio sao imutaveis';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_negocios_origem_alteracao` BEFORE UPDATE ON `negocios` FOR EACH ROW BEGIN
  IF NEW.negocio_origem_id IS NOT NULL AND (NEW.tipo <> 'CONSULTORIA_CREDITO' OR NOT EXISTS (
    SELECT 1 FROM negocios WHERE id = NEW.negocio_origem_id AND organizacao_id = NEW.organizacao_id
      AND loja_id = NEW.loja_id AND cliente_id = NEW.cliente_id AND tipo = 'VENDA_VEICULO'
  )) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Origem deve ser venda do mesmo cliente para consultoria';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_negocios_transicao` BEFORE UPDATE ON `negocios` FOR EACH ROW BEGIN
  CALL validar_transicao('NEGOCIO', OLD.status, NEW.status);
  IF OLD.status IN ('CONTRATO_EFETIVADO','CANCELADO','CREDITO_RECUSADO') AND
    (NEW.valor_negociado <> OLD.valor_negociado OR NEW.valor_total <> OLD.valor_total
     OR NEW.valor_entrada <> OLD.valor_entrada OR NEW.valor_financiado <> OLD.valor_financiado
     OR NEW.numero_parcelas <> OLD.numero_parcelas OR NEW.taxa_juros_mensal <> OLD.taxa_juros_mensal
     OR NOT (NEW.vendedor_id <=> OLD.vendedor_id) OR NOT (NEW.cliente_id <=> OLD.cliente_id)
     OR NOT (NEW.retrato_financeiro <=> OLD.retrato_financeiro)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Condicoes de negocio encerrado sao imutaveis';
  END IF;
  IF NEW.status NOT IN ('CONTRATO_EFETIVADO','CANCELADO','CREDITO_RECUSADO') AND NEW.tipo = 'VENDA_VEICULO' AND NOT EXISTS (
    SELECT 1 FROM itens_estoque WHERE organizacao_id = NEW.organizacao_id AND loja_id = NEW.loja_id
      AND id = NEW.item_estoque_id AND status IN ('DISPONIVEL','EM_NEGOCIACAO','RESERVADO') AND preco_minimo <= NEW.valor_negociado
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estoque indisponivel ou valor abaixo do minimo';
  END IF;
  IF NEW.status = 'CONTRATO_EFETIVADO' AND OLD.status <> NEW.status THEN
    IF NOT EXISTS (SELECT 1 FROM contratos WHERE organizacao_id = NEW.organizacao_id AND loja_id = NEW.loja_id
      AND negocio_id = NEW.id AND status = 'EFETIVADO' AND valor = NEW.valor_negociado) OR NEW.numero_contrato IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Efetivacao exige contrato efetivado e numero';
    END IF;
    IF NEW.tipo = 'VENDA_VEICULO' AND EXISTS (
      SELECT 1 FROM reservas_estoque WHERE organizacao_id = NEW.organizacao_id AND loja_id = NEW.loja_id
        AND item_estoque_id = NEW.item_estoque_id AND status = 'ATIVA' AND expira_em > UTC_TIMESTAMP(3) AND negocio_id <> NEW.id
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Item reservado para outro negocio';
    END IF;
    IF NEW.tipo = 'VENDA_VEICULO' AND (NEW.valor_negociado < (SELECT preco_minimo FROM itens_estoque WHERE id = NEW.item_estoque_id)
      OR (SELECT status FROM itens_estoque WHERE id = NEW.item_estoque_id) NOT IN ('DISPONIVEL','EM_NEGOCIACAO','RESERVADO')) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Item indisponivel para efetivacao';
    END IF;
    IF NEW.tipo = 'VENDA_VEICULO' AND NEW.numero_parcelas > 0 AND OLD.status <> 'CREDITO_APROVADO' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Venda financiada exige credito aprovado';
    END IF;
  END IF;
  IF OLD.status = 'CONTRATO_EFETIVADO' AND NEW.status = 'CANCELADO' AND (
    EXISTS (SELECT 1 FROM contratos WHERE negocio_id = OLD.id AND status <> 'CANCELADO')
    OR EXISTS (SELECT 1 FROM comissoes WHERE negocio_id = OLD.id AND status <> 'ESTORNADO')
    OR EXISTS (SELECT 1 FROM lancamentos_financeiros f JOIN contratos c ON c.id = f.contrato_id
      WHERE c.negocio_id = OLD.id AND f.status <> 'CANCELADO')
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cancelar contratos, comissoes e titulos antes do negocio';
  END IF;
  SET NEW.versao = OLD.versao + 1;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_negocios_historico` AFTER UPDATE ON `negocios` FOR EACH ROW BEGIN
  IF NEW.status <> OLD.status THEN
    INSERT INTO historico_status_negocios(id, organizacao_id, loja_id, negocio_id, usuario_id, status_anterior, status_novo, motivo)
    VALUES (UUID(), NEW.organizacao_id, NEW.loja_id, NEW.id, @sva_usuario_id, OLD.status, NEW.status,
      COALESCE(NEW.motivo_cancelamento, NEW.motivo_recusa));
    INSERT INTO fila_eventos(id, organizacao_id, loja_id, tipo, chave_evento, dados)
    VALUES (UUID(), NEW.organizacao_id, NEW.loja_id, 'NEGOCIO_STATUS_ALTERADO', CONCAT('negocio:',NEW.id,':',NEW.versao),
      JSON_OBJECT('negocio_id', NEW.id, 'status', NEW.status, 'versao', NEW.versao));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_negocios_update` AFTER UPDATE ON `negocios` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.tipo <=> NEW.tipo) OR NOT (OLD.cliente_id <=> NEW.cliente_id) OR NOT (OLD.item_estoque_id <=> NEW.item_estoque_id) OR NOT (OLD.veiculo_id <=> NEW.veiculo_id) OR NOT (OLD.vendedor_id <=> NEW.vendedor_id) OR NOT (OLD.equipe_id <=> NEW.equipe_id) OR NOT (OLD.negocio_origem_id <=> NEW.negocio_origem_id) OR NOT (OLD.tabela_financiamento_id <=> NEW.tabela_financiamento_id) OR NOT (OLD.status <=> NEW.status) OR NOT (OLD.valor_negociado <=> NEW.valor_negociado) OR NOT (OLD.valor_entrada <=> NEW.valor_entrada) OR NOT (OLD.valor_financiado <=> NEW.valor_financiado) OR NOT (OLD.valor_encargos <=> NEW.valor_encargos) OR NOT (OLD.numero_parcelas <=> NEW.numero_parcelas) OR NOT (OLD.sistema_amortizacao <=> NEW.sistema_amortizacao) OR NOT (OLD.taxa_juros_mensal <=> NEW.taxa_juros_mensal) OR NOT (OLD.valor_parcela <=> NEW.valor_parcela) OR NOT (OLD.valor_total <=> NEW.valor_total) OR NOT (OLD.retrato_financeiro <=> NEW.retrato_financeiro) OR NOT (OLD.motivo_recusa <=> NEW.motivo_recusa) OR NOT (OLD.motivo_cancelamento <=> NEW.motivo_cancelamento) OR NOT (OLD.numero_contrato <=> NEW.numero_contrato) OR NOT (OLD.efetivado_em <=> NEW.efetivado_em) OR NOT (OLD.cancelado_em <=> NEW.cancelado_em) OR NOT (OLD.versao <=> NEW.versao) OR NOT (OLD.item_efetivado_id <=> NEW.item_efetivado_id) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) OR NOT (OLD.excluido_em <=> NEW.excluido_em) OR NOT (OLD.observacoes <=> NEW.observacoes) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'negocios', NEW.id, JSON_OBJECT('tipo', OLD.tipo, 'cliente_id', OLD.cliente_id, 'item_estoque_id', OLD.item_estoque_id, 'veiculo_id', OLD.veiculo_id, 'vendedor_id', OLD.vendedor_id, 'equipe_id', OLD.equipe_id, 'status', OLD.status, 'valor_negociado', OLD.valor_negociado, 'valor_total', OLD.valor_total, 'efetivado_em', OLD.efetivado_em, 'cancelado_em', OLD.cancelado_em, 'versao', OLD.versao, 'excluido_em', OLD.excluido_em), JSON_OBJECT('tipo', NEW.tipo, 'cliente_id', NEW.cliente_id, 'item_estoque_id', NEW.item_estoque_id, 'veiculo_id', NEW.veiculo_id, 'vendedor_id', NEW.vendedor_id, 'equipe_id', NEW.equipe_id, 'status', NEW.status, 'valor_negociado', NEW.valor_negociado, 'valor_total', NEW.valor_total, 'efetivado_em', NEW.efetivado_em, 'cancelado_em', NEW.cancelado_em, 'versao', NEW.versao, 'excluido_em', NEW.excluido_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.tipo <=> NEW.tipo, JSON_ARRAY(), JSON_ARRAY('tipo')), IF(OLD.cliente_id <=> NEW.cliente_id, JSON_ARRAY(), JSON_ARRAY('cliente_id')), IF(OLD.item_estoque_id <=> NEW.item_estoque_id, JSON_ARRAY(), JSON_ARRAY('item_estoque_id')), IF(OLD.veiculo_id <=> NEW.veiculo_id, JSON_ARRAY(), JSON_ARRAY('veiculo_id')), IF(OLD.vendedor_id <=> NEW.vendedor_id, JSON_ARRAY(), JSON_ARRAY('vendedor_id')), IF(OLD.equipe_id <=> NEW.equipe_id, JSON_ARRAY(), JSON_ARRAY('equipe_id')), IF(OLD.negocio_origem_id <=> NEW.negocio_origem_id, JSON_ARRAY(), JSON_ARRAY('negocio_origem_id')), IF(OLD.tabela_financiamento_id <=> NEW.tabela_financiamento_id, JSON_ARRAY(), JSON_ARRAY('tabela_financiamento_id')), IF(OLD.status <=> NEW.status, JSON_ARRAY(), JSON_ARRAY('status')), IF(OLD.valor_negociado <=> NEW.valor_negociado, JSON_ARRAY(), JSON_ARRAY('valor_negociado')), IF(OLD.valor_entrada <=> NEW.valor_entrada, JSON_ARRAY(), JSON_ARRAY('valor_entrada')), IF(OLD.valor_financiado <=> NEW.valor_financiado, JSON_ARRAY(), JSON_ARRAY('valor_financiado')), IF(OLD.valor_encargos <=> NEW.valor_encargos, JSON_ARRAY(), JSON_ARRAY('valor_encargos')), IF(OLD.numero_parcelas <=> NEW.numero_parcelas, JSON_ARRAY(), JSON_ARRAY('numero_parcelas')), IF(OLD.sistema_amortizacao <=> NEW.sistema_amortizacao, JSON_ARRAY(), JSON_ARRAY('sistema_amortizacao')), IF(OLD.taxa_juros_mensal <=> NEW.taxa_juros_mensal, JSON_ARRAY(), JSON_ARRAY('taxa_juros_mensal')), IF(OLD.valor_parcela <=> NEW.valor_parcela, JSON_ARRAY(), JSON_ARRAY('valor_parcela')), IF(OLD.valor_total <=> NEW.valor_total, JSON_ARRAY(), JSON_ARRAY('valor_total')), IF(OLD.retrato_financeiro <=> NEW.retrato_financeiro, JSON_ARRAY(), JSON_ARRAY('retrato_financeiro')), IF(OLD.motivo_recusa <=> NEW.motivo_recusa, JSON_ARRAY(), JSON_ARRAY('motivo_recusa')), IF(OLD.motivo_cancelamento <=> NEW.motivo_cancelamento, JSON_ARRAY(), JSON_ARRAY('motivo_cancelamento')), IF(OLD.numero_contrato <=> NEW.numero_contrato, JSON_ARRAY(), JSON_ARRAY('numero_contrato')), IF(OLD.efetivado_em <=> NEW.efetivado_em, JSON_ARRAY(), JSON_ARRAY('efetivado_em')), IF(OLD.cancelado_em <=> NEW.cancelado_em, JSON_ARRAY(), JSON_ARRAY('cancelado_em')), IF(OLD.versao <=> NEW.versao, JSON_ARRAY(), JSON_ARRAY('versao')), IF(OLD.item_efetivado_id <=> NEW.item_efetivado_id, JSON_ARRAY(), JSON_ARRAY('item_efetivado_id')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em')), IF(OLD.excluido_em <=> NEW.excluido_em, JSON_ARRAY(), JSON_ARRAY('excluido_em')), IF(OLD.observacoes <=> NEW.observacoes, JSON_ARRAY(), JSON_ARRAY('observacoes'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_negocios_delete` BEFORE DELETE ON `negocios` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_negocios_delete` AFTER DELETE ON `negocios` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'negocios', OLD.id, JSON_OBJECT('tipo', OLD.tipo, 'cliente_id', OLD.cliente_id, 'item_estoque_id', OLD.item_estoque_id, 'veiculo_id', OLD.veiculo_id, 'vendedor_id', OLD.vendedor_id, 'equipe_id', OLD.equipe_id, 'status', OLD.status, 'valor_negociado', OLD.valor_negociado, 'valor_total', OLD.valor_total, 'efetivado_em', OLD.efetivado_em, 'cancelado_em', OLD.cancelado_em, 'versao', OLD.versao, 'excluido_em', OLD.excluido_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `operacoes_idempotentes`
--

DROP TABLE IF EXISTS `operacoes_idempotentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operacoes_idempotentes` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `operacao` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `chave` varchar(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `hash_requisicao` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `status` enum('PROCESSANDO','CONCLUIDA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PROCESSANDO',
  `resultado` json DEFAULT NULL,
  `concluida_em` datetime(3) DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_operacao_chave` (`organizacao_id`,`loja_id`,`usuario_id`,`operacao`,`chave`),
  CONSTRAINT `fk_operacao_usuario` FOREIGN KEY (`organizacao_id`, `loja_id`, `usuario_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `ck_operacao_conclusao` CHECK (((`status` <> _utf8mb4'CONCLUIDA') or ((`concluida_em` is not null) and (`resultado` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_operacoes_idempotentes_insert` AFTER INSERT ON `operacoes_idempotentes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'operacoes_idempotentes', NEW.id, NULL, JSON_OBJECT('usuario_id', NEW.usuario_id, 'chave', NEW.chave, 'status', NEW.status), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_operacoes_idempotentes_update` AFTER UPDATE ON `operacoes_idempotentes` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.usuario_id <=> NEW.usuario_id) OR NOT (OLD.operacao <=> NEW.operacao) OR NOT (OLD.chave <=> NEW.chave) OR NOT (OLD.hash_requisicao <=> NEW.hash_requisicao) OR NOT (OLD.status <=> NEW.status) OR NOT (OLD.resultado <=> NEW.resultado) OR NOT (OLD.concluida_em <=> NEW.concluida_em) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'operacoes_idempotentes', NEW.id, JSON_OBJECT('usuario_id', OLD.usuario_id, 'chave', OLD.chave, 'status', OLD.status), JSON_OBJECT('usuario_id', NEW.usuario_id, 'chave', NEW.chave, 'status', NEW.status), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.usuario_id <=> NEW.usuario_id, JSON_ARRAY(), JSON_ARRAY('usuario_id')), IF(OLD.operacao <=> NEW.operacao, JSON_ARRAY(), JSON_ARRAY('operacao')), IF(OLD.chave <=> NEW.chave, JSON_ARRAY(), JSON_ARRAY('chave')), IF(OLD.hash_requisicao <=> NEW.hash_requisicao, JSON_ARRAY(), JSON_ARRAY('hash_requisicao')), IF(OLD.status <=> NEW.status, JSON_ARRAY(), JSON_ARRAY('status')), IF(OLD.resultado <=> NEW.resultado, JSON_ARRAY(), JSON_ARRAY('resultado')), IF(OLD.concluida_em <=> NEW.concluida_em, JSON_ARRAY(), JSON_ARRAY('concluida_em')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_operacoes_idempotentes_delete` AFTER DELETE ON `operacoes_idempotentes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'operacoes_idempotentes', OLD.id, JSON_OBJECT('usuario_id', OLD.usuario_id, 'chave', OLD.chave, 'status', OLD.status), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `oportunidades_credito`
--

DROP TABLE IF EXISTS `oportunidades_credito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oportunidades_credito` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `cliente_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `negocio_origem_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `responsavel_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `negocio_convertido_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `tipo` enum('REANALISE_CREDITO','CONSULTORIA_CREDITO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REANALISE_CREDITO',
  `status` enum('ABERTA','EM_ATENDIMENTO','CONVERTIDA','ENCERRADA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ABERTA',
  `motivo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `proximo_contato_em` datetime(3) DEFAULT NULL,
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `encerrado_em` datetime(3) DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_oportunidades_credito_escopo` (`organizacao_id`,`loja_id`,`id`),
  UNIQUE KEY `uq_oportunidade_origem` (`organizacao_id`,`loja_id`,`negocio_origem_id`),
  UNIQUE KEY `uq_oportunidade_conversao` (`organizacao_id`,`loja_id`,`negocio_convertido_id`),
  KEY `idx_oportunidades_acompanhamento` (`organizacao_id`,`loja_id`,`responsavel_id`,`status`,`proximo_contato_em`),
  KEY `fk_oportunidades_cliente` (`organizacao_id`,`loja_id`,`cliente_id`),
  KEY `fk_oportunidades_origem` (`organizacao_id`,`loja_id`,`negocio_origem_id`,`cliente_id`),
  KEY `fk_oportunidades_conversao` (`organizacao_id`,`loja_id`,`negocio_convertido_id`,`cliente_id`),
  CONSTRAINT `fk_oportunidades_cliente` FOREIGN KEY (`organizacao_id`, `loja_id`, `cliente_id`) REFERENCES `clientes` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_oportunidades_conversao` FOREIGN KEY (`organizacao_id`, `loja_id`, `negocio_convertido_id`, `cliente_id`) REFERENCES `negocios` (`organizacao_id`, `loja_id`, `id`, `cliente_id`),
  CONSTRAINT `fk_oportunidades_origem` FOREIGN KEY (`organizacao_id`, `loja_id`, `negocio_origem_id`, `cliente_id`) REFERENCES `negocios` (`organizacao_id`, `loja_id`, `id`, `cliente_id`),
  CONSTRAINT `fk_oportunidades_responsavel` FOREIGN KEY (`organizacao_id`, `loja_id`, `responsavel_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `ck_oportunidade_encerramento` CHECK (((`status` not in (_utf8mb4'CONVERTIDA',_utf8mb4'ENCERRADA')) or (`encerrado_em` is not null)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_oportunidade_insercao` BEFORE INSERT ON `oportunidades_credito` FOR EACH ROW BEGIN
  IF NEW.negocio_origem_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM negocios WHERE id = NEW.negocio_origem_id AND organizacao_id = NEW.organizacao_id
      AND loja_id = NEW.loja_id AND cliente_id = NEW.cliente_id AND tipo = 'VENDA_VEICULO'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Origem da oportunidade deve ser venda do mesmo cliente e loja';
  END IF;
  IF (NEW.status = 'CONVERTIDA' AND NEW.negocio_convertido_id IS NULL)
     OR (NEW.status <> 'CONVERTIDA' AND NEW.negocio_convertido_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conversao exige negocio associado e estado CONVERTED';
  END IF;
  IF NEW.negocio_convertido_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM negocios WHERE id = NEW.negocio_convertido_id AND organizacao_id = NEW.organizacao_id
      AND loja_id = NEW.loja_id AND cliente_id = NEW.cliente_id AND tipo = 'CONSULTORIA_CREDITO'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conversao deve apontar consultoria do mesmo cliente e loja';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_oportunidades_credito_insert` AFTER INSERT ON `oportunidades_credito` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'oportunidades_credito', NEW.id, NULL, JSON_OBJECT('cliente_id', NEW.cliente_id, 'responsavel_id', NEW.responsavel_id, 'tipo', NEW.tipo, 'status', NEW.status, 'encerrado_em', NEW.encerrado_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_oportunidade_alteracao` BEFORE UPDATE ON `oportunidades_credito` FOR EACH ROW BEGIN
  IF NEW.negocio_origem_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM negocios WHERE id = NEW.negocio_origem_id AND organizacao_id = NEW.organizacao_id
      AND loja_id = NEW.loja_id AND cliente_id = NEW.cliente_id AND tipo = 'VENDA_VEICULO'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Origem da oportunidade deve ser venda do mesmo cliente e loja';
  END IF;
  IF (NEW.status = 'CONVERTIDA' AND NEW.negocio_convertido_id IS NULL)
     OR (NEW.status <> 'CONVERTIDA' AND NEW.negocio_convertido_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conversao exige negocio associado e estado CONVERTED';
  END IF;
  IF NEW.negocio_convertido_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM negocios WHERE id = NEW.negocio_convertido_id AND organizacao_id = NEW.organizacao_id
      AND loja_id = NEW.loja_id AND cliente_id = NEW.cliente_id AND tipo = 'CONSULTORIA_CREDITO'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conversao deve apontar consultoria do mesmo cliente e loja';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_oportunidades_credito_update` AFTER UPDATE ON `oportunidades_credito` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.cliente_id <=> NEW.cliente_id) OR NOT (OLD.negocio_origem_id <=> NEW.negocio_origem_id) OR NOT (OLD.responsavel_id <=> NEW.responsavel_id) OR NOT (OLD.negocio_convertido_id <=> NEW.negocio_convertido_id) OR NOT (OLD.tipo <=> NEW.tipo) OR NOT (OLD.status <=> NEW.status) OR NOT (OLD.motivo <=> NEW.motivo) OR NOT (OLD.proximo_contato_em <=> NEW.proximo_contato_em) OR NOT (OLD.observacoes <=> NEW.observacoes) OR NOT (OLD.encerrado_em <=> NEW.encerrado_em) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'oportunidades_credito', NEW.id, JSON_OBJECT('cliente_id', OLD.cliente_id, 'responsavel_id', OLD.responsavel_id, 'tipo', OLD.tipo, 'status', OLD.status, 'encerrado_em', OLD.encerrado_em), JSON_OBJECT('cliente_id', NEW.cliente_id, 'responsavel_id', NEW.responsavel_id, 'tipo', NEW.tipo, 'status', NEW.status, 'encerrado_em', NEW.encerrado_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.cliente_id <=> NEW.cliente_id, JSON_ARRAY(), JSON_ARRAY('cliente_id')), IF(OLD.negocio_origem_id <=> NEW.negocio_origem_id, JSON_ARRAY(), JSON_ARRAY('negocio_origem_id')), IF(OLD.responsavel_id <=> NEW.responsavel_id, JSON_ARRAY(), JSON_ARRAY('responsavel_id')), IF(OLD.negocio_convertido_id <=> NEW.negocio_convertido_id, JSON_ARRAY(), JSON_ARRAY('negocio_convertido_id')), IF(OLD.tipo <=> NEW.tipo, JSON_ARRAY(), JSON_ARRAY('tipo')), IF(OLD.status <=> NEW.status, JSON_ARRAY(), JSON_ARRAY('status')), IF(OLD.motivo <=> NEW.motivo, JSON_ARRAY(), JSON_ARRAY('motivo')), IF(OLD.proximo_contato_em <=> NEW.proximo_contato_em, JSON_ARRAY(), JSON_ARRAY('proximo_contato_em')), IF(OLD.observacoes <=> NEW.observacoes, JSON_ARRAY(), JSON_ARRAY('observacoes')), IF(OLD.encerrado_em <=> NEW.encerrado_em, JSON_ARRAY(), JSON_ARRAY('encerrado_em')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_oportunidades_credito_delete` AFTER DELETE ON `oportunidades_credito` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'oportunidades_credito', OLD.id, JSON_OBJECT('cliente_id', OLD.cliente_id, 'responsavel_id', OLD.responsavel_id, 'tipo', OLD.tipo, 'status', OLD.status, 'encerrado_em', OLD.encerrado_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `organizacoes`
--

DROP TABLE IF EXISTS `organizacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizacoes` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `excluido_em` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_organizacoes_insert` AFTER INSERT ON `organizacoes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.id, NULL, 'INSERIR', 'organizacoes', NEW.id, NULL, JSON_OBJECT('ativo', NEW.ativo, 'excluido_em', NEW.excluido_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_organizacoes_update` AFTER UPDATE ON `organizacoes` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.nome <=> NEW.nome) OR NOT (OLD.ativo <=> NEW.ativo) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) OR NOT (OLD.excluido_em <=> NEW.excluido_em) THEN
    CALL registrar_auditoria(NEW.id, NULL, 'ALTERAR', 'organizacoes', NEW.id, JSON_OBJECT('ativo', OLD.ativo, 'excluido_em', OLD.excluido_em), JSON_OBJECT('ativo', NEW.ativo, 'excluido_em', NEW.excluido_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.nome <=> NEW.nome, JSON_ARRAY(), JSON_ARRAY('nome')), IF(OLD.ativo <=> NEW.ativo, JSON_ARRAY(), JSON_ARRAY('ativo')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em')), IF(OLD.excluido_em <=> NEW.excluido_em, JSON_ARRAY(), JSON_ARRAY('excluido_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_organizacoes_delete` AFTER DELETE ON `organizacoes` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.id, NULL, 'EXCLUIR', 'organizacoes', OLD.id, JSON_OBJECT('ativo', OLD.ativo, 'excluido_em', OLD.excluido_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `permissoes_perfil`
--

DROP TABLE IF EXISTS `permissoes_perfil`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissoes_perfil` (
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `perfil` enum('ADMIN','GERENTE','VENDEDOR','SUPORTE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `modulo_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `acao` enum('ACESSAR','CONSULTAR','CRIAR','ALTERAR','EXCLUIR','APROVAR','EXPORTAR','PAGAR','GERENCIAR') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `escopo` enum('PROPRIOS','EQUIPE','LOJA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PROPRIOS',
  `permitido` tinyint(1) NOT NULL DEFAULT '0',
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`organizacao_id`,`loja_id`,`perfil`,`modulo_id`,`acao`),
  KEY `fk_permissoes_modulo` (`modulo_id`),
  CONSTRAINT `fk_permissoes_loja` FOREIGN KEY (`organizacao_id`, `loja_id`) REFERENCES `lojas` (`organizacao_id`, `id`),
  CONSTRAINT `fk_permissoes_modulo` FOREIGN KEY (`modulo_id`) REFERENCES `modulos_sistema` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_permissoes_perfil_insert` AFTER INSERT ON `permissoes_perfil` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'permissoes_perfil', NULL, NULL, JSON_OBJECT('perfil', NEW.perfil, 'modulo_id', NEW.modulo_id, 'acao', NEW.acao, 'escopo', NEW.escopo, 'permitido', NEW.permitido), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_permissoes_perfil_update` AFTER UPDATE ON `permissoes_perfil` FOR EACH ROW BEGIN
  IF NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.perfil <=> NEW.perfil) OR NOT (OLD.modulo_id <=> NEW.modulo_id) OR NOT (OLD.acao <=> NEW.acao) OR NOT (OLD.escopo <=> NEW.escopo) OR NOT (OLD.permitido <=> NEW.permitido) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'permissoes_perfil', NULL, JSON_OBJECT('perfil', OLD.perfil, 'modulo_id', OLD.modulo_id, 'acao', OLD.acao, 'escopo', OLD.escopo, 'permitido', OLD.permitido), JSON_OBJECT('perfil', NEW.perfil, 'modulo_id', NEW.modulo_id, 'acao', NEW.acao, 'escopo', NEW.escopo, 'permitido', NEW.permitido), JSON_MERGE_PRESERVE(IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.perfil <=> NEW.perfil, JSON_ARRAY(), JSON_ARRAY('perfil')), IF(OLD.modulo_id <=> NEW.modulo_id, JSON_ARRAY(), JSON_ARRAY('modulo_id')), IF(OLD.acao <=> NEW.acao, JSON_ARRAY(), JSON_ARRAY('acao')), IF(OLD.escopo <=> NEW.escopo, JSON_ARRAY(), JSON_ARRAY('escopo')), IF(OLD.permitido <=> NEW.permitido, JSON_ARRAY(), JSON_ARRAY('permitido')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_permissoes_perfil_delete` AFTER DELETE ON `permissoes_perfil` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'permissoes_perfil', NULL, JSON_OBJECT('perfil', OLD.perfil, 'modulo_id', OLD.modulo_id, 'acao', OLD.acao, 'escopo', OLD.escopo, 'permitido', OLD.permitido), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `regras_comissao`
--

DROP TABLE IF EXISTS `regras_comissao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regras_comissao` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_negocio` enum('VENDA_VEICULO','CONSULTORIA_CREDITO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `beneficiario` enum('VENDEDOR','GERENTE','SUPORTE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `versao` int(10) unsigned NOT NULL,
  `base` enum('VALOR_NEGOCIADO','MARGEM_BRUTA','FIXO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `percentual` decimal(7,4) DEFAULT NULL,
  `valor_fixo` decimal(12,2) DEFAULT NULL,
  `inicio_vigencia` datetime(3) NOT NULL,
  `fim_vigencia` datetime(3) DEFAULT NULL,
  `publicado_em` datetime(3) DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_regra_escopo` (`organizacao_id`,`loja_id`,`id`),
  UNIQUE KEY `uq_regra_versao` (`organizacao_id`,`loja_id`,`nome`,`versao`),
  KEY `idx_regra_vigencia` (`organizacao_id`,`loja_id`,`tipo_negocio`,`beneficiario`,`inicio_vigencia`),
  CONSTRAINT `fk_regra_loja` FOREIGN KEY (`organizacao_id`, `loja_id`) REFERENCES `lojas` (`organizacao_id`, `id`),
  CONSTRAINT `ck_regra_calculo` CHECK ((((`base` = _utf8mb4'FIXO') and (`valor_fixo` is not null) and (`valor_fixo` >= 0) and isnull(`percentual`)) or ((`base` <> _utf8mb4'FIXO') and (`percentual` is not null) and (`percentual` between 0 and 100) and isnull(`valor_fixo`)))),
  CONSTRAINT `ck_regra_versao` CHECK ((`versao` > 0)),
  CONSTRAINT `ck_regra_vigencia` CHECK ((isnull(`fim_vigencia`) or (`fim_vigencia` > `inicio_vigencia`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_regras_comissao_insert` AFTER INSERT ON `regras_comissao` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'regras_comissao', NEW.id, NULL, JSON_OBJECT('beneficiario', NEW.beneficiario, 'versao', NEW.versao, 'base', NEW.base, 'percentual', NEW.percentual, 'publicado_em', NEW.publicado_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_regras_publicadas` BEFORE UPDATE ON `regras_comissao` FOR EACH ROW BEGIN
  IF OLD.publicado_em IS NOT NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Regra publicada e imutavel: criar nova versao'; END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_regras_comissao_update` AFTER UPDATE ON `regras_comissao` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.nome <=> NEW.nome) OR NOT (OLD.tipo_negocio <=> NEW.tipo_negocio) OR NOT (OLD.beneficiario <=> NEW.beneficiario) OR NOT (OLD.versao <=> NEW.versao) OR NOT (OLD.base <=> NEW.base) OR NOT (OLD.percentual <=> NEW.percentual) OR NOT (OLD.valor_fixo <=> NEW.valor_fixo) OR NOT (OLD.inicio_vigencia <=> NEW.inicio_vigencia) OR NOT (OLD.fim_vigencia <=> NEW.fim_vigencia) OR NOT (OLD.publicado_em <=> NEW.publicado_em) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'regras_comissao', NEW.id, JSON_OBJECT('beneficiario', OLD.beneficiario, 'versao', OLD.versao, 'base', OLD.base, 'percentual', OLD.percentual, 'publicado_em', OLD.publicado_em), JSON_OBJECT('beneficiario', NEW.beneficiario, 'versao', NEW.versao, 'base', NEW.base, 'percentual', NEW.percentual, 'publicado_em', NEW.publicado_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.nome <=> NEW.nome, JSON_ARRAY(), JSON_ARRAY('nome')), IF(OLD.tipo_negocio <=> NEW.tipo_negocio, JSON_ARRAY(), JSON_ARRAY('tipo_negocio')), IF(OLD.beneficiario <=> NEW.beneficiario, JSON_ARRAY(), JSON_ARRAY('beneficiario')), IF(OLD.versao <=> NEW.versao, JSON_ARRAY(), JSON_ARRAY('versao')), IF(OLD.base <=> NEW.base, JSON_ARRAY(), JSON_ARRAY('base')), IF(OLD.percentual <=> NEW.percentual, JSON_ARRAY(), JSON_ARRAY('percentual')), IF(OLD.valor_fixo <=> NEW.valor_fixo, JSON_ARRAY(), JSON_ARRAY('valor_fixo')), IF(OLD.inicio_vigencia <=> NEW.inicio_vigencia, JSON_ARRAY(), JSON_ARRAY('inicio_vigencia')), IF(OLD.fim_vigencia <=> NEW.fim_vigencia, JSON_ARRAY(), JSON_ARRAY('fim_vigencia')), IF(OLD.publicado_em <=> NEW.publicado_em, JSON_ARRAY(), JSON_ARRAY('publicado_em')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_regras_preservar` BEFORE DELETE ON `regras_comissao` FOR EACH ROW BEGIN
  IF OLD.publicado_em IS NOT NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Regra publicada nao pode ser excluida'; END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_regras_comissao_delete` AFTER DELETE ON `regras_comissao` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'regras_comissao', OLD.id, JSON_OBJECT('beneficiario', OLD.beneficiario, 'versao', OLD.versao, 'base', OLD.base, 'percentual', OLD.percentual, 'publicado_em', OLD.publicado_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `reservas_estoque`
--

DROP TABLE IF EXISTS `reservas_estoque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas_estoque` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `item_estoque_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `negocio_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `status` enum('ATIVA','CONSUMIDA','CANCELADA','EXPIRADA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ATIVA',
  `expira_em` datetime(3) NOT NULL,
  `encerrada_em` datetime(3) DEFAULT NULL,
  `item_ativo_id` char(36) CHARACTER SET ascii COLLATE ascii_bin GENERATED ALWAYS AS ((case when (`status` = _utf8mb4'ATIVA') then `item_estoque_id` else NULL end)) STORED,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reserva_ativa` (`organizacao_id`,`item_ativo_id`),
  KEY `idx_reservas_expiracao` (`organizacao_id`,`loja_id`,`status`,`expira_em`),
  KEY `fk_reservas_negocio` (`organizacao_id`,`loja_id`,`negocio_id`,`item_estoque_id`),
  KEY `fk_reservas_usuario` (`organizacao_id`,`loja_id`,`usuario_id`),
  CONSTRAINT `fk_reservas_negocio` FOREIGN KEY (`organizacao_id`, `loja_id`, `negocio_id`, `item_estoque_id`) REFERENCES `negocios` (`organizacao_id`, `loja_id`, `id`, `item_estoque_id`),
  CONSTRAINT `fk_reservas_usuario` FOREIGN KEY (`organizacao_id`, `loja_id`, `usuario_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `ck_reserva_fim` CHECK (((`status` = _utf8mb4'ATIVA') or (`encerrada_em` is not null))),
  CONSTRAINT `ck_reserva_prazo` CHECK ((`expira_em` > `criado_em`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_reservas_validar` BEFORE INSERT ON `reservas_estoque` FOR EACH ROW BEGIN
  DECLARE v_status VARCHAR(30);
  SELECT status INTO v_status FROM itens_estoque WHERE organizacao_id = NEW.organizacao_id AND loja_id = NEW.loja_id
    AND id = NEW.item_estoque_id FOR UPDATE;
  IF NEW.status <> 'ATIVA' OR NEW.expira_em <= UTC_TIMESTAMP(3) OR v_status NOT IN ('DISPONIVEL','EM_NEGOCIACAO','RESERVADO') OR v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reserva exige item disponivel e prazo futuro';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM negocios WHERE id = NEW.negocio_id AND status IN ('SIMULACAO','PROPOSTA','CREDITO_APROVADO')) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reserva exige negocio aberto';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_reservas_estoque_insert` AFTER INSERT ON `reservas_estoque` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'reservas_estoque', NEW.id, NULL, JSON_OBJECT('item_estoque_id', NEW.item_estoque_id, 'negocio_id', NEW.negocio_id, 'usuario_id', NEW.usuario_id, 'status', NEW.status, 'expira_em', NEW.expira_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_reservas_encerrar` BEFORE UPDATE ON `reservas_estoque` FOR EACH ROW BEGIN
  IF NEW.organizacao_id <> OLD.organizacao_id OR NEW.loja_id <> OLD.loja_id OR NEW.item_estoque_id <> OLD.item_estoque_id
    OR NEW.negocio_id <> OLD.negocio_id OR NEW.usuario_id <> OLD.usuario_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Identidade da reserva e imutavel';
  END IF;
  IF OLD.status <> 'ATIVA' AND (NEW.status <> OLD.status OR NEW.expira_em <> OLD.expira_em) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reserva encerrada nao pode ser reativada';
  END IF;
  IF NEW.status = 'ATIVA' AND NEW.expira_em <= UTC_TIMESTAMP(3) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Prazo da reserva deve estar no futuro';
  END IF;
  IF NEW.status <> 'ATIVA' THEN SET NEW.encerrada_em = COALESCE(NEW.encerrada_em, UTC_TIMESTAMP(3)); END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_reservas_estoque_update` AFTER UPDATE ON `reservas_estoque` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.item_estoque_id <=> NEW.item_estoque_id) OR NOT (OLD.negocio_id <=> NEW.negocio_id) OR NOT (OLD.usuario_id <=> NEW.usuario_id) OR NOT (OLD.status <=> NEW.status) OR NOT (OLD.expira_em <=> NEW.expira_em) OR NOT (OLD.encerrada_em <=> NEW.encerrada_em) OR NOT (OLD.item_ativo_id <=> NEW.item_ativo_id) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'reservas_estoque', NEW.id, JSON_OBJECT('item_estoque_id', OLD.item_estoque_id, 'negocio_id', OLD.negocio_id, 'usuario_id', OLD.usuario_id, 'status', OLD.status, 'expira_em', OLD.expira_em), JSON_OBJECT('item_estoque_id', NEW.item_estoque_id, 'negocio_id', NEW.negocio_id, 'usuario_id', NEW.usuario_id, 'status', NEW.status, 'expira_em', NEW.expira_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.item_estoque_id <=> NEW.item_estoque_id, JSON_ARRAY(), JSON_ARRAY('item_estoque_id')), IF(OLD.negocio_id <=> NEW.negocio_id, JSON_ARRAY(), JSON_ARRAY('negocio_id')), IF(OLD.usuario_id <=> NEW.usuario_id, JSON_ARRAY(), JSON_ARRAY('usuario_id')), IF(OLD.status <=> NEW.status, JSON_ARRAY(), JSON_ARRAY('status')), IF(OLD.expira_em <=> NEW.expira_em, JSON_ARRAY(), JSON_ARRAY('expira_em')), IF(OLD.encerrada_em <=> NEW.encerrada_em, JSON_ARRAY(), JSON_ARRAY('encerrada_em')), IF(OLD.item_ativo_id <=> NEW.item_ativo_id, JSON_ARRAY(), JSON_ARRAY('item_ativo_id')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_reservas_estoque_delete` BEFORE DELETE ON `reservas_estoque` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_reservas_estoque_delete` AFTER DELETE ON `reservas_estoque` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'reservas_estoque', OLD.id, JSON_OBJECT('item_estoque_id', OLD.item_estoque_id, 'negocio_id', OLD.negocio_id, 'usuario_id', OLD.usuario_id, 'status', OLD.status, 'expira_em', OLD.expira_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `sessoes_acesso`
--

DROP TABLE IF EXISTS `sessoes_acesso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessoes_acesso` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `hash_sessao` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agente_usuario` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expira_em` datetime(3) NOT NULL,
  `revogada_em` datetime(3) DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sessao_hash` (`hash_sessao`),
  UNIQUE KEY `uq_sessao_escopo` (`organizacao_id`,`loja_id`,`usuario_id`,`id`),
  CONSTRAINT `fk_sessao_usuario` FOREIGN KEY (`organizacao_id`, `loja_id`, `usuario_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `ck_sessao_prazo` CHECK ((`expira_em` > `criado_em`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_sessao_ativa` BEFORE INSERT ON `sessoes_acesso` FOR EACH ROW BEGIN
  IF NEW.revogada_em IS NOT NULL OR NEW.expira_em <= UTC_TIMESTAMP(3) OR NOT EXISTS (
    SELECT 1 FROM usuarios u JOIN usuarios_lojas v ON v.usuario_id=u.id AND v.organizacao_id=u.organizacao_id
      JOIN lojas l ON l.id=v.loja_id AND l.organizacao_id=v.organizacao_id
      JOIN organizacoes o ON o.id=u.organizacao_id
    WHERE u.id=NEW.usuario_id AND u.organizacao_id=NEW.organizacao_id AND v.loja_id=NEW.loja_id
      AND u.ativo AND u.excluido_em IS NULL AND v.ativo AND v.excluido_em IS NULL
      AND l.ativo AND l.excluido_em IS NULL AND o.ativo AND o.excluido_em IS NULL
  ) THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sessao exige usuario, vinculo e loja ativos'; END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_sessoes_acesso_insert` AFTER INSERT ON `sessoes_acesso` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'sessoes_acesso', NEW.id, NULL, JSON_OBJECT('usuario_id', NEW.usuario_id, 'expira_em', NEW.expira_em, 'revogada_em', NEW.revogada_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_sessao_login` AFTER INSERT ON `sessoes_acesso` FOR EACH ROW BEGIN
  INSERT INTO logs_acesso(id, organizacao_id, loja_id, usuario_id, sessao_id, evento, requisicao_id, ip, agente_usuario)
  VALUES (UUID(), NEW.organizacao_id, NEW.loja_id, NEW.usuario_id, NEW.id, 'LOGIN_SUCESSO', @sva_requisicao_id, NEW.ip, NEW.agente_usuario);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_sessao_identidade` BEFORE UPDATE ON `sessoes_acesso` FOR EACH ROW BEGIN
  IF NEW.organizacao_id <> OLD.organizacao_id OR NEW.loja_id <> OLD.loja_id OR NEW.usuario_id <> OLD.usuario_id
    OR NEW.hash_sessao <> OLD.hash_sessao OR NEW.expira_em <> OLD.expira_em
    OR (OLD.revogada_em IS NOT NULL AND NOT (NEW.revogada_em <=> OLD.revogada_em)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sessao imutavel exceto revogacao unica';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_sessoes_acesso_update` AFTER UPDATE ON `sessoes_acesso` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.usuario_id <=> NEW.usuario_id) OR NOT (OLD.hash_sessao <=> NEW.hash_sessao) OR NOT (OLD.ip <=> NEW.ip) OR NOT (OLD.agente_usuario <=> NEW.agente_usuario) OR NOT (OLD.expira_em <=> NEW.expira_em) OR NOT (OLD.revogada_em <=> NEW.revogada_em) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'sessoes_acesso', NEW.id, JSON_OBJECT('usuario_id', OLD.usuario_id, 'expira_em', OLD.expira_em, 'revogada_em', OLD.revogada_em), JSON_OBJECT('usuario_id', NEW.usuario_id, 'expira_em', NEW.expira_em, 'revogada_em', NEW.revogada_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.usuario_id <=> NEW.usuario_id, JSON_ARRAY(), JSON_ARRAY('usuario_id')), IF(OLD.hash_sessao <=> NEW.hash_sessao, JSON_ARRAY(), JSON_ARRAY('hash_sessao')), IF(OLD.ip <=> NEW.ip, JSON_ARRAY(), JSON_ARRAY('ip')), IF(OLD.agente_usuario <=> NEW.agente_usuario, JSON_ARRAY(), JSON_ARRAY('agente_usuario')), IF(OLD.expira_em <=> NEW.expira_em, JSON_ARRAY(), JSON_ARRAY('expira_em')), IF(OLD.revogada_em <=> NEW.revogada_em, JSON_ARRAY(), JSON_ARRAY('revogada_em')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_sessao_logout` AFTER UPDATE ON `sessoes_acesso` FOR EACH ROW BEGIN
  IF OLD.revogada_em IS NULL AND NEW.revogada_em IS NOT NULL THEN
    INSERT INTO logs_acesso(id, organizacao_id, loja_id, usuario_id, sessao_id, evento, requisicao_id, ip, agente_usuario)
    VALUES (UUID(), NEW.organizacao_id, NEW.loja_id, NEW.usuario_id, NEW.id,
      IF(@sva_evento_saida = 'LOGOUT','LOGOUT','SESSAO_REVOGADA'), @sva_requisicao_id, @sva_ip, NEW.agente_usuario);
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_sessoes_acesso_delete` BEFORE DELETE ON `sessoes_acesso` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_sessoes_acesso_delete` AFTER DELETE ON `sessoes_acesso` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'sessoes_acesso', OLD.id, JSON_OBJECT('usuario_id', OLD.usuario_id, 'expira_em', OLD.expira_em, 'revogada_em', OLD.revogada_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tabelas_financiamento`
--

DROP TABLE IF EXISTS `tabelas_financiamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tabelas_financiamento` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `nome_banco` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sistema_amortizacao` enum('PRICE','SAC') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRICE',
  `taxa_juros_mensal` decimal(9,6) NOT NULL COMMENT 'Percentual mensal: 1.500000 = 1,5%',
  `minimo_parcelas` smallint(5) unsigned NOT NULL,
  `maximo_parcelas` smallint(5) unsigned NOT NULL,
  `inicio_vigencia` date NOT NULL,
  `fim_vigencia` date DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `excluido_em` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tabelas_financiamento_escopo` (`organizacao_id`,`loja_id`,`id`),
  CONSTRAINT `fk_tabelas_financiamento_loja` FOREIGN KEY (`organizacao_id`, `loja_id`) REFERENCES `lojas` (`organizacao_id`, `id`),
  CONSTRAINT `ck_banco_condicoes` CHECK (((`taxa_juros_mensal` >= 0) and (`minimo_parcelas` > 0) and (`maximo_parcelas` >= `minimo_parcelas`))),
  CONSTRAINT `ck_banco_vigencia` CHECK ((isnull(`fim_vigencia`) or (`fim_vigencia` >= `inicio_vigencia`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_tabelas_financiamento_insert` AFTER INSERT ON `tabelas_financiamento` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'tabelas_financiamento', NEW.id, NULL, JSON_OBJECT('ativo', NEW.ativo, 'excluido_em', NEW.excluido_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_tabelas_financiamento_update` AFTER UPDATE ON `tabelas_financiamento` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.nome_banco <=> NEW.nome_banco) OR NOT (OLD.nome <=> NEW.nome) OR NOT (OLD.sistema_amortizacao <=> NEW.sistema_amortizacao) OR NOT (OLD.taxa_juros_mensal <=> NEW.taxa_juros_mensal) OR NOT (OLD.minimo_parcelas <=> NEW.minimo_parcelas) OR NOT (OLD.maximo_parcelas <=> NEW.maximo_parcelas) OR NOT (OLD.inicio_vigencia <=> NEW.inicio_vigencia) OR NOT (OLD.fim_vigencia <=> NEW.fim_vigencia) OR NOT (OLD.ativo <=> NEW.ativo) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) OR NOT (OLD.excluido_em <=> NEW.excluido_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'tabelas_financiamento', NEW.id, JSON_OBJECT('ativo', OLD.ativo, 'excluido_em', OLD.excluido_em), JSON_OBJECT('ativo', NEW.ativo, 'excluido_em', NEW.excluido_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.nome_banco <=> NEW.nome_banco, JSON_ARRAY(), JSON_ARRAY('nome_banco')), IF(OLD.nome <=> NEW.nome, JSON_ARRAY(), JSON_ARRAY('nome')), IF(OLD.sistema_amortizacao <=> NEW.sistema_amortizacao, JSON_ARRAY(), JSON_ARRAY('sistema_amortizacao')), IF(OLD.taxa_juros_mensal <=> NEW.taxa_juros_mensal, JSON_ARRAY(), JSON_ARRAY('taxa_juros_mensal')), IF(OLD.minimo_parcelas <=> NEW.minimo_parcelas, JSON_ARRAY(), JSON_ARRAY('minimo_parcelas')), IF(OLD.maximo_parcelas <=> NEW.maximo_parcelas, JSON_ARRAY(), JSON_ARRAY('maximo_parcelas')), IF(OLD.inicio_vigencia <=> NEW.inicio_vigencia, JSON_ARRAY(), JSON_ARRAY('inicio_vigencia')), IF(OLD.fim_vigencia <=> NEW.fim_vigencia, JSON_ARRAY(), JSON_ARRAY('fim_vigencia')), IF(OLD.ativo <=> NEW.ativo, JSON_ARRAY(), JSON_ARRAY('ativo')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em')), IF(OLD.excluido_em <=> NEW.excluido_em, JSON_ARRAY(), JSON_ARRAY('excluido_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_tabelas_financiamento_delete` AFTER DELETE ON `tabelas_financiamento` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'tabelas_financiamento', OLD.id, JSON_OBJECT('ativo', OLD.ativo, 'excluido_em', OLD.excluido_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tarefas_atendimento`
--

DROP TABLE IF EXISTS `tarefas_atendimento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarefas_atendimento` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `atendimento_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `responsavel_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `titulo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDENTE','EM_ANDAMENTO','CONCLUIDA','CANCELADA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDENTE',
  `prazo_em` datetime(3) DEFAULT NULL,
  `concluida_em` datetime(3) DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `fk_tarefa_atendimento` (`organizacao_id`,`loja_id`,`atendimento_id`),
  KEY `fk_tarefa_responsavel` (`organizacao_id`,`loja_id`,`responsavel_id`),
  CONSTRAINT `fk_tarefa_atendimento` FOREIGN KEY (`organizacao_id`, `loja_id`, `atendimento_id`) REFERENCES `atendimentos_credito` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_tarefa_responsavel` FOREIGN KEY (`organizacao_id`, `loja_id`, `responsavel_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`),
  CONSTRAINT `ck_tarefa_conclusao` CHECK (((`status` <> _utf8mb4'CONCLUIDA') or (`concluida_em` is not null)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_tarefa_inicio` BEFORE INSERT ON `tarefas_atendimento` FOR EACH ROW BEGIN
  DECLARE v_status VARCHAR(30);
  SELECT status INTO v_status FROM atendimentos_credito WHERE id = NEW.atendimento_id
    AND organizacao_id = NEW.organizacao_id AND loja_id = NEW.loja_id FOR UPDATE;
  IF NEW.status <> 'PENDENTE' OR v_status IS NULL OR v_status IN ('CONCLUIDO','CANCELADO') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tarefa exige atendimento aberto';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_tarefas_atendimento_insert` AFTER INSERT ON `tarefas_atendimento` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'tarefas_atendimento', NEW.id, NULL, JSON_OBJECT('responsavel_id', NEW.responsavel_id, 'status', NEW.status), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_tarefa_transicao` BEFORE UPDATE ON `tarefas_atendimento` FOR EACH ROW BEGIN
  IF NEW.atendimento_id <> OLD.atendimento_id OR NEW.organizacao_id <> OLD.organizacao_id OR NEW.loja_id <> OLD.loja_id
    OR (OLD.status IN ('CONCLUIDA','CANCELADA') AND NEW.status <> OLD.status) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tarefa encerrada ou identidade imutavel';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_tarefas_atendimento_update` AFTER UPDATE ON `tarefas_atendimento` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.atendimento_id <=> NEW.atendimento_id) OR NOT (OLD.responsavel_id <=> NEW.responsavel_id) OR NOT (OLD.titulo <=> NEW.titulo) OR NOT (OLD.status <=> NEW.status) OR NOT (OLD.prazo_em <=> NEW.prazo_em) OR NOT (OLD.concluida_em <=> NEW.concluida_em) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'tarefas_atendimento', NEW.id, JSON_OBJECT('responsavel_id', OLD.responsavel_id, 'status', OLD.status), JSON_OBJECT('responsavel_id', NEW.responsavel_id, 'status', NEW.status), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.atendimento_id <=> NEW.atendimento_id, JSON_ARRAY(), JSON_ARRAY('atendimento_id')), IF(OLD.responsavel_id <=> NEW.responsavel_id, JSON_ARRAY(), JSON_ARRAY('responsavel_id')), IF(OLD.titulo <=> NEW.titulo, JSON_ARRAY(), JSON_ARRAY('titulo')), IF(OLD.status <=> NEW.status, JSON_ARRAY(), JSON_ARRAY('status')), IF(OLD.prazo_em <=> NEW.prazo_em, JSON_ARRAY(), JSON_ARRAY('prazo_em')), IF(OLD.concluida_em <=> NEW.concluida_em, JSON_ARRAY(), JSON_ARRAY('concluida_em')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_tarefas_atendimento_delete` BEFORE DELETE ON `tarefas_atendimento` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_tarefas_atendimento_delete` AFTER DELETE ON `tarefas_atendimento` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'tarefas_atendimento', OLD.id, JSON_OBJECT('responsavel_id', OLD.responsavel_id, 'status', OLD.status), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tokens_usuario`
--

DROP TABLE IF EXISTS `tokens_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_usuario` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `finalidade` enum('REDEFINICAO_SENHA','CONVITE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hash_token` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `expira_em` datetime(3) NOT NULL,
  `consumido_em` datetime(3) DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tokens_hash` (`hash_token`),
  KEY `idx_tokens_usuario` (`organizacao_id`,`usuario_id`,`finalidade`,`expira_em`),
  CONSTRAINT `fk_tokens_usuario` FOREIGN KEY (`organizacao_id`, `usuario_id`) REFERENCES `usuarios` (`organizacao_id`, `id`),
  CONSTRAINT `ck_token_validade` CHECK ((`expira_em` > `criado_em`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_tokens_usuario_insert` AFTER INSERT ON `tokens_usuario` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NULL, 'INSERIR', 'tokens_usuario', NEW.id, NULL, JSON_OBJECT('usuario_id', NEW.usuario_id, 'expira_em', NEW.expira_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_tokens_usuario_update` AFTER UPDATE ON `tokens_usuario` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.usuario_id <=> NEW.usuario_id) OR NOT (OLD.finalidade <=> NEW.finalidade) OR NOT (OLD.hash_token <=> NEW.hash_token) OR NOT (OLD.expira_em <=> NEW.expira_em) OR NOT (OLD.consumido_em <=> NEW.consumido_em) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NULL, 'ALTERAR', 'tokens_usuario', NEW.id, JSON_OBJECT('usuario_id', OLD.usuario_id, 'expira_em', OLD.expira_em), JSON_OBJECT('usuario_id', NEW.usuario_id, 'expira_em', NEW.expira_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.usuario_id <=> NEW.usuario_id, JSON_ARRAY(), JSON_ARRAY('usuario_id')), IF(OLD.finalidade <=> NEW.finalidade, JSON_ARRAY(), JSON_ARRAY('finalidade')), IF(OLD.hash_token <=> NEW.hash_token, JSON_ARRAY(), JSON_ARRAY('hash_token')), IF(OLD.expira_em <=> NEW.expira_em, JSON_ARRAY(), JSON_ARRAY('expira_em')), IF(OLD.consumido_em <=> NEW.consumido_em, JSON_ARRAY(), JSON_ARRAY('consumido_em')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_tokens_usuario_delete` AFTER DELETE ON `tokens_usuario` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, NULL, 'EXCLUIR', 'tokens_usuario', OLD.id, JSON_OBJECT('usuario_id', OLD.usuario_id, 'expira_em', OLD.expira_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `transferencias_estoque`
--

DROP TABLE IF EXISTS `transferencias_estoque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transferencias_estoque` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Origem',
  `loja_destino_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `item_origem_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `item_destino_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `veiculo_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `motivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_transferencia_origem` (`organizacao_id`,`item_origem_id`),
  UNIQUE KEY `uq_transferencia_destino` (`organizacao_id`,`item_destino_id`),
  KEY `fk_transferencia_origem` (`organizacao_id`,`loja_id`,`item_origem_id`,`veiculo_id`),
  KEY `fk_transferencia_destino` (`organizacao_id`,`loja_destino_id`,`item_destino_id`,`veiculo_id`),
  KEY `fk_transferencia_usuario` (`organizacao_id`,`loja_id`,`usuario_id`),
  CONSTRAINT `fk_transferencia_destino` FOREIGN KEY (`organizacao_id`, `loja_destino_id`, `item_destino_id`, `veiculo_id`) REFERENCES `itens_estoque` (`organizacao_id`, `loja_id`, `id`, `veiculo_id`),
  CONSTRAINT `fk_transferencia_origem` FOREIGN KEY (`organizacao_id`, `loja_id`, `item_origem_id`, `veiculo_id`) REFERENCES `itens_estoque` (`organizacao_id`, `loja_id`, `id`, `veiculo_id`),
  CONSTRAINT `fk_transferencia_usuario` FOREIGN KEY (`organizacao_id`, `loja_id`, `usuario_id`) REFERENCES `usuarios_lojas` (`organizacao_id`, `loja_id`, `usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_transferencias_estoque_insert` AFTER INSERT ON `transferencias_estoque` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'transferencias_estoque', NEW.id, NULL, JSON_OBJECT('loja_destino_id', NEW.loja_destino_id, 'item_origem_id', NEW.item_origem_id, 'veiculo_id', NEW.veiculo_id, 'usuario_id', NEW.usuario_id), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_transferencias_estoque_update` BEFORE UPDATE ON `transferencias_estoque` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Historico imutavel';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_transferencias_estoque_update` AFTER UPDATE ON `transferencias_estoque` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.loja_destino_id <=> NEW.loja_destino_id) OR NOT (OLD.item_origem_id <=> NEW.item_origem_id) OR NOT (OLD.item_destino_id <=> NEW.item_destino_id) OR NOT (OLD.veiculo_id <=> NEW.veiculo_id) OR NOT (OLD.usuario_id <=> NEW.usuario_id) OR NOT (OLD.motivo <=> NEW.motivo) OR NOT (OLD.criado_em <=> NEW.criado_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'transferencias_estoque', NEW.id, JSON_OBJECT('loja_destino_id', OLD.loja_destino_id, 'item_origem_id', OLD.item_origem_id, 'veiculo_id', OLD.veiculo_id, 'usuario_id', OLD.usuario_id), JSON_OBJECT('loja_destino_id', NEW.loja_destino_id, 'item_origem_id', NEW.item_origem_id, 'veiculo_id', NEW.veiculo_id, 'usuario_id', NEW.usuario_id), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.loja_destino_id <=> NEW.loja_destino_id, JSON_ARRAY(), JSON_ARRAY('loja_destino_id')), IF(OLD.item_origem_id <=> NEW.item_origem_id, JSON_ARRAY(), JSON_ARRAY('item_origem_id')), IF(OLD.item_destino_id <=> NEW.item_destino_id, JSON_ARRAY(), JSON_ARRAY('item_destino_id')), IF(OLD.veiculo_id <=> NEW.veiculo_id, JSON_ARRAY(), JSON_ARRAY('veiculo_id')), IF(OLD.usuario_id <=> NEW.usuario_id, JSON_ARRAY(), JSON_ARRAY('usuario_id')), IF(OLD.motivo <=> NEW.motivo, JSON_ARRAY(), JSON_ARRAY('motivo')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_preservar_transferencias_estoque_delete` BEFORE DELETE ON `transferencias_estoque` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Registro historico nao pode ser excluido';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_transferencias_estoque_delete` AFTER DELETE ON `transferencias_estoque` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'transferencias_estoque', OLD.id, JSON_OBJECT('loja_destino_id', OLD.loja_destino_id, 'item_origem_id', OLD.item_origem_id, 'veiculo_id', OLD.veiculo_id, 'usuario_id', OLD.usuario_id), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `transicoes_status`
--

DROP TABLE IF EXISTS `transicoes_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transicoes_status` (
  `dominio` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_anterior` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_novo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`dominio`,`estado_anterior`,`estado_novo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `nome_completo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hash_senha` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url_avatar` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cep` char(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logradouro` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `complemento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bairro` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cidade` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chave_pix` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `administrador_organizacao` tinyint(1) NOT NULL DEFAULT '0',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `primeiro_acesso` tinyint(1) NOT NULL DEFAULT '1',
  `versao_sessao` int(10) unsigned NOT NULL DEFAULT '0',
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `excluido_em` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuarios_organizacao_id` (`organizacao_id`,`id`),
  UNIQUE KEY `uq_usuarios_organizacao_email` (`organizacao_id`,`email`),
  CONSTRAINT `fk_usuarios_organizacao` FOREIGN KEY (`organizacao_id`) REFERENCES `organizacoes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_usuarios_insert` AFTER INSERT ON `usuarios` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NULL, 'INSERIR', 'usuarios', NEW.id, NULL, JSON_OBJECT('ativo', NEW.ativo, 'primeiro_acesso', NEW.primeiro_acesso, 'excluido_em', NEW.excluido_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_usuarios_update` AFTER UPDATE ON `usuarios` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.nome_completo <=> NEW.nome_completo) OR NOT (OLD.email <=> NEW.email) OR NOT (OLD.hash_senha <=> NEW.hash_senha) OR NOT (OLD.telefone <=> NEW.telefone) OR NOT (OLD.url_avatar <=> NEW.url_avatar) OR NOT (OLD.cep <=> NEW.cep) OR NOT (OLD.logradouro <=> NEW.logradouro) OR NOT (OLD.numero <=> NEW.numero) OR NOT (OLD.complemento <=> NEW.complemento) OR NOT (OLD.bairro <=> NEW.bairro) OR NOT (OLD.cidade <=> NEW.cidade) OR NOT (OLD.estado <=> NEW.estado) OR NOT (OLD.chave_pix <=> NEW.chave_pix) OR NOT (OLD.administrador_organizacao <=> NEW.administrador_organizacao) OR NOT (OLD.ativo <=> NEW.ativo) OR NOT (OLD.primeiro_acesso <=> NEW.primeiro_acesso) OR NOT (OLD.versao_sessao <=> NEW.versao_sessao) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) OR NOT (OLD.excluido_em <=> NEW.excluido_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NULL, 'ALTERAR', 'usuarios', NEW.id, JSON_OBJECT('ativo', OLD.ativo, 'primeiro_acesso', OLD.primeiro_acesso, 'excluido_em', OLD.excluido_em), JSON_OBJECT('ativo', NEW.ativo, 'primeiro_acesso', NEW.primeiro_acesso, 'excluido_em', NEW.excluido_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.nome_completo <=> NEW.nome_completo, JSON_ARRAY(), JSON_ARRAY('nome_completo')), IF(OLD.email <=> NEW.email, JSON_ARRAY(), JSON_ARRAY('email')), IF(OLD.hash_senha <=> NEW.hash_senha, JSON_ARRAY(), JSON_ARRAY('hash_senha')), IF(OLD.telefone <=> NEW.telefone, JSON_ARRAY(), JSON_ARRAY('telefone')), IF(OLD.url_avatar <=> NEW.url_avatar, JSON_ARRAY(), JSON_ARRAY('url_avatar')), IF(OLD.cep <=> NEW.cep, JSON_ARRAY(), JSON_ARRAY('cep')), IF(OLD.logradouro <=> NEW.logradouro, JSON_ARRAY(), JSON_ARRAY('logradouro')), IF(OLD.numero <=> NEW.numero, JSON_ARRAY(), JSON_ARRAY('numero')), IF(OLD.complemento <=> NEW.complemento, JSON_ARRAY(), JSON_ARRAY('complemento')), IF(OLD.bairro <=> NEW.bairro, JSON_ARRAY(), JSON_ARRAY('bairro')), IF(OLD.cidade <=> NEW.cidade, JSON_ARRAY(), JSON_ARRAY('cidade')), IF(OLD.estado <=> NEW.estado, JSON_ARRAY(), JSON_ARRAY('estado')), IF(OLD.chave_pix <=> NEW.chave_pix, JSON_ARRAY(), JSON_ARRAY('chave_pix')), IF(OLD.administrador_organizacao <=> NEW.administrador_organizacao, JSON_ARRAY(), JSON_ARRAY('administrador_organizacao')), IF(OLD.ativo <=> NEW.ativo, JSON_ARRAY(), JSON_ARRAY('ativo')), IF(OLD.primeiro_acesso <=> NEW.primeiro_acesso, JSON_ARRAY(), JSON_ARRAY('primeiro_acesso')), IF(OLD.versao_sessao <=> NEW.versao_sessao, JSON_ARRAY(), JSON_ARRAY('versao_sessao')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em')), IF(OLD.excluido_em <=> NEW.excluido_em, JSON_ARRAY(), JSON_ARRAY('excluido_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_usuarios_delete` AFTER DELETE ON `usuarios` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, NULL, 'EXCLUIR', 'usuarios', OLD.id, JSON_OBJECT('ativo', OLD.ativo, 'primeiro_acesso', OLD.primeiro_acesso, 'excluido_em', OLD.excluido_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `usuarios_lojas`
--

DROP TABLE IF EXISTS `usuarios_lojas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_lojas` (
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `loja_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `usuario_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `perfil` enum('ADMIN','GERENTE','VENDEDOR','SUPORTE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VENDEDOR',
  `equipe_id` char(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `meta_mensal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `excluido_em` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`organizacao_id`,`loja_id`,`usuario_id`),
  KEY `idx_vinculos_usuario` (`organizacao_id`,`usuario_id`,`ativo`),
  KEY `fk_vinculos_equipe` (`organizacao_id`,`loja_id`,`equipe_id`),
  CONSTRAINT `fk_vinculos_equipe` FOREIGN KEY (`organizacao_id`, `loja_id`, `equipe_id`) REFERENCES `equipes` (`organizacao_id`, `loja_id`, `id`),
  CONSTRAINT `fk_vinculos_loja` FOREIGN KEY (`organizacao_id`, `loja_id`) REFERENCES `lojas` (`organizacao_id`, `id`),
  CONSTRAINT `fk_vinculos_usuario` FOREIGN KEY (`organizacao_id`, `usuario_id`) REFERENCES `usuarios` (`organizacao_id`, `id`),
  CONSTRAINT `ck_vinculos_meta` CHECK ((`meta_mensal` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_usuarios_lojas_insert` AFTER INSERT ON `usuarios_lojas` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'INSERIR', 'usuarios_lojas', NULL, NULL, JSON_OBJECT('usuario_id', NEW.usuario_id, 'perfil', NEW.perfil, 'equipe_id', NEW.equipe_id, 'ativo', NEW.ativo, 'excluido_em', NEW.excluido_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_usuarios_lojas_update` AFTER UPDATE ON `usuarios_lojas` FOR EACH ROW BEGIN
  IF NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.loja_id <=> NEW.loja_id) OR NOT (OLD.usuario_id <=> NEW.usuario_id) OR NOT (OLD.perfil <=> NEW.perfil) OR NOT (OLD.equipe_id <=> NEW.equipe_id) OR NOT (OLD.meta_mensal <=> NEW.meta_mensal) OR NOT (OLD.ativo <=> NEW.ativo) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) OR NOT (OLD.excluido_em <=> NEW.excluido_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NEW.loja_id, 'ALTERAR', 'usuarios_lojas', NULL, JSON_OBJECT('usuario_id', OLD.usuario_id, 'perfil', OLD.perfil, 'equipe_id', OLD.equipe_id, 'ativo', OLD.ativo, 'excluido_em', OLD.excluido_em), JSON_OBJECT('usuario_id', NEW.usuario_id, 'perfil', NEW.perfil, 'equipe_id', NEW.equipe_id, 'ativo', NEW.ativo, 'excluido_em', NEW.excluido_em), JSON_MERGE_PRESERVE(IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.loja_id <=> NEW.loja_id, JSON_ARRAY(), JSON_ARRAY('loja_id')), IF(OLD.usuario_id <=> NEW.usuario_id, JSON_ARRAY(), JSON_ARRAY('usuario_id')), IF(OLD.perfil <=> NEW.perfil, JSON_ARRAY(), JSON_ARRAY('perfil')), IF(OLD.equipe_id <=> NEW.equipe_id, JSON_ARRAY(), JSON_ARRAY('equipe_id')), IF(OLD.meta_mensal <=> NEW.meta_mensal, JSON_ARRAY(), JSON_ARRAY('meta_mensal')), IF(OLD.ativo <=> NEW.ativo, JSON_ARRAY(), JSON_ARRAY('ativo')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em')), IF(OLD.excluido_em <=> NEW.excluido_em, JSON_ARRAY(), JSON_ARRAY('excluido_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_usuarios_lojas_delete` AFTER DELETE ON `usuarios_lojas` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, OLD.loja_id, 'EXCLUIR', 'usuarios_lojas', NULL, JSON_OBJECT('usuario_id', OLD.usuario_id, 'perfil', OLD.perfil, 'equipe_id', OLD.equipe_id, 'ativo', OLD.ativo, 'excluido_em', OLD.excluido_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `veiculos`
--

DROP TABLE IF EXISTS `veiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `veiculos` (
  `id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `organizacao_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `chassi` varchar(17) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `placa` varchar(7) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `marca` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `modelo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ano_fabricacao` smallint(5) unsigned NOT NULL,
  `ano_modelo` smallint(5) unsigned NOT NULL,
  `codigo_fipe` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mes_referencia_fipe` date DEFAULT NULL,
  `preco_fipe` decimal(12,2) DEFAULT NULL,
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `url_foto_direita` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url_foto_esquerda` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url_foto_frente` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url_foto_traseira` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url_foto_interior` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url_video` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `duracao_video_segundos` decimal(5,2) DEFAULT NULL,
  `criado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `excluido_em` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_veiculos_escopo` (`organizacao_id`,`id`),
  UNIQUE KEY `uq_veiculos_organizacao_chassi` (`organizacao_id`,`chassi`),
  KEY `idx_veiculos_busca` (`organizacao_id`,`marca`,`modelo`,`ano_fabricacao`,`ano_modelo`),
  CONSTRAINT `fk_veiculos_organizacao` FOREIGN KEY (`organizacao_id`) REFERENCES `organizacoes` (`id`),
  CONSTRAINT `ck_veiculo_anos` CHECK (((`ano_fabricacao` between 1886 and 2200) and (`ano_modelo` between 1886 and 2200))),
  CONSTRAINT `ck_veiculo_fipe` CHECK ((isnull(`preco_fipe`) or (`preco_fipe` >= 0))),
  CONSTRAINT `ck_veiculo_video` CHECK (((isnull(`url_video`) and isnull(`duracao_video_segundos`)) or ((`url_video` is not null) and (`duracao_video_segundos` is not null) and (`duracao_video_segundos` > 0) and (`duracao_video_segundos` <= 60))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_veiculos_insert` AFTER INSERT ON `veiculos` FOR EACH ROW BEGIN
  CALL registrar_auditoria(NEW.organizacao_id, NULL, 'INSERIR', 'veiculos', NEW.id, NULL, JSON_OBJECT('excluido_em', NEW.excluido_em), JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_veiculos_update` AFTER UPDATE ON `veiculos` FOR EACH ROW BEGIN
  IF NOT (OLD.id <=> NEW.id) OR NOT (OLD.organizacao_id <=> NEW.organizacao_id) OR NOT (OLD.chassi <=> NEW.chassi) OR NOT (OLD.placa <=> NEW.placa) OR NOT (OLD.marca <=> NEW.marca) OR NOT (OLD.modelo <=> NEW.modelo) OR NOT (OLD.ano_fabricacao <=> NEW.ano_fabricacao) OR NOT (OLD.ano_modelo <=> NEW.ano_modelo) OR NOT (OLD.codigo_fipe <=> NEW.codigo_fipe) OR NOT (OLD.mes_referencia_fipe <=> NEW.mes_referencia_fipe) OR NOT (OLD.preco_fipe <=> NEW.preco_fipe) OR NOT (OLD.descricao <=> NEW.descricao) OR NOT (OLD.url_foto_direita <=> NEW.url_foto_direita) OR NOT (OLD.url_foto_esquerda <=> NEW.url_foto_esquerda) OR NOT (OLD.url_foto_frente <=> NEW.url_foto_frente) OR NOT (OLD.url_foto_traseira <=> NEW.url_foto_traseira) OR NOT (OLD.url_foto_interior <=> NEW.url_foto_interior) OR NOT (OLD.url_video <=> NEW.url_video) OR NOT (OLD.duracao_video_segundos <=> NEW.duracao_video_segundos) OR NOT (OLD.criado_em <=> NEW.criado_em) OR NOT (OLD.atualizado_em <=> NEW.atualizado_em) OR NOT (OLD.excluido_em <=> NEW.excluido_em) THEN
    CALL registrar_auditoria(NEW.organizacao_id, NULL, 'ALTERAR', 'veiculos', NEW.id, JSON_OBJECT('excluido_em', OLD.excluido_em), JSON_OBJECT('excluido_em', NEW.excluido_em), JSON_MERGE_PRESERVE(IF(OLD.id <=> NEW.id, JSON_ARRAY(), JSON_ARRAY('id')), IF(OLD.organizacao_id <=> NEW.organizacao_id, JSON_ARRAY(), JSON_ARRAY('organizacao_id')), IF(OLD.chassi <=> NEW.chassi, JSON_ARRAY(), JSON_ARRAY('chassi')), IF(OLD.placa <=> NEW.placa, JSON_ARRAY(), JSON_ARRAY('placa')), IF(OLD.marca <=> NEW.marca, JSON_ARRAY(), JSON_ARRAY('marca')), IF(OLD.modelo <=> NEW.modelo, JSON_ARRAY(), JSON_ARRAY('modelo')), IF(OLD.ano_fabricacao <=> NEW.ano_fabricacao, JSON_ARRAY(), JSON_ARRAY('ano_fabricacao')), IF(OLD.ano_modelo <=> NEW.ano_modelo, JSON_ARRAY(), JSON_ARRAY('ano_modelo')), IF(OLD.codigo_fipe <=> NEW.codigo_fipe, JSON_ARRAY(), JSON_ARRAY('codigo_fipe')), IF(OLD.mes_referencia_fipe <=> NEW.mes_referencia_fipe, JSON_ARRAY(), JSON_ARRAY('mes_referencia_fipe')), IF(OLD.preco_fipe <=> NEW.preco_fipe, JSON_ARRAY(), JSON_ARRAY('preco_fipe')), IF(OLD.descricao <=> NEW.descricao, JSON_ARRAY(), JSON_ARRAY('descricao')), IF(OLD.url_foto_direita <=> NEW.url_foto_direita, JSON_ARRAY(), JSON_ARRAY('url_foto_direita')), IF(OLD.url_foto_esquerda <=> NEW.url_foto_esquerda, JSON_ARRAY(), JSON_ARRAY('url_foto_esquerda')), IF(OLD.url_foto_frente <=> NEW.url_foto_frente, JSON_ARRAY(), JSON_ARRAY('url_foto_frente')), IF(OLD.url_foto_traseira <=> NEW.url_foto_traseira, JSON_ARRAY(), JSON_ARRAY('url_foto_traseira')), IF(OLD.url_foto_interior <=> NEW.url_foto_interior, JSON_ARRAY(), JSON_ARRAY('url_foto_interior')), IF(OLD.url_video <=> NEW.url_video, JSON_ARRAY(), JSON_ARRAY('url_video')), IF(OLD.duracao_video_segundos <=> NEW.duracao_video_segundos, JSON_ARRAY(), JSON_ARRAY('duracao_video_segundos')), IF(OLD.criado_em <=> NEW.criado_em, JSON_ARRAY(), JSON_ARRAY('criado_em')), IF(OLD.atualizado_em <=> NEW.atualizado_em, JSON_ARRAY(), JSON_ARRAY('atualizado_em')), IF(OLD.excluido_em <=> NEW.excluido_em, JSON_ARRAY(), JSON_ARRAY('excluido_em'))));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_aud_veiculos_delete` AFTER DELETE ON `veiculos` FOR EACH ROW BEGIN
  CALL registrar_auditoria(OLD.organizacao_id, NULL, 'EXCLUIR', 'veiculos', OLD.id, JSON_OBJECT('excluido_em', OLD.excluido_em), NULL, JSON_ARRAY());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `versoes_banco`
--

DROP TABLE IF EXISTS `versoes_banco`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `versoes_banco` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `versao` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hash_instalador` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `tipo` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mysql_versao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `validado_por` varchar(288) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `validado_em` datetime(3) NOT NULL,
  `observacoes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_versao_hash` (`versao`,`hash_instalador`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `vw_margem_estoque`
--

DROP TABLE IF EXISTS `vw_margem_estoque`;
/*!50001 DROP VIEW IF EXISTS `vw_margem_estoque`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_margem_estoque` AS SELECT 
 1 AS `organizacao_id`,
 1 AS `loja_id`,
 1 AS `item_estoque_id`,
 1 AS `veiculo_id`,
 1 AS `custo_aquisicao`,
 1 AS `custos_preparacao`,
 1 AS `custo_total`,
 1 AS `valor_venda`,
 1 AS `margem_bruta`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'sva_db'
--

--
-- Dumping routines for database 'sva_db'
--
/*!50003 DROP PROCEDURE IF EXISTS `autorizar_acao` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `autorizar_acao`(IN p_org CHAR(36), IN p_loja CHAR(36), IN p_modulo VARCHAR(50), IN p_acao VARCHAR(30), OUT p_escopo VARCHAR(20))
BEGIN
  SET p_escopo = NULL;
  IF @sva_usuario_id IS NULL OR NOT (CAST(@sva_organizacao_id AS CHAR CHARACTER SET ascii) <=> CAST(p_org AS CHAR CHARACTER SET ascii)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Contexto autenticado obrigatorio';
  END IF;
  IF @sva_sessao_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM sessoes_acesso WHERE id=@sva_sessao_id
    AND organizacao_id=p_org AND usuario_id=@sva_usuario_id AND loja_id=@sva_loja_id
    AND revogada_em IS NULL AND expira_em>UTC_TIMESTAMP(3)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sessao expirada ou revogada';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM usuarios u JOIN organizacoes o ON o.id = u.organizacao_id
      JOIN lojas l ON l.organizacao_id = o.id AND l.id = p_loja
      WHERE u.id = @sva_usuario_id AND u.organizacao_id = p_org AND u.ativo AND u.excluido_em IS NULL
      AND o.ativo AND o.excluido_em IS NULL AND l.ativo AND l.excluido_em IS NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario ou loja inativos';
  END IF;
  IF EXISTS (SELECT 1 FROM usuarios WHERE id = @sva_usuario_id AND administrador_organizacao) THEN
    SET p_escopo = 'LOJA';
  ELSEIF EXISTS (SELECT 1 FROM usuarios_lojas WHERE organizacao_id = p_org AND loja_id = p_loja
      AND usuario_id = @sva_usuario_id AND ativo AND excluido_em IS NULL AND perfil = 'ADMIN') THEN
    SET p_escopo = 'LOJA';
  ELSE
    SELECT MAX(p.escopo) INTO p_escopo FROM usuarios_lojas u JOIN permissoes_perfil p
      ON p.organizacao_id = u.organizacao_id AND p.loja_id = u.loja_id AND p.perfil = u.perfil
      WHERE u.organizacao_id = p_org AND u.loja_id = p_loja AND u.usuario_id = @sva_usuario_id
      AND u.ativo AND u.excluido_em IS NULL AND p.modulo_id = p_modulo COLLATE utf8mb4_unicode_ci AND p.acao = p_acao COLLATE utf8mb4_unicode_ci AND p.permitido;
  END IF;
  IF p_escopo IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Permissao negada'; END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `autorizar_negocio` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `autorizar_negocio`(IN p_org CHAR(36), IN p_loja CHAR(36), IN p_negocio CHAR(36), IN p_modulo VARCHAR(50), IN p_acao VARCHAR(30))
BEGIN
  DECLARE v_escopo VARCHAR(20);
  CALL autorizar_acao(p_org, p_loja, p_modulo, p_acao, v_escopo);
  IF NOT EXISTS (SELECT 1 FROM negocios n WHERE n.id = p_negocio AND n.organizacao_id = p_org AND n.loja_id = p_loja
    AND n.excluido_em IS NULL AND (v_escopo = 'LOJA' OR n.vendedor_id = @sva_usuario_id OR
      (v_escopo = 'EQUIPE' AND n.equipe_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM usuarios_lojas u WHERE u.organizacao_id = p_org AND u.loja_id = p_loja
          AND u.usuario_id = @sva_usuario_id AND u.equipe_id = n.equipe_id AND u.ativo AND u.excluido_em IS NULL)))) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Negocio inexistente ou fora do escopo';
  END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `cancelar_reserva` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `cancelar_reserva`(IN p_org CHAR(36), IN p_loja CHAR(36), IN p_reserva CHAR(36))
BEGIN
  DECLARE v_item CHAR(36);
  DECLARE v_negocio CHAR(36);
  DECLARE v_status VARCHAR(30);
  SELECT item_estoque_id,negocio_id INTO v_item,v_negocio FROM reservas_estoque
    WHERE id=p_reserva AND organizacao_id=p_org AND loja_id=p_loja;
  IF v_item IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reserva inexistente'; END IF;
  CALL autorizar_negocio(p_org,p_loja,v_negocio,'SIMULATION','ALTERAR');
  SELECT status INTO v_status FROM itens_estoque WHERE id=v_item FOR UPDATE;
  UPDATE reservas_estoque SET status='CANCELADA',encerrada_em=UTC_TIMESTAMP(3) WHERE id=p_reserva AND status='ATIVA';
  IF v_status='RESERVADO' AND NOT EXISTS(SELECT 1 FROM reservas_estoque WHERE item_estoque_id=v_item AND status='ATIVA') THEN
    UPDATE itens_estoque SET status=IF(EXISTS(SELECT 1 FROM negocios WHERE item_estoque_id=v_item
      AND status IN ('SIMULACAO','PROPOSTA','CREDITO_APROVADO') AND excluido_em IS NULL),'EM_NEGOCIACAO','DISPONIVEL') WHERE id=v_item;
  END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `consultar_cliente_compartilhado` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `consultar_cliente_compartilhado`(IN p_org CHAR(36), IN p_destino CHAR(36), IN p_compartilhamento CHAR(36))
BEGIN
  DECLARE v_escopo VARCHAR(20);
  CALL autorizar_acao(p_org,p_destino,'CUSTOMERS','CONSULTAR',v_escopo);
  IF v_escopo <> 'LOJA' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Consulta compartilhada exige escopo LOJA'; END IF;
  SELECT c.id,c.tipo,c.nome_completo,c.razao_social,c.nome_fantasia,c.pessoa_contato,c.telefone,c.email
    FROM compartilhamentos_clientes s JOIN clientes c ON c.organizacao_id=s.organizacao_id AND c.loja_id=s.loja_id AND c.id=s.cliente_id
    JOIN lojas origem ON origem.organizacao_id=s.organizacao_id AND origem.id=s.loja_id
    WHERE s.id=p_compartilhamento AND s.organizacao_id=p_org AND s.loja_destino_id=p_destino
      AND s.revogado_em IS NULL AND s.expira_em>UTC_TIMESTAMP(3) AND c.excluido_em IS NULL
      AND origem.ativo AND origem.excluido_em IS NULL;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `efetivar_negocio` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `efetivar_negocio`(IN p_org CHAR(36), IN p_loja CHAR(36), IN p_negocio CHAR(36), IN p_regra_vendedor CHAR(36))
principal: BEGIN
  DECLARE v_item CHAR(36);
  DECLARE v_status VARCHAR(30);
  DECLARE v_contrato CHAR(36);
  DECLARE v_vendedor CHAR(36);
  DECLARE v_tipo VARCHAR(30);
  DECLARE v_bloqueio VARCHAR(30);
  CALL autorizar_negocio(p_org, p_loja, p_negocio, 'SUPPORT_APPROVAL', 'APROVAR');
  SELECT item_estoque_id INTO v_item FROM negocios WHERE id = p_negocio;
  IF v_item IS NOT NULL THEN SELECT status INTO v_bloqueio FROM itens_estoque WHERE id = v_item FOR UPDATE; END IF;
  SELECT status, vendedor_id, tipo INTO v_status, v_vendedor, v_tipo FROM negocios WHERE id = p_negocio FOR UPDATE;
  IF v_status = 'CONTRATO_EFETIVADO' THEN LEAVE principal; END IF;
  IF p_regra_vendedor IS NULL OR NOT EXISTS (SELECT 1 FROM regras_comissao WHERE id = p_regra_vendedor AND beneficiario = 'VENDEDOR') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Informe regra de comissao do vendedor';
  END IF;
  IF v_item IS NOT NULL THEN
    UPDATE reservas_estoque SET status = 'EXPIRADA', encerrada_em = UTC_TIMESTAMP(3)
      WHERE item_estoque_id = v_item AND status = 'ATIVA' AND expira_em <= UTC_TIMESTAMP(3);
  END IF;
  SELECT id INTO v_contrato FROM contratos WHERE organizacao_id = p_org AND loja_id = p_loja AND negocio_id = p_negocio AND status = 'ASSINADO' FOR UPDATE;
  IF v_contrato IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Contrato assinado obrigatorio'; END IF;
  UPDATE contratos SET status = 'EFETIVADO', efetivado_em = UTC_TIMESTAMP(3) WHERE id = v_contrato;
  UPDATE negocios SET status = 'CONTRATO_EFETIVADO', efetivado_em = UTC_TIMESTAMP(3) WHERE id = p_negocio;
  IF v_item IS NOT NULL THEN
    UPDATE reservas_estoque SET status = 'CONSUMIDA', encerrada_em = UTC_TIMESTAMP(3) WHERE item_estoque_id = v_item AND negocio_id = p_negocio AND status = 'ATIVA';
    UPDATE reservas_estoque SET status = 'CANCELADA', encerrada_em = UTC_TIMESTAMP(3) WHERE item_estoque_id = v_item AND status = 'ATIVA';
    UPDATE itens_estoque SET status = 'VENDIDO', encerrado_em = UTC_TIMESTAMP(3) WHERE id = v_item;
    UPDATE negocios SET status = 'CANCELADO', motivo_cancelamento = 'VEICULO_VENDIDO', cancelado_em = UTC_TIMESTAMP(3)
      WHERE organizacao_id = p_org AND loja_id = p_loja AND item_estoque_id = v_item AND id <> p_negocio
        AND status IN ('SIMULACAO','PROPOSTA','CREDITO_APROVADO');
  END IF;
  CALL gerar_comissao(p_org, p_loja, p_negocio, v_vendedor, p_regra_vendedor);
  INSERT INTO fila_eventos(id, organizacao_id, loja_id, tipo, chave_evento, dados)
    VALUES (UUID(), p_org, p_loja, 'GERAR_DOCUMENTOS_CONTRATO', CONCAT('contrato:',v_contrato,':efetivado'), JSON_OBJECT('contrato_id',v_contrato,'negocio_id',p_negocio));
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `expirar_reservas` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `expirar_reservas`(IN p_org CHAR(36), IN p_loja CHAR(36), IN p_limite INT)
BEGIN
  DECLARE v_fim BOOLEAN DEFAULT FALSE;
  DECLARE v_item CHAR(36);
  DECLARE v_status VARCHAR(30);
  DECLARE v_escopo VARCHAR(20);
  DECLARE itens CURSOR FOR SELECT DISTINCT item_estoque_id FROM reservas_estoque
    WHERE organizacao_id = p_org AND loja_id = p_loja AND status = 'ATIVA' AND expira_em <= UTC_TIMESTAMP(3)
    ORDER BY item_estoque_id LIMIT p_limite;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fim = TRUE;
  CALL autorizar_acao(p_org, p_loja, 'SIMULATION', 'GERENCIAR', v_escopo);
  IF v_escopo <> 'LOJA' OR p_limite NOT BETWEEN 1 AND 1000 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Expiracao exige escopo LOJA e lote entre 1 e 1000'; END IF;
  OPEN itens;
  ciclo: LOOP
    FETCH itens INTO v_item;
    IF v_fim THEN LEAVE ciclo; END IF;
    SELECT status INTO v_status FROM itens_estoque WHERE id = v_item FOR UPDATE;
    UPDATE reservas_estoque SET status = 'EXPIRADA', encerrada_em = UTC_TIMESTAMP(3)
      WHERE item_estoque_id = v_item AND status = 'ATIVA' AND expira_em <= UTC_TIMESTAMP(3);
    IF v_status = 'RESERVADO' AND NOT EXISTS (SELECT 1 FROM reservas_estoque WHERE item_estoque_id = v_item AND status = 'ATIVA') THEN
      UPDATE itens_estoque SET status = IF(EXISTS (SELECT 1 FROM negocios WHERE item_estoque_id = v_item
        AND status IN ('SIMULACAO','PROPOSTA','CREDITO_APROVADO') AND excluido_em IS NULL), 'EM_NEGOCIACAO', 'DISPONIVEL') WHERE id = v_item;
    END IF;
  END LOOP;
  CLOSE itens;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `gerar_comissao` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `gerar_comissao`(IN p_org CHAR(36), IN p_loja CHAR(36), IN p_negocio CHAR(36), IN p_usuario CHAR(36), IN p_regra CHAR(36))
principal: BEGIN
  DECLARE v_tipo VARCHAR(30);
  DECLARE v_base VARCHAR(30);
  DECLARE v_percentual DECIMAL(7,4);
  DECLARE v_fixo DECIMAL(12,2);
  DECLARE v_valor_base DECIMAL(12,2);
  DECLARE v_valor DECIMAL(12,2);
  DECLARE v_versao INT;
  DECLARE v_regra_tipo VARCHAR(30);
  DECLARE v_efetivado DATETIME(3);
  DECLARE v_negocio_tipo VARCHAR(30);
  CALL autorizar_negocio(p_org, p_loja, p_negocio, 'SUPPORT_APPROVAL', 'APROVAR');
  SELECT tipo, efetivado_em, valor_negociado INTO v_negocio_tipo, v_efetivado, v_valor_base
    FROM negocios WHERE id = p_negocio AND status = 'CONTRATO_EFETIVADO' FOR UPDATE;
  IF v_efetivado IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Negocio deve estar efetivado'; END IF;
  SELECT beneficiario, base, percentual, valor_fixo, versao, tipo_negocio INTO v_tipo, v_base, v_percentual, v_fixo, v_versao, v_regra_tipo
    FROM regras_comissao WHERE id = p_regra AND organizacao_id = p_org AND loja_id = p_loja
      AND publicado_em IS NOT NULL AND publicado_em <= v_efetivado AND inicio_vigencia <= v_efetivado
      AND (fim_vigencia IS NULL OR fim_vigencia > v_efetivado);
  IF v_tipo IS NULL OR v_regra_tipo <> v_negocio_tipo THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Regra publicada e vigente obrigatoria'; END IF;
  IF NOT EXISTS (SELECT 1 FROM usuarios_lojas u JOIN usuarios p ON p.id = u.usuario_id AND p.organizacao_id = u.organizacao_id
    WHERE u.organizacao_id = p_org AND u.loja_id = p_loja AND u.usuario_id = p_usuario AND u.ativo AND u.excluido_em IS NULL
      AND p.ativo AND p.excluido_em IS NULL) THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Beneficiario deve estar ativo na loja'; END IF;
  IF v_tipo = 'VENDEDOR' AND p_usuario <> (SELECT vendedor_id FROM negocios WHERE id = p_negocio) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Beneficiario vendedor deve ser o vendedor do negocio';
  END IF;
  IF v_tipo = 'GERENTE' AND NOT EXISTS (SELECT 1 FROM negocios n JOIN equipes e ON e.id = n.equipe_id
    AND e.organizacao_id = n.organizacao_id AND e.loja_id = n.loja_id WHERE n.id = p_negocio AND e.gerente_id = p_usuario) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Beneficiario gerente deve gerir a equipe do negocio';
  END IF;
  IF v_tipo = 'SUPORTE' AND NOT EXISTS (SELECT 1 FROM usuarios_lojas WHERE organizacao_id = p_org AND loja_id = p_loja
    AND usuario_id = p_usuario AND perfil = 'SUPORTE') THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Beneficiario suporte invalido'; END IF;
  IF EXISTS (SELECT 1 FROM comissoes WHERE negocio_id = p_negocio AND usuario_id = p_usuario AND tipo = v_tipo COLLATE utf8mb4_unicode_ci AND regra_id = p_regra) THEN LEAVE principal; END IF;
  IF v_base = 'MARGEM_BRUTA' THEN
    IF v_negocio_tipo <> 'VENDA_VEICULO' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Margem de estoque exige venda de veiculo'; END IF;
    SELECT GREATEST(margem_bruta,0) INTO v_valor_base FROM vw_margem_estoque m JOIN negocios n
      ON n.item_estoque_id = m.item_estoque_id AND n.organizacao_id = m.organizacao_id AND n.loja_id = m.loja_id WHERE n.id = p_negocio;
  END IF;
  IF v_base = 'FIXO' THEN SET v_valor_base = 0; SET v_valor = v_fixo;
  ELSE SET v_valor = ROUND(v_valor_base * v_percentual / 100, 2); END IF;
  INSERT INTO comissoes(id, organizacao_id, loja_id, negocio_id, usuario_id, tipo, base_calculo, percentual, valor, regra_id, retrato_regra)
    VALUES (UUID(), p_org, p_loja, p_negocio, p_usuario, v_tipo, v_valor_base, v_percentual, v_valor, p_regra,
      JSON_OBJECT('regra_id',p_regra,'versao',v_versao,'base',v_base,'percentual',v_percentual,'valor_fixo',v_fixo,'base_calculo',v_valor_base,'valor',v_valor));
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `provisionar_permissoes_loja` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `provisionar_permissoes_loja`(
  IN p_organizacao_id CHAR(36),
  IN p_loja_id CHAR(36)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM lojas l JOIN organizacoes o ON o.id = l.organizacao_id
    WHERE l.id = p_loja_id AND l.organizacao_id = p_organizacao_id
      AND l.ativo = TRUE AND l.excluido_em IS NULL AND o.ativo = TRUE AND o.excluido_em IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Organizacao e loja ativas sao obrigatorias';
  END IF;
  IF (SELECT COUNT(*) FROM modulos_sistema WHERE id IN
    ('SHOWCASE','CUSTOMERS','SIMULATION','TEAM_DASHBOARD','SUPPORT_APPROVAL','BANK_TABLES','COMMISSIONS')) <> 7 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Execute primeiro o catalogo de modulos';
  END IF;

  INSERT INTO permissoes_perfil (organizacao_id, loja_id, perfil, modulo_id, acao, escopo, permitido)
  SELECT p_organizacao_id, p_loja_id, matriz.perfil, matriz.modulo_id, a.acao, matriz.escopo, TRUE
  FROM (
    SELECT 'VENDEDOR' AS perfil, 'SHOWCASE' AS modulo_id, 'LOJA' AS escopo
    UNION ALL SELECT 'VENDEDOR', 'CUSTOMERS', 'PROPRIOS'
    UNION ALL SELECT 'VENDEDOR', 'SIMULATION', 'PROPRIOS'
    UNION ALL SELECT 'GERENTE', 'SHOWCASE', 'LOJA'
    UNION ALL SELECT 'GERENTE', 'CUSTOMERS', 'EQUIPE'
    UNION ALL SELECT 'GERENTE', 'SIMULATION', 'EQUIPE'
    UNION ALL SELECT 'GERENTE', 'TEAM_DASHBOARD', 'EQUIPE'
    UNION ALL SELECT 'SUPORTE', 'SUPPORT_APPROVAL', 'LOJA'
    UNION ALL SELECT 'SUPORTE', 'BANK_TABLES', 'LOJA'
    UNION ALL SELECT 'SUPORTE', 'COMMISSIONS', 'LOJA'
  ) AS matriz
  CROSS JOIN (SELECT 'ACESSAR' AS acao UNION ALL SELECT 'CONSULTAR') AS a
  WHERE TRUE
  ON DUPLICATE KEY UPDATE modulo_id = permissoes_perfil.modulo_id;

  INSERT INTO permissoes_perfil (organizacao_id, loja_id, perfil, modulo_id, acao, escopo, permitido)
  SELECT p_organizacao_id, p_loja_id, matriz.perfil, matriz.modulo_id, matriz.acao, matriz.escopo, TRUE
  FROM (
    SELECT 'VENDEDOR' AS perfil, 'CUSTOMERS' AS modulo_id, 'CRIAR' AS acao, 'PROPRIOS' AS escopo
    UNION ALL SELECT 'VENDEDOR', 'CUSTOMERS', 'ALTERAR', 'PROPRIOS'
    UNION ALL SELECT 'VENDEDOR', 'SIMULATION', 'CRIAR', 'PROPRIOS'
    UNION ALL SELECT 'VENDEDOR', 'SIMULATION', 'ALTERAR', 'PROPRIOS'
    UNION ALL SELECT 'VENDEDOR', 'SIMULATION', 'EXPORTAR', 'PROPRIOS'
    UNION ALL SELECT 'GERENTE', 'CUSTOMERS', 'CRIAR', 'EQUIPE'
    UNION ALL SELECT 'GERENTE', 'CUSTOMERS', 'ALTERAR', 'EQUIPE'
    UNION ALL SELECT 'GERENTE', 'SIMULATION', 'CRIAR', 'EQUIPE'
    UNION ALL SELECT 'GERENTE', 'SIMULATION', 'ALTERAR', 'EQUIPE'
    UNION ALL SELECT 'GERENTE', 'SIMULATION', 'EXPORTAR', 'EQUIPE'
    UNION ALL SELECT 'GERENTE', 'TEAM_DASHBOARD', 'EXPORTAR', 'EQUIPE'
    UNION ALL SELECT 'SUPORTE', 'SUPPORT_APPROVAL', 'APROVAR', 'LOJA'
    UNION ALL SELECT 'SUPORTE', 'BANK_TABLES', 'CRIAR', 'LOJA'
    UNION ALL SELECT 'SUPORTE', 'BANK_TABLES', 'ALTERAR', 'LOJA'
    UNION ALL SELECT 'SUPORTE', 'COMMISSIONS', 'EXPORTAR', 'LOJA'
  ) AS matriz
  WHERE TRUE
  ON DUPLICATE KEY UPDATE modulo_id = permissoes_perfil.modulo_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `recusar_credito` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `recusar_credito`(IN p_org CHAR(36), IN p_loja CHAR(36), IN p_negocio CHAR(36), IN p_motivo VARCHAR(255))
principal: BEGIN
  DECLARE v_item CHAR(36);
  DECLARE v_cliente CHAR(36);
  DECLARE v_status VARCHAR(30);
  DECLARE v_estoque VARCHAR(30);
  CALL autorizar_negocio(p_org,p_loja,p_negocio,'SUPPORT_APPROVAL','APROVAR');
  SELECT item_estoque_id INTO v_item FROM negocios WHERE id=p_negocio;
  IF v_item IS NOT NULL THEN SELECT status INTO v_estoque FROM itens_estoque WHERE id=v_item FOR UPDATE; END IF;
  SELECT status,cliente_id INTO v_status,v_cliente FROM negocios WHERE id=p_negocio FOR UPDATE;
  IF v_status='CREDITO_RECUSADO' THEN LEAVE principal; END IF;
  IF v_status<>'PROPOSTA' OR p_motivo IS NULL OR CHAR_LENGTH(TRIM(p_motivo))=0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Recusa exige proposta e motivo';
  END IF;
  UPDATE negocios SET status='CREDITO_RECUSADO',motivo_recusa=p_motivo WHERE id=p_negocio;
  UPDATE reservas_estoque SET status='CANCELADA',encerrada_em=UTC_TIMESTAMP(3) WHERE negocio_id=p_negocio AND status='ATIVA';
  IF v_item IS NOT NULL AND v_estoque IN ('DISPONIVEL','EM_NEGOCIACAO','RESERVADO') THEN
    UPDATE itens_estoque SET status=IF(EXISTS(SELECT 1 FROM reservas_estoque WHERE item_estoque_id=v_item AND status='ATIVA'),'RESERVADO',
      IF(EXISTS(SELECT 1 FROM negocios WHERE item_estoque_id=v_item AND status IN ('SIMULACAO','PROPOSTA','CREDITO_APROVADO')
        AND excluido_em IS NULL),'EM_NEGOCIACAO','DISPONIVEL')) WHERE id=v_item;
  END IF;
  INSERT INTO aprovacoes_negocio(id,organizacao_id,loja_id,negocio_id,usuario_id,etapa,decisao,observacoes)
    VALUES(UUID(),p_org,p_loja,p_negocio,@sva_usuario_id,'CREDITO','RECUSADO',p_motivo);
  INSERT INTO oportunidades_credito(id,organizacao_id,loja_id,cliente_id,negocio_origem_id,responsavel_id,motivo)
    VALUES(UUID(),p_org,p_loja,v_cliente,p_negocio,@sva_usuario_id,p_motivo);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `registrar_auditoria` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `registrar_auditoria`(IN p_org CHAR(36), IN p_loja CHAR(36), IN p_acao VARCHAR(100),
  IN p_tabela VARCHAR(60), IN p_id CHAR(36), IN p_antes JSON, IN p_depois JSON, IN p_campos JSON)
BEGIN
  IF @sva_organizacao_id IS NOT NULL AND NOT (CAST(@sva_organizacao_id AS CHAR CHARACTER SET ascii) <=> CAST(p_org AS CHAR CHARACTER SET ascii)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Contexto de auditoria de outra organizacao';
  END IF;
  IF @sva_usuario_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM usuarios
    WHERE id = @sva_usuario_id AND organizacao_id = p_org) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ator da auditoria invalido';
  END IF;
  INSERT INTO logs_auditoria(id, organizacao_id, loja_id, usuario_id, acao, tipo_entidade, entidade_id,
    detalhes, requisicao_id, sessao_id, ip, conta_banco, conexao_id)
  VALUES (UUID(), p_org, p_loja, @sva_usuario_id, p_acao, p_tabela, p_id,
    JSON_OBJECT('antes',p_antes,'depois',p_depois,'campos_alterados',p_campos),
    @sva_requisicao_id, @sva_sessao_id, @sva_ip, USER(), CONNECTION_ID());
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `reservar_estoque` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `reservar_estoque`(IN p_org CHAR(36), IN p_loja CHAR(36), IN p_negocio CHAR(36), IN p_reserva CHAR(36), IN p_expira DATETIME(3))
principal: BEGIN
  DECLARE v_item CHAR(36);
  DECLARE v_status VARCHAR(30);
  CALL autorizar_negocio(p_org, p_loja, p_negocio, 'SIMULATION', 'ALTERAR');
  SELECT item_estoque_id INTO v_item FROM negocios WHERE id = p_negocio AND organizacao_id = p_org AND loja_id = p_loja;
  IF v_item IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reserva exige venda de veiculo'; END IF;
  SELECT status INTO v_status FROM itens_estoque WHERE id = v_item AND organizacao_id = p_org AND loja_id = p_loja FOR UPDATE;
  IF EXISTS (SELECT 1 FROM reservas_estoque WHERE id = p_reserva AND organizacao_id = p_org AND loja_id = p_loja
    AND negocio_id = p_negocio AND status = 'ATIVA' AND expira_em = p_expira) THEN LEAVE principal; END IF;
  UPDATE reservas_estoque SET status = 'EXPIRADA', encerrada_em = UTC_TIMESTAMP(3)
    WHERE organizacao_id = p_org AND loja_id = p_loja AND item_estoque_id = v_item AND status = 'ATIVA' AND expira_em <= UTC_TIMESTAMP(3);
  INSERT INTO reservas_estoque(id, organizacao_id, loja_id, item_estoque_id, negocio_id, usuario_id, expira_em)
    VALUES (p_reserva, p_org, p_loja, v_item, p_negocio, @sva_usuario_id, p_expira);
  UPDATE itens_estoque SET status = 'RESERVADO' WHERE id = v_item;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `transferir_estoque` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `transferir_estoque`(IN p_org CHAR(36), IN p_origem CHAR(36), IN p_destino CHAR(36), IN p_item CHAR(36), IN p_novo_item CHAR(36), IN p_transferencia CHAR(36), IN p_motivo VARCHAR(255))
BEGIN
  DECLARE v_escopo VARCHAR(20);
  DECLARE v_status VARCHAR(30);
  DECLARE v_veiculo CHAR(36);
  DECLARE v_custo DECIMAL(12,2);
  DECLARE v_sugerido DECIMAL(12,2);
  DECLARE v_minimo DECIMAL(12,2);
  CALL autorizar_acao(p_org, p_origem, 'SHOWCASE', 'GERENCIAR', v_escopo);
  IF v_escopo <> 'LOJA' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transferencia exige escopo LOJA'; END IF;
  CALL autorizar_acao(p_org, p_destino, 'SHOWCASE', 'GERENCIAR', v_escopo);
  IF v_escopo <> 'LOJA' OR p_origem = p_destino OR p_motivo IS NULL OR CHAR_LENGTH(TRIM(p_motivo)) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Destino distinto, motivo e autorizacao nas duas lojas obrigatorios';
  END IF;
  SELECT status, veiculo_id, custo_aquisicao, preco_sugerido, preco_minimo INTO v_status, v_veiculo, v_custo, v_sugerido, v_minimo
    FROM itens_estoque WHERE organizacao_id = p_org AND loja_id = p_origem AND id = p_item FOR UPDATE;
  IF v_status IS NULL OR v_status NOT IN ('DISPONIVEL','EM_NEGOCIACAO') THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Item indisponivel para transferencia'; END IF;
  IF EXISTS (SELECT 1 FROM reservas_estoque WHERE item_estoque_id = p_item AND status = 'ATIVA') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Expirar ou cancelar reservas antes de transferir';
  END IF;
  SELECT v_custo + COALESCE(SUM(valor),0) INTO v_custo FROM custos_estoque WHERE item_estoque_id = p_item AND estornado_em IS NULL;
  UPDATE contratos c JOIN negocios n ON n.id=c.negocio_id SET c.status='CANCELADO',c.cancelado_em=UTC_TIMESTAMP(3),c.motivo_cancelamento='VEICULO_TRANSFERIDO'
    WHERE n.item_estoque_id=p_item AND c.status IN ('RASCUNHO','ASSINADO');
  UPDATE negocios SET status = 'CANCELADO', motivo_cancelamento = 'VEICULO_TRANSFERIDO', cancelado_em = UTC_TIMESTAMP(3)
    WHERE item_estoque_id = p_item AND status IN ('SIMULACAO','PROPOSTA','CREDITO_APROVADO');
  UPDATE itens_estoque SET status = 'TRANSFERIDO', encerrado_em = UTC_TIMESTAMP(3) WHERE id = p_item;
  INSERT INTO itens_estoque(id, organizacao_id, loja_id, veiculo_id, item_origem_id, custo_aquisicao, preco_sugerido, preco_minimo)
    VALUES (p_novo_item, p_org, p_destino, v_veiculo, p_item, v_custo, v_sugerido, v_minimo);
  INSERT INTO transferencias_estoque(id, organizacao_id, loja_id, loja_destino_id, item_origem_id, item_destino_id, veiculo_id, usuario_id, motivo)
    VALUES (p_transferencia, p_org, p_origem, p_destino, p_item, p_novo_item, v_veiculo, @sva_usuario_id, p_motivo);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `validar_transicao` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `validar_transicao`(IN p_dominio VARCHAR(30), IN p_anterior VARCHAR(30), IN p_novo VARCHAR(30))
BEGIN
  IF NOT (p_anterior <=> p_novo) AND NOT EXISTS (
    SELECT 1 FROM transicoes_status WHERE dominio COLLATE utf8mb4_unicode_ci = p_dominio COLLATE utf8mb4_unicode_ci AND estado_anterior COLLATE utf8mb4_unicode_ci = p_anterior COLLATE utf8mb4_unicode_ci AND estado_novo COLLATE utf8mb4_unicode_ci = p_novo COLLATE utf8mb4_unicode_ci
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transicao de estado nao permitida';
  END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `vw_margem_estoque`
--

/*!50001 DROP VIEW IF EXISTS `vw_margem_estoque`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_margem_estoque` AS select `i`.`organizacao_id` AS `organizacao_id`,`i`.`loja_id` AS `loja_id`,`i`.`id` AS `item_estoque_id`,`i`.`veiculo_id` AS `veiculo_id`,`i`.`custo_aquisicao` AS `custo_aquisicao`,coalesce(`c`.`total`,0) AS `custos_preparacao`,(`i`.`custo_aquisicao` + coalesce(`c`.`total`,0)) AS `custo_total`,`n`.`valor_negociado` AS `valor_venda`,((`n`.`valor_negociado` - `i`.`custo_aquisicao`) - coalesce(`c`.`total`,0)) AS `margem_bruta` from ((`itens_estoque` `i` left join (select `custos_estoque`.`organizacao_id` AS `organizacao_id`,`custos_estoque`.`loja_id` AS `loja_id`,`custos_estoque`.`item_estoque_id` AS `item_estoque_id`,sum(`custos_estoque`.`valor`) AS `total` from `custos_estoque` where isnull(`custos_estoque`.`estornado_em`) group by `custos_estoque`.`organizacao_id`,`custos_estoque`.`loja_id`,`custos_estoque`.`item_estoque_id`) `c` on(((`c`.`organizacao_id` = `i`.`organizacao_id`) and (`c`.`loja_id` = `i`.`loja_id`) and (`c`.`item_estoque_id` = `i`.`id`)))) left join `negocios` `n` on(((`n`.`organizacao_id` = `i`.`organizacao_id`) and (`n`.`loja_id` = `i`.`loja_id`) and (`n`.`item_estoque_id` = `i`.`id`) and (`n`.`status` = 'CONTRATO_EFETIVADO')))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-22  8:23:06
