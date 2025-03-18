
import { useState, useEffect, useCallback } from "react";
import { KnowledgeEntry } from "../types";
import { useKnowledgeBaseService } from "../services";
import { useInternetSearch } from "./hooks/useInternetSearch";
import { useLocalSearch } from "./hooks/useLocalSearch";
import { useDocumentSearch } from "./hooks/useDocumentSearch";
import { useSemanticSearch } from "./hooks/useSemanticSearch";
import { useEmbeddingsUpdate } from "./hooks/useEmbeddingsUpdate";

export const useKnowledgeSearch = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("internet");
  const [includeLocalContent, setIncludeLocalContent] = useState(false);
  const kb = useKnowledgeBaseService();

  // Import specialized search hooks - we don't need to store entries anymore
  const internetSearch = useInternetSearch();
  const localSearch = useLocalSearch();
  const documentSearch = useDocumentSearch();
  const semanticSearch = useSemanticSearch();
  const embeddingsUpdate = useEmbeddingsUpdate();

  // Combine isSearching states
  const isSearching = 
    internetSearch.isSearching || 
    localSearch.isSearching || 
    documentSearch.isSearching || 
    semanticSearch.isSearching;

  // Use useCallback to memoize handleSearch function
  const handleSearch = useCallback(() => {
    if (activeTab === "internet") {
      internetSearch.handleSearch(query, includeLocalContent);
    } else if (activeTab === "local") {
      localSearch.handleSearch(query);
    } else if (activeTab === "documents") {
      documentSearch.handleSearch(query);
    } else if (activeTab === "semantic") {
      semanticSearch.handleSearch(query);
    }
  }, [
    activeTab, 
    query, 
    includeLocalContent, 
    internetSearch, 
    localSearch, 
    documentSearch, 
    semanticSearch
  ]);

  // Optimize useEffect to update response and sources only when necessary
  useEffect(() => {
    // Update response and sources when active tab or search results change
    if (activeTab === "internet" && !internetSearch.isSearching) {
      setResponse(internetSearch.response);
      setSources(internetSearch.sources);
    } else if (activeTab === "local" && !localSearch.isSearching) {
      setResponse(localSearch.response);
      setSources(localSearch.sources);
    } else if (activeTab === "documents" && !documentSearch.isSearching) {
      setResponse(documentSearch.response);
      setSources(documentSearch.sources);
    } else if (activeTab === "semantic" && !semanticSearch.isSearching) {
      setResponse(semanticSearch.response);
      setSources(semanticSearch.sources);
    }
  }, [
    activeTab,
    internetSearch.isSearching, internetSearch.response, internetSearch.sources,
    localSearch.isSearching, localSearch.response, localSearch.sources,
    documentSearch.isSearching, documentSearch.response, documentSearch.sources,
    semanticSearch.isSearching, semanticSearch.response, semanticSearch.sources
  ]);

  // Clean up response and sources when active tab changes
  useEffect(() => {
    setResponse("");
    setSources([]);
  }, [activeTab]);

  return {
    query,
    setQuery,
    response,
    sources,
    isSearching,
    activeTab,
    setActiveTab,
    includeLocalContent,
    setIncludeLocalContent,
    handleSearch,
    isUpdatingEmbeddings: embeddingsUpdate.isUpdatingEmbeddings,
    updateExistingDocumentEmbeddings: embeddingsUpdate.updateExistingDocumentEmbeddings
  };
};
