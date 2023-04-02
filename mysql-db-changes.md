## MYSQL DB Changes

To alter the password type run the following command.

```bash
ALTER TABLE `user`
CHANGE `user_password` `user_password` LONGTEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;
```

subscription table:

```bash
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subscription_type VARCHAR(255) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);
```

chats Table:

```bash
CREATE TABLE `msdev`.`chats` ( `id` INT NOT NULL AUTO_INCREMENT , `car_crawled_id` INT NOT NULL , `from_user` INT NOT NULL , `to_user` INT NOT NULL , `message` LONGTEXT NULL DEFAULT NULL , `attachment` LONGTEXT NULL DEFAULT NULL , `is_read` INT NOT NULL DEFAULT '0' , `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , `deleted_at` TIMESTAMP NULL DEFAULT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
```

user Table alter:

```bash
ALTER TABLE `user` ADD `is_admin` BOOLEAN NOT NULL DEFAULT FALSE AFTER `user_password_ori`;
```

leads Table alter:

```bash
ALTER TABLE `leads` CHANGE `id` `id` INT NOT NULL AUTO_INCREMENT, add PRIMARY KEY (`id`), CHANGE `is_verified` `is_verified` VARCHAR(100) NULL DEFAULT NULL, CHANGE `status` `status` VARCHAR(100) NULL DEFAULT NULL, ADD `city` VARCHAR(100) NULL DEFAULT NULL AFTER `price`;
```

remove status column from Leads Table:

```bash
ALTER TABLE `leads` DROP `status`;
```

add columns in subscription table

```bash
ALTER TABLE `subscriptions` ADD `subscription_id` VARCHAR(255) NOT NULL AFTER `user_id`, ADD `currency` TEXT NOT NULL AFTER `subscription_id`, ADD `payment_id` VARCHAR(255) NOT NULL AFTER `currency`;
```

change payment_id to product and add stripe customer_id

```bash
ALTER TABLE `subscriptions` CHANGE `payment_id` `product` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL، ADD `customer_id` VARCHAR(255) NOT NULL AFTER `subscription_id`;
```
