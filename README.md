# webapp

## Deployment Instructions
1. Install Node 14.18 and the included npm
2. clone the repository
3. run 'npm install' in the cloned directory to download the required dependencies
4. run 'npm start' to start the server
5. start your mysql server and make sure you have a database called 'csye6225' containing a table called 'user' with the specified schema below
6. configure /config/db.config.js with your database url and credentials
7. send api requests to the server

## Database schema (SQL)

--
-- Database: `csye6225`
--

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `account_created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `account_updated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


ALTER TABLE `user`
  ADD PRIMARY KEY (`id`,`username`);

ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;