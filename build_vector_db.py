from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import chromadb


PDF_PATH = "data/placement_policy.pdf"
COLLECTION_NAME = "placement_policy"


def extract_text_from_pdf(path):
    reader = PdfReader(path)
    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n".join(pages)


def split_text(text):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )

    return splitter.split_text(text)


def initialize_collection():
    client = chromadb.PersistentClient(path="./chroma_db")

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME
    )

    return collection


def store_chunks(collection, chunks, model):
    for index, chunk in enumerate(chunks):
        embedding = model.encode(chunk).tolist()

        collection.add(
            ids=[f"chunk_{index}"],
            documents=[chunk],
            embeddings=[embedding]
        )


def main():
    print("Loading placement policy document...")

    policy_text = extract_text_from_pdf(PDF_PATH)

    print("Splitting document into chunks...")

    chunks = split_text(policy_text)

    print(f"Generated {len(chunks)} chunks")

    print("Loading embedding model...")

    embedding_model = SentenceTransformer(
        "all-MiniLM-L6-v2"
    )

    collection = initialize_collection()

    print("Creating vector database...")

    store_chunks(collection, chunks, embedding_model)

    print("Vector database created successfully")


if __name__ == "__main__":
    main()