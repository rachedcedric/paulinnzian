-- New status "Expédié vers Paris", per-order pricing (article type + frozen rate), new tariffs.
ALTER TABLE `orders`
    MODIFY `status` ENUM('PENDING', 'PURCHASED', 'SHIPPED_PARIS', 'RECEIVED_PARIS', 'SHIPPED_DESTINATION', 'ARRIVED_DESTINATION', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PURCHASED',
    ADD COLUMN `articleType` ENUM('STANDARD', 'LUXE') NOT NULL DEFAULT 'STANDARD',
    ADD COLUMN `kgRate` DOUBLE NULL,
    ADD COLUMN `luxePercent` DOUBLE NULL;

ALTER TABLE `tracking_events`
    MODIFY `status` ENUM('PENDING', 'PURCHASED', 'SHIPPED_PARIS', 'RECEIVED_PARIS', 'SHIPPED_DESTINATION', 'ARRIVED_DESTINATION', 'DELIVERED', 'CANCELLED') NOT NULL;

-- Freeze the per-kg price existing orders were billed at, BEFORE the tariffs change below.
UPDATE `orders`
SET `kgRate` = (
    SELECT `price` FROM `shipping_rates`
    WHERE `pricingType` = 'PER_KG' AND `isActive` = 1 AND `price` IS NOT NULL
    ORDER BY `displayOrder` ASC LIMIT 1
);

-- Tariffs (rows are matched by their seed id or name; edit them in /admin/tarifs if yours differ).
UPDATE `shipping_rates`
SET `price` = 9800, `estimatedDelivery` = '1 à 2 semaines après la réception du colis en France'
WHERE `id` = 'standard' OR `name` = 'Standard';

UPDATE `shipping_rates`
SET `price` = 15000, `estimatedDelivery` = 'Départ Paris - Abidjan tous les vendredis'
WHERE `id` = 'express' OR `name` = 'Express';

UPDATE `shipping_rates`
SET `name` = 'Articles de Luxe et Appareils', `percentage` = 10,
    `description` = '10 % du montant de la commande (Gucci, Chanel, téléphones, ordinateurs, etc.)'
WHERE `id` = 'luxe' OR `name` = 'Articles de Luxe';

-- Merged into "Articles de Luxe et Appareils" (kept, only hidden).
UPDATE `shipping_rates` SET `isActive` = 0 WHERE `id` = 'electronique' OR `name` = 'Appareils Électroniques';

-- FAQ delays, only when the answer is still the original text.
UPDATE `faqs`
SET `answer` = 'Les délais varient selon le mode d''expédition choisi. Standard : 1 à 2 semaines après la réception du colis en France. Express : départ Paris - Abidjan tous les vendredis.'
WHERE `id` = 'faq-2' AND `answer` LIKE '%Standard : 3 à 7 jours%';
