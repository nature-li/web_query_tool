CREATE DATABASE experiment;

DROP TABLE IF EXISTS `layer`;
CREATE TABLE IF NOT EXISTS `layer` (
  `id`          INT           NOT NULL AUTO_INCREMENT,
  `product`     VARCHAR(128)  NOT NULL,
  `layer`       VARCHAR(128)  NOT NULL,
  `position`    VARCHAR(128)  NOT NULL,
  `min_value`   INT           NOT NULL,
  `max_value`   INT           NOT NULL,
  `algo_id`     VARCHAR(256)  NOT NULL,
  `enable`     INT           NOT NULL DEFAULT 1,
  `create_time` TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
)
  DEFAULT CHARSET = utf8;