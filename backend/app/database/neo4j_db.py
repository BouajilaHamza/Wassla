from neo4j import GraphDatabase

class Database:
    def __init__(self, uri, user, password):
        self._driver = GraphDatabase.driver(uri, auth=(user, password))


    def close(self):
        self._driver.close()

    def query(self, query, parameters=None):
        with self._driver.session() as session:
            return session.run(query, parameters)

db = Database("bolt://localhost:7687", "neo4j", "your_password")
