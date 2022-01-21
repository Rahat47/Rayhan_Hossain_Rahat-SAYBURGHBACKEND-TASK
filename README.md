# Sayburgh Task Blog API

Develop a simple blogging application using Express.js and MongoDB with following features:

-   Authenticated users can write blogs and attach multiple tags to them.
-   Other authenticated users can comment on blogs.
-   Only the creator of the blog will have the ability to update or delete that.
-   Authentication has to be stateless using JWT or some other technique.

## [Live API](https://sayburgh-task.herokuapp.com/)

## API Reference

#### Authentication

-   [Authentication Documentations](https://documenter.getpostman.com/view/13590337/UVXonEKi)

#### Blogs

-   [Blogs Documentations](https://documenter.getpostman.com/view/13590337/UVXonEPz)

#### Comments

-   [Comments Documentations](https://documenter.getpostman.com/view/13590337/UVXonEKZ)

## Features

-   JWT stateless Authentication
-   Refresh Tokens with Cookies
-   Basic Security
-   Error Handling
-   Advanced Data filtering and Sorting
-   Password Hashing with argon2

## Tech Stack

**Server:** Node, Express, Mongoose, MongoDB, argon2, JWT

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DB_PASSWORD`

`DB_USER`

`DB_NAME`

`JWT_EXPIRES_IN`

`JWT_SECRET`

`JWT_COOKIE_EXPIRES_IN`

## Run Locally

Clone the project

```bash
  git clone https://github.com/Rahat47/Rayhan_Hossain_Rahat-SAYBURGHBACKEND-TASK.git
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

## Authors

-   [@Rahat47](https://www.github.com/Rahat47)
