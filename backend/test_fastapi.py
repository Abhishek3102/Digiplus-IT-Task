from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/")
def get_dict():
    return [{"_id": "123", "title": "test"}]

client = TestClient(app)
print(client.get("/").json())
