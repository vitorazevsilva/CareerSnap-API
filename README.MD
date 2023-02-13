# CareerSnap API

## Installation

### 1. Create a network in your docker:
```
  docker network create careersnap 
```

### 2. Create 2 postgres containers, one for testing and one for production
```
  docker run -p 6001:5432 --name pg-db-careersnap-test --network careersnap -e POSTGRES_DB=careersnap -e POSTGRES_USER=db_admin -e POSTGRES_PASSWORD=mypasswd -d postgres
  docker run -p 7001:5432 --name pg-db-careersnap --network careersnap -e POSTGRES_DB=careersnap -e POSTGRES_USER=db_admin -e POSTGRES_PASSWORD=mypasswd -d postgres
```

### 3. Inspect the docker network and check which ips each container is on
```
  docker network inspect careersnap
```
If you did it in the order indicated here, the ips will be:

Test: `172.18.0.2` | Prod: `172.18.0.3`

```
[
    {
        "Name": "careersnap",
        "Id": "d19b025f1cf0c775b421b3476d38418d66cc27715f4417740bda365bb5fb06b8",
        "Created": "2023-02-11T02:53:36.760550578Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
 
            "b44da580f8c1be137adf4527e7c2fc2680162e276eae01b4fd8a6ee731915dce": {
                "Name": "pg-db-careersnap-test",
                "EndpointID": "0ffbfab2e162f52ac89e0b28385027eaac59add453c2d60fca3b4aea5c91909d",
                "MacAddress": "02:42:ac:12:00:04",
                "IPv4Address": "172.18.0.2/16",
                "IPv6Address": ""
            },
            "ff69ede68b437642c4e0f5c904bc35d612fdc0fb5a6cca0eeb84c72a3bfcc4e6": {
                "Name": "pg-db-careersnap",
                "EndpointID": "548395f626525d99913b1ed958da630814d6c5910435085fc40179eba09c8fc1",
                "MacAddress": "02:42:ac:12:00:02",
                "IPv4Address": "172.18.0.3/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]
```
And edit the knexfile for the ips indicated in the inspectation.

### 4. Build the image of container
```
  docker build -t careersnap-api .
```

### 5. Finally create the api container
```
docker run -p 3001:3000 --name careersnap-api --network careersnap -d careersnap-api 
```
### Optional - You can check if everything is correct 
```
docker logs careersnap-api
```
If all goes well he should return:
```
Using environment: prod
Already up to date

> aula-1@1.0.0 start /app
> NODE_ENV=prod node src/server.js

Server started on port 3001
```
