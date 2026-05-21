import chromadb
from sentence_transformers import SentenceTransformer


COLLECTION_NAME = "placement_policy"


client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_collection(
    name=COLLECTION_NAME
)

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


def search_policy(query, top_k=3):
    query_embedding = embedding_model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    documents = results.get("documents", [[]])[0]

    return documents