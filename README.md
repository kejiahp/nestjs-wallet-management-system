# Wallet management system

**NOTE:** _This project will not be completed due to paystacks limitations on starter business accounts, preventing implementation of features such as Withdrawals(payouts/tranfers). Sidenote: I learnt what i wanted to learn so 🤷‍♂️_

### On heaven and earth, I alone am honored 🤞

I developed this project to serve as an system allowing registered users to store money in virtual wallets, withdraw money from the wallets and lock money for a duration and release it on a specified date back into their wallets.

This project was built using a progressive nodejs framework, [Nestjs](https://nestjs.com/ 'Nestjs'), the underlying payment service's are provided by [Paystack](https://paystack.com/ 'Paystack'), as for data storage I used a Redis container for caching, a Postgres container for data persistence and Cloudinary for image storage, [Prisma](https://www.prisma.io/ 'Prisma') is my ORM of choice.

##### Pending features

- Withdrawal of money from waller.
- Track money withdrawn through webhooks.
- Send apporiate mails to users based on the webhook tracking results.
- Lock their money, escrow stuff.
- Setup dynamic schedules to hold users money for a specified period of time.
- Release users money back into there wallet once the time is right.
- I guess thats all

##### Run the project

- Create a .env file in the project root directory.
- Ensure all the environment variables are provided as described in the [env.example.txt](https://github.com/kejiahp/wallet-management-system/blob/5f9d39767551b8378667a34a09ce78656535a2c0/env.example.txt, 'env.example.txt') file.
- run `docker compose up -d`
- run `npm run start:dev`
- server should be runing on [http://localhost:<PORT>/api/v1](http://localhost:<PORT>/api/v1)
