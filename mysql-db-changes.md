## MYSQL DB Changes

To alter the password type run the following command.

```bash
ALTER TABLE `user`
CHANGE `user_password` `user_password` LONGTEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;
```
