#!/bin/bash

# wait for services
sleep 5
/wait-for-it.sh $DB_HOST:$DB_PORT
sleep 10

./node_modules/.bin/knex migrate:latest
echo "-----------------------------------------------------"
echo "-------------- MLApp Ready For Use ------------------"
echo "-----------------------------------------------------"
# run app
node ./bin/www

