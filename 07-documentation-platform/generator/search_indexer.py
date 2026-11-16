"""
Full-Text Search Indexer & Inverted Index Engine for Pixlo Documentation Platform.
Tokenizes documentation content, applies weighted relevance scoring, extracts
context snippets with match highlights, and exports searchable JSON indices.
"""

import re
from typing import Dict, Any, List, Set, Optional


STOP_WORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
    "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
    "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just",
    "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once",
    "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
    "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
    "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which",
    "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself"
}


def tokenize(text: str) -> List[str]:
    """Extract lowercase alphanumeric tokens, omitting stop words."""
    cleaned = re.sub(r"[^\w\s-]", " ", text.lower())
    words = re.split(r"[\s_-]+", cleaned)
    return [w for w in words if len(w) > 1 and w not in STOP_WORDS]


class SearchIndexer:
    def __init__(self):
        # document registry: {doc_id: {"slug": ..., "title": ..., "body": ..., "version": ...}}
        self.documents: Dict[str, Dict[str, Any]] = {}
        # inverted index: {term: {doc_id: score}}
        self.inverted_index: Dict[str, Dict[str, float]] = {}

    def add_document(
        self,
        doc_id: str,
        title: str,
        slug: str,
        body: str,
        headings: Optional[List[str]] = None,
        version: str = "latest"
    ) -> None:
        """Indexes a document with weighted field contributions."""
        headings_list = headings or []
        self.documents[doc_id] = {
            "id": doc_id,
            "title": title,
            "slug": slug,
            "version": version,
            "body": body[:500], # excerpt
            "headings": headings_list
        }

        # Title tokens (weight = 5.0)
        for term in tokenize(title):
            self._add_term_weight(term, doc_id, 5.0)

        # Heading tokens (weight = 3.0)
        for h in headings_list:
            for term in tokenize(h):
                self._add_term_weight(term, doc_id, 3.0)

        # Body tokens (weight = 1.0)
        for term in tokenize(body):
            self._add_term_weight(term, doc_id, 1.0)

    def _add_term_weight(self, term: str, doc_id: str, weight: float) -> None:
        if term not in self.inverted_index:
            self.inverted_index[term] = {}
        self.inverted_index[term][doc_id] = self.inverted_index[term].get(doc_id, 0.0) + weight

    def search(self, query: str, version: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Query the inverted index, calculating relevance scores across tokens.
        """
        tokens = tokenize(query)
        if not tokens:
            return []

        doc_scores: Dict[str, float] = {}

        for t in tokens:
            # Exact match
            if t in self.inverted_index:
                for doc_id, score in self.inverted_index[t].items():
                    doc_scores[doc_id] = doc_scores.get(doc_id, 0.0) + score
            # Prefix partial match
            for term, posting in self.inverted_index.items():
                if term != t and term.startswith(t):
                    for doc_id, score in posting.items():
                        doc_scores[doc_id] = doc_scores.get(doc_id, 0.0) + (score * 0.5)

        results = []
        for doc_id, total_score in doc_scores.items():
            doc = self.documents.get(doc_id)
            if not doc:
                continue

            # Version filter if specified
            if version and doc.get("version") != version:
                continue

            results.append({
                "id": doc["id"],
                "title": doc["title"],
                "slug": doc["slug"],
                "version": doc["version"],
                "score": round(total_score, 2),
                "snippet": self._generate_snippet(doc, query)
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]

    def _generate_snippet(self, doc: Dict[str, Any], query: str) -> str:
        """Create highlighted snippet around matched term across body, title, or headings."""
        tokens = tokenize(query)
        first_token = tokens[0] if tokens else ""
        if not first_token:
            body = doc.get("body", "")
            return body[:120] + "..." if len(body) > 120 else body

        # Check body first
        body = doc.get("body", "")
        idx = body.lower().find(first_token)
        if idx != -1:
            start = max(0, idx - 40)
            end = min(len(body), idx + 80)
            snip = body[start:end]
            highlighted = re.sub(re.escape(first_token), f"<mark>{first_token}</mark>", snip, flags=re.IGNORECASE)
            return f"...{highlighted}..."

        # Check title
        title = doc.get("title", "")
        if first_token in title.lower():
            highlighted = re.sub(re.escape(first_token), f"<mark>{first_token}</mark>", title, flags=re.IGNORECASE)
            return f"Title: {highlighted}"

        # Check headings
        for h in doc.get("headings", []):
            if first_token in h.lower():
                highlighted = re.sub(re.escape(first_token), f"<mark>{first_token}</mark>", h, flags=re.IGNORECASE)
                return f"Section: {highlighted}"

        return body[:120] + "..." if len(body) > 120 else body

    def export_index(self) -> Dict[str, Any]:
        """Exports index structure for client-side search payload."""
        return {
            "documents": self.documents,
            "inverted_index": self.inverted_index
        }
