-- AlterTable
ALTER TABLE `Training` ADD COLUMN `discount_percentage` INTEGER NULL,
    ADD COLUMN `original_fee` DECIMAL(10, 2) NULL,
    MODIFY `description` TEXT NULL;
