#Create DB Docker
docker run -p 6001:5432 --name pg-db-careersnap-test -e POSTGRES_DB=careersnap -e POSTGRES_USER=db_admin -e POSTGRES_PASSWORD=mypasswd -d postgres
docker run -p 7001:5432 --name pg-db-careersnap -e POSTGRES_DB=careersnap -e POSTGRES_USER=db_admin -e POSTGRES_PASSWORD=mypasswd -d postgres


node_modules/.bin/knex migrate:make create_table_users --env test
node_modules/.bin/knex migrate:make create_table_skills --env test
node_modules/.bin/knex migrate:make create_table_experiences --env test