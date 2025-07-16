import React, { useState, useEffect, useRef, useCallback } from "react";
import { Product } from "../../services/productsService";
import { useCart } from "../../hooks/useCart";
import { useProducts } from "../../hooks/useProducts";

interface SearchResult extends Product {
  matchScore: number;
  matchType: "name" | "category" | "barcode";
  highlightedName: string;
}

interface ProductSearchProps {
  className?: string;
  placeholder?: string;
  showAddToCart?: boolean;
  onProductSelect?: (product: Product) => void;
  autoFocus?: boolean;
  maxResults?: number;
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  className = "",
  placeholder = "Search products by name, category, or barcode...",
  showAddToCart = true,
  onProductSelect,
  autoFocus = false,
  maxResults = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { addToCart, canAddToCart } = useCart();
  const {
    products,
    searchProducts,
    isLoading: productsLoading,
  } = useProducts();

  // Fast search algorithm with multiple criteria and scoring
  const performSearch = useCallback(
    (term: string, productList: Product[]): SearchResult[] => {
      if (!term || term.length < 1) return [];

      const normalizedTerm = term.toLowerCase().trim();
      const results: SearchResult[] = [];

      for (const product of productList) {
        const nameMatches = findMatches(
          product.name.toLowerCase(),
          normalizedTerm
        );
        // Check both category and category_name fields (API returns category_name)
        const categoryField = product.category_name || product.category;
        const categoryMatches = categoryField
          ? findMatches(categoryField.toLowerCase(), normalizedTerm)
          : [];
        const barcodeMatches = product.barcode
          ? findMatches(product.barcode, normalizedTerm)
          : [];

        let bestMatch: {
          score: number;
          type: "name" | "category" | "barcode";
          highlighted: string;
        } | null = null;

        // 1. Check exact character sequence matches (highest priority)
        if (nameMatches.length > 0) {
          const score = calculateScore(
            nameMatches,
            product.name.length,
            normalizedTerm.length
          );
          bestMatch = {
            score: score + 2000, // Highest boost for exact matches
            type: "name",
            highlighted: highlightMatches(product.name, nameMatches),
          };
        } else if (categoryMatches.length > 0) {
          const score = calculateScore(
            categoryMatches,
            categoryField!.length,
            normalizedTerm.length
          );
          bestMatch = {
            score: score + 1000, // High boost for exact category matches
            type: "category",
            highlighted: product.name,
          };
        } else if (barcodeMatches.length > 0) {
          const score = calculateScore(
            barcodeMatches,
            product.barcode!.length,
            normalizedTerm.length
          );
          bestMatch = {
            score: score + 800, // High boost for exact barcode matches
            type: "barcode",
            highlighted: product.name,
          };
        }

        // 2. If no exact matches, try fuzzy matching for typos (minimum 3 chars)
        if (!bestMatch && normalizedTerm.length >= 3) {
          // Fuzzy name matching
          const nameFuzzyScore = calculateWordFuzzyScore(
            product.name,
            normalizedTerm
          );
          if (nameFuzzyScore > 0) {
            bestMatch = {
              score: nameFuzzyScore + 500, // Medium boost for fuzzy name matches
              type: "name",
              highlighted: highlightFuzzyMatches(product.name, normalizedTerm),
            };
          }

          // Fuzzy category matching (if no name match found)
          if (!bestMatch && categoryField) {
            const categoryFuzzyScore = calculateWordFuzzyScore(
              categoryField,
              normalizedTerm
            );
            if (categoryFuzzyScore > 0) {
              bestMatch = {
                score: categoryFuzzyScore + 300, // Lower boost for fuzzy category matches
                type: "category",
                highlighted: product.name,
              };
            }
          }
        }

        if (bestMatch) {
          results.push({
            ...product,
            matchScore: bestMatch.score,
            matchType: bestMatch.type,
            highlightedName: bestMatch.highlighted,
          });
        }
      }

      // Sort by score (descending) and limit results
      return results
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, maxResults);
    },
    [maxResults]
  );

  // Find character matches between search term and target string
  const findMatches = (target: string, searchTerm: string): number[] => {
    const matches: number[] = [];
    let searchIndex = 0;

    for (let i = 0; i < target.length && searchIndex < searchTerm.length; i++) {
      if (target[i] === searchTerm[searchIndex]) {
        matches.push(i);
        searchIndex++;
      }
    }

    return searchIndex === searchTerm.length ? matches : [];
  };

  // Calculate Levenshtein distance for fuzzy matching
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  // Calculate fuzzy match score based on Levenshtein distance
  const calculateFuzzyScore = (target: string, searchTerm: string): number => {
    if (searchTerm.length === 0) return 0;

    const distance = levenshteinDistance(
      target.toLowerCase(),
      searchTerm.toLowerCase()
    );
    const maxLength = Math.max(target.length, searchTerm.length);

    // Convert distance to similarity percentage (0-100)
    const similarity = ((maxLength - distance) / maxLength) * 100;

    // Only consider matches with at least 60% similarity
    return similarity >= 60 ? similarity : 0;
  };

  // Normalize text by treating punctuation consistently
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[-_.,!@#$%^&*()+={}[\]|\\:";'<>?/]/g, " ") // Replace punctuation with spaces
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .trim();
  };

  // Enhanced word-level fuzzy matching for better phrase handling
  const calculateWordFuzzyScore = (
    target: string,
    searchTerm: string
  ): number => {
    // Normalize both target and search term to handle punctuation consistently
    const normalizedTarget = normalizeText(target);
    const normalizedSearchTerm = normalizeText(searchTerm);

    const targetWords = normalizedTarget.split(/\s+/);
    const searchWords = normalizedSearchTerm.split(/\s+/);

    let totalScore = 0;
    let matchedWords = 0;

    for (const searchWord of searchWords) {
      if (searchWord.length < 2) continue; // Skip very short words

      let bestWordScore = 0;
      for (const targetWord of targetWords) {
        // Exact match gets highest score
        if (targetWord === searchWord) {
          bestWordScore = 100;
          break;
        }

        // Prefix match gets high score
        if (
          targetWord.startsWith(searchWord) ||
          searchWord.startsWith(targetWord)
        ) {
          const prefixScore =
            (Math.min(searchWord.length, targetWord.length) /
              Math.max(searchWord.length, targetWord.length)) *
            90;
          bestWordScore = Math.max(bestWordScore, prefixScore);
        }

        // Fuzzy match for typos
        const fuzzyScore = calculateFuzzyScore(targetWord, searchWord);
        bestWordScore = Math.max(bestWordScore, fuzzyScore);
      }

      if (bestWordScore > 0) {
        totalScore += bestWordScore;
        matchedWords++;
      }
    }

    // Average score weighted by the number of matched words
    return matchedWords > 0 ? totalScore / searchWords.length : 0;
  };

  // Calculate match score based on match positions and string lengths
  const calculateScore = (
    matches: number[],
    targetLength: number,
    searchLength: number
  ): number => {
    if (matches.length === 0) return 0;

    let score = 0;

    // Bonus for exact prefix match
    if (matches[0] === 0) {
      score += 1000;
    }

    // Bonus for consecutive matches
    let consecutiveCount = 1;
    for (let i = 1; i < matches.length; i++) {
      if (matches[i] === matches[i - 1] + 1) {
        consecutiveCount++;
      } else {
        score += consecutiveCount * 10;
        consecutiveCount = 1;
      }
    }
    score += consecutiveCount * 10;

    // Bonus for shorter target strings (more relevant)
    score += (100 - targetLength) * 2;

    // Bonus for higher match percentage
    score += (searchLength / targetLength) * 100;

    return score;
  };

  // Highlight matching characters in the result
  const highlightMatches = (text: string, matches: number[]): string => {
    if (matches.length === 0) return text;

    let highlighted = "";
    let lastIndex = 0;

    for (const matchIndex of matches) {
      highlighted += text.slice(lastIndex, matchIndex);
      highlighted += `<mark class="bg-yellow-200 font-semibold">${text[matchIndex]}</mark>`;
      lastIndex = matchIndex + 1;
    }
    highlighted += text.slice(lastIndex);

    return highlighted;
  };

  // Highlight fuzzy matches (for typo tolerance)
  const highlightFuzzyMatches = (text: string, searchTerm: string): string => {
    // Split original text preserving punctuation
    const originalWords = text.split(
      /(\s+|[-_.,!@#$%^&*()+={}[\]|\\:";'<>?/]+)/
    );
    const normalizedSearchTerm = normalizeText(searchTerm);
    const searchWords = normalizedSearchTerm.split(/\s+/);

    const highlightedParts = originalWords.map((part) => {
      // Skip whitespace and punctuation parts
      if (
        /^\s+$/.test(part) ||
        /^[-_.,!@#$%^&*()+={}[\]|\\:";'<>?/]+$/.test(part)
      ) {
        return part;
      }

      const normalizedPart = normalizeText(part);
      if (!normalizedPart) return part;

      let bestMatch = { score: 0, highlighted: part };

      for (const searchWord of searchWords) {
        if (searchWord.length < 2) continue;

        // Check both original and normalized versions
        const fuzzyScore = Math.max(
          calculateFuzzyScore(normalizedPart, searchWord),
          calculateFuzzyScore(part.toLowerCase(), searchWord)
        );

        if (fuzzyScore > bestMatch.score) {
          bestMatch = {
            score: fuzzyScore,
            highlighted:
              fuzzyScore > 70
                ? `<mark class="bg-orange-200 font-semibold">${part}</mark>`
                : part,
          };
        }
      }

      return bestMatch.highlighted;
    });

    return highlightedParts.join("");
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    (term: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (term.trim()) {
          setIsLoading(true);

          // Use local products for instant search, fallback to API if needed
          if (products && products.length > 0) {
            const results = performSearch(term, products);
            setSearchResults(results);
            setIsLoading(false);
            setIsOpen(true);
          } else {
            // Fallback to API search
            searchProducts(term).then(() => {
              setIsLoading(false);
            });
          }
        } else {
          setSearchResults([]);
          setIsOpen(false);
          setIsLoading(false);
        }
        setSelectedIndex(-1);
      }, 150); // 150ms debounce for responsive feel
    },
    [products, performSearch, searchProducts]
  );

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? searchResults.length - 1 : prev - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleProductSelect(searchResults[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }

    if (showAddToCart && canAddToCart(product)) {
      addToCart(product);
    }

    setSearchTerm("");
    setSearchResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Get match type display text
  const getMatchTypeText = (matchType: string) => {
    switch (matchType) {
      case "category":
        return "in category";
      case "barcode":
        return "by barcode";
      default:
        return "";
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
        >
          {searchResults.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""} found
              </div>
              {searchResults.map((product, index) => (
                <div
                  key={product.id}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 ${
                    index === selectedIndex ? "bg-blue-50 border-blue-200" : ""
                  } ${product.stock_quantity === 0 ? "opacity-60" : ""}`}
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium text-gray-900 truncate"
                        dangerouslySetInnerHTML={{
                          __html: product.highlightedName,
                        }}
                      />
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        {(product.category_name || product.category) && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {product.category_name || product.category}
                          </span>
                        )}
                        {product.matchType !== "name" && (
                          <span className="text-blue-600">
                            {getMatchTypeText(product.matchType)}
                          </span>
                        )}
                        {product.stock_quantity === 0 && (
                          <span className="text-red-600 font-medium">
                            Out of Stock
                          </span>
                        )}
                        {product.stock_quantity > 0 &&
                          product.stock_quantity <= 5 && (
                            <span className="text-yellow-600 font-medium">
                              Low Stock
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                      {showAddToCart && canAddToCart(product) && (
                        <div className="text-xs text-green-600 font-medium">
                          + Add
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : searchTerm.trim() && !isLoading ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <div className="text-sm">
                No products found for "{searchTerm}"
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Try searching by product name, category, or barcode
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
