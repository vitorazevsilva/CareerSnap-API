Docker
docker network create careersnap

docker run -p 6001:5432 --name pg-db-careersnap-test --network network_careersnap -e POSTGRES_DB=careersnap -e POSTGRES_USER=db_admin -e POSTGRES_PASSWORD=mypasswd -d postgres
docker run -p 7001:5432 --name pg-db-careersnap --network network_careersnap -e POSTGRES_DB=careersnap -e POSTGRES_USER=db_admin -e POSTGRES_PASSWORD=mypasswd -d postgres
docker build -t careersnap-api .
docker run -p 3001:3000 --name careersnap-api --network network_careersnap -d careersnap-api 

