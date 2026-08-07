import uuid
from typing import Dict, List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.schemas import DocumentChunk

def chunk_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50
) -> List[str]:
    """
    Step 4 Node: Splits raw text into chunks using RecursiveCharacterTextSplitter
    with specified chunk_size (default: 500) and chunk_overlap (default: 50).
    Returns a list of raw string chunks.
    """
    if not text or not text.strip():
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    return splitter.split_text(text)

def split_text_into_chunks(
    text: str,
    page_number: int,
    start_chunk_index: int,
    chunk_size: int = 500,
    chunk_overlap: int = 50,
    filename: str = ""
) -> List[DocumentChunk]:
    """
    Splits text from a given page into overlapping character chunks with sentence boundary awareness.
    """
    if not text or not text.strip():
        return []

    chunks: List[DocumentChunk] = []
    start = 0
    text_length = len(text)
    current_index = start_chunk_index

    while start < text_length:
        end = min(start + chunk_size, text_length)
        
        if end < text_length:
            search_start = max(start + int(chunk_size * 0.8), start + 1)
            boundary_found = -1
            for char in [". ", "!\n", "?\n", "\n\n", ". \n", "\n", " "]:
                pos = text.rfind(char, search_start, end)
                if pos != -1:
                    boundary_found = pos + len(char)
                    break
            
            if boundary_found != -1:
                end = boundary_found

        chunk_text = text[start:end].strip()

        if chunk_text:
            chunk_id = f"chk_{uuid.uuid4().hex[:12]}"
            chunks.append(
                DocumentChunk(
                    chunk_id=chunk_id,
                    chunk_index=current_index,
                    text=chunk_text,
                    page_number=page_number,
                    char_count=len(chunk_text),
                    metadata={
                        "source_filename": filename,
                        "page": page_number,
                        "start_char": start,
                        "end_char": end
                    }
                )
            )
            current_index += 1

        if end >= text_length:
            break
        start = max(end - chunk_overlap, start + 1)

    return chunks

def chunk_document_pages(
    pages_text: Dict[int, str],
    chunk_size: int = 500,
    chunk_overlap: int = 50,
    filename: str = ""
) -> List[DocumentChunk]:
    """
    Iterates through all pages in a document and generates sequential DocumentChunks.
    """
    all_chunks: List[DocumentChunk] = []
    global_index = 0

    for page_num in sorted(pages_text.keys()):
        page_content = pages_text[page_num]
        if not page_content:
            continue
        page_chunks = split_text_into_chunks(
            text=page_content,
            page_number=page_num,
            start_chunk_index=global_index,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            filename=filename
        )
        all_chunks.extend(page_chunks)
        global_index += len(page_chunks)

    return all_chunks
