import React, { useState } from 'react';
import { ShoppingCart, Download, Share2, X, Loader } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  url: string;
  source: 'amazon' | 'flipkart' | 'wayfair';
  similarity: number;
  affiliateUrl?: string;
  category?: string;
  color?: string;
  material?: string;
}

interface DetectedItem {
  id: string;
  name: string;
  description: string;
  category: string;
  color?: string;
  material?: string;
  estimatedPrice?: string;
  confidence: number;
}

interface ProductMatch {
  detectedItemId: string;
  detectedItemName: string;
  matches: Product[];
  bestMatch?: Product;
}

interface ProductSidebarProps {
  items: DetectedItem[];
  productMatches: ProductMatch[];
  isLoading?: boolean;
  onClose?: () => void;
}

export default function ProductSidebar({
  items,
  productMatches,
  isLoading = false,
  onClose,
}: ProductSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'amazon':
        return 'bg-orange-100 text-orange-800';
      case 'flipkart':
        return 'bg-blue-100 text-blue-800';
      case 'wayfair':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      furniture: 'bg-amber-100 text-amber-800',
      lighting: 'bg-yellow-100 text-yellow-800',
      decor: 'bg-pink-100 text-pink-800',
      textiles: 'bg-indigo-100 text-indigo-800',
      'wall-treatment': 'bg-red-100 text-red-800',
      flooring: 'bg-green-100 text-green-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleExportCSV = () => {
    const csvContent = generateCSV();
    downloadFile(csvContent, 'design-to-buy.csv', 'text/csv');
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(
      {
        items,
        productMatches,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
    downloadFile(jsonContent, 'design-to-buy.json', 'application/json');
  };

  const generateCSV = () => {
    let csv = 'Detected Item,Category,Color,Material,Best Match Product,Price,Source,Link\n';

    productMatches.forEach((match) => {
      const bestMatch = match.bestMatch;
      if (bestMatch) {
        csv += `"${match.detectedItemName}","${match.matches[0]?.category || ''}","${match.matches[0]?.color || ''}","${match.matches[0]?.material || ''}","${bestMatch.title}","${bestMatch.price}","${bestMatch.source}","${bestMatch.affiliateUrl || bestMatch.url}"\n`;
      }
    });

    return csv;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={24} />
          <div>
            <h2 className="font-bold text-lg">Design to Buy</h2>
            <p className="text-sm opacity-90">{items.length} items detected</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-1 rounded">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : productMatches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No products detected yet.</p>
            <p className="text-sm">Generate an image to see detected items and products.</p>
          </div>
        ) : (
          productMatches.map((match) => (
            <div key={match.detectedItemId} className="border rounded-lg overflow-hidden hover:shadow-md transition">
              {/* Item Header */}
              <button
                onClick={() => toggleExpanded(match.detectedItemId)}
                className="w-full bg-gray-50 p-3 flex items-center justify-between hover:bg-gray-100 transition"
              >
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-800">{match.detectedItemName}</h3>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {match.matches[0]?.category && (
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(match.matches[0].category)}`}>
                        {match.matches[0].category}
                      </span>
                    )}
                    {match.bestMatch && (
                      <span className={`text-xs px-2 py-1 rounded ${getSourceColor(match.bestMatch.source)}`}>
                        {match.bestMatch.source}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {match.bestMatch && <p className="font-semibold text-green-600">{match.bestMatch.price}</p>}
                  <p className="text-xs text-gray-500">{match.matches.length} matches</p>
                </div>
              </button>

              {/* Expanded Content */}
              {expandedItems.has(match.detectedItemId) && (
                <div className="border-t p-3 space-y-2 bg-white">
                  {match.matches.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="border rounded p-2 hover:shadow-sm transition cursor-pointer"
                      onClick={() => toggleProductSelection(product.id)}
                    >
                      <div className="flex gap-2">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="mt-1"
                        />

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                          <p className="text-xs text-gray-600">{product.price}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${getSourceColor(product.source)}`}>
                              {product.source}
                            </span>
                            <span className="text-xs text-blue-600 font-medium">{product.similarity}% match</span>
                          </div>
                        </div>

                        {/* Link Button */}
                        <a
                          href={product.affiliateUrl || product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium self-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}

                  {match.matches.length > 3 && (
                    <p className="text-xs text-gray-500 text-center py-1">+{match.matches.length - 3} more options</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer with Export Options */}
      {productMatches.length > 0 && (
        <div className="border-t bg-gray-50 p-3 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded font-medium text-sm transition"
            >
              <Download size={16} />
              CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded font-medium text-sm transition"
            >
              <Download size={16} />
              JSON
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded font-medium text-sm transition">
              <Share2 size={16} />
              Share
            </button>
          </div>
          <p className="text-xs text-gray-600 text-center">
            {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
}
