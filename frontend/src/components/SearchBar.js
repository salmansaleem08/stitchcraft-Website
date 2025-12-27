import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./SearchBar.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length >= 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}&limit=8`);
      setSuggestions(response.data.data);
      setShowSuggestions(response.data.data.length > 0);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(suggestion.url);
    setQuery("");
    setShowSuggestions(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "fabric":
        return "F";
      case "supply":
        return "S";
      case "supplier":
        return "SP";
      default:
        return "?";
    }
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      <form onSubmit={handleSearch} className="search-bar-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder="Search fabrics, supplies, suppliers..."
          className="search-bar-input"
        />
        <button type="submit" className="search-bar-button">
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown" ref={suggestionsRef}>
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="suggestion-type">{getTypeIcon(suggestion.type)}</span>
              <div className="suggestion-content">
                <span className="suggestion-text">{suggestion.text}</span>
                <span className="suggestion-category">{suggestion.category}</span>
              </div>
            </div>
          ))}
          <div className="suggestion-footer">
            <button
              onClick={handleSearch}
              className="view-all-results"
            >
              View all results for "{query}"
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

