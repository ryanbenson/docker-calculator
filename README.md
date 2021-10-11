# Fib Calculator

This example will allow a user to enter a value, and get the fib sequence value. It will use Postgres to house the values, and redis to know values I sent. It uses React as the UI/FE, Express as the API that connects to both Redis and Postgres. And Nginx that will handle the routing.

We will also have a "worker" that will watch for a new index from redis and calculate the fib number from the index requested, and push it to redis and store it in Postgres.

Crazy architecture, but showcases multiple containers that are orchestrated.
