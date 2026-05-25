import chromadb
from sentence_transformers import SentenceTransformer


COLLECTION_NAME = "placement_policy"

collection = None
embedding_model = None


def load_resources():
    global collection
    global embedding_model

    if collection is None:
        # client = chromadb.PersistentClient(path="/app/chroma_db")
        client = chromadb.PersistentClient(path="./chroma_db")

        collection = client.get_collection(
            name=COLLECTION_NAME
        )

    if embedding_model is None:
        embedding_model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )


def search_policy(query, top_k=3):
    load_resources()

    query_embedding = embedding_model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    documents = results.get("documents", [[]])[0]
    distances = results.get("distances", [[]])[0]

    similarity_score = distances[0] if distances else 0

    return {
        "documents": documents,
        "similarity_score": round(similarity_score, 2)
    }