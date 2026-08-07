import pytest
from app.services.pdf_service import clean_extracted_text
from app.services.chunker import chunk_document_pages, split_text_into_chunks

def test_clean_extracted_text():
    raw_text = "  Hello \x00 World!   \n\n\n\n This is   a test document.  "
    cleaned = clean_extracted_text(raw_text)
    assert "\x00" not in cleaned
    assert "Hello World!" in cleaned
    assert "\n\n\n" not in cleaned

def test_sliding_window_chunker():
    sample_text = (
        "FastAPI is a modern, fast web framework for building APIs with Python 3.8+ based on standard Python type hints. "
        "The key features are Fast: Very high performance, on par with NodeJS and Go. "
        "Intuitive: Great editor support. Completion everywhere. Less time debugging. "
        "Easy: Designed to be easy to use and learn. Less time reading docs."
    )
    pages = {1: sample_text}
    chunks = chunk_document_pages(pages_text=pages, chunk_size=150, chunk_overlap=30, filename="test.pdf")
    
    assert len(chunks) > 1
    assert chunks[0].chunk_index == 0
    assert chunks[0].page_number == 1
    assert chunks[0].metadata["source_filename"] == "test.pdf"
    # Verify overlap coverage
    assert chunks[1].chunk_index == 1
