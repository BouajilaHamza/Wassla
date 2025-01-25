from neo4j import GraphDatabase
from backend.app.core.config import settings



class Neo4jService:
    def __init__(self, uri, username, password):
        self.driver = GraphDatabase.driver(uri, auth=(username, password))
    
    def close(self):
        self.driver.close()
    
    def execute_query(self, query, parameters=None):
        with self.driver.session() as session:
            return session.run(query, parameters)

# Initialize the service with your AuraDB credentials
neo4j_service = Neo4jService(
    uri=settings.NEO4J_URI,
    username=settings.NEO4J_USERNAME,
    password=settings.NEO4J_PASSWORD
)