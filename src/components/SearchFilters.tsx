import { useState } from "react";
import { Search, Filter, X, Calendar, Star, Tag, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SearchFiltersState {
  query: string;
  types: string[];
  dateRange: "all" | "today" | "week" | "month";
  favoritesOnly: boolean;
  tags: string[];
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onChange: (filters: SearchFiltersState) => void;
  availableTags: string[];
}

const SearchFilters = ({ filters, onChange, availableTags }: SearchFiltersProps) => {
  const activeFilterCount = 
    filters.types.length + 
    (filters.dateRange !== "all" ? 1 : 0) + 
    (filters.favoritesOnly ? 1 : 0) + 
    filters.tags.length;

  const updateFilter = (partial: Partial<SearchFiltersState>) => {
    onChange({ ...filters, ...partial });
  };

  const clearFilters = () => {
    onChange({ query: filters.query, types: [], dateRange: "all", favoritesOnly: false, tags: [] });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, URL, tags, or notes..."
            value={filters.query}
            onChange={e => updateFilter({ query: e.target.value })}
            className="pl-10 h-11 bg-card border-border/50 focus-visible:ring-primary/50"
          />
          {filters.query && (
            <button
              onClick={() => updateFilter({ query: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 gap-2 relative">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown className="w-3 h-3" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Filter className="w-3 h-3" /> Type
            </DropdownMenuLabel>
            {["link", "image", "video", "note"].map(type => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={filters.types.includes(type)}
                onCheckedChange={checked => {
                  updateFilter({
                    types: checked
                      ? [...filters.types, type]
                      : filters.types.filter(t => t !== type),
                  });
                }}
              >
                <span className="capitalize">{type}</span>
              </DropdownMenuCheckboxItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Date
            </DropdownMenuLabel>
            {[
              { value: "all", label: "All time" },
              { value: "today", label: "Today" },
              { value: "week", label: "Last 7 days" },
              { value: "month", label: "Last 30 days" },
            ].map(opt => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={filters.dateRange === opt.value}
                onCheckedChange={() => updateFilter({ dateRange: opt.value as any })}
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.favoritesOnly}
              onCheckedChange={checked => updateFilter({ favoritesOnly: !!checked })}
            >
              <Star className="w-3 h-3 mr-1" /> Favorites Only
            </DropdownMenuCheckboxItem>

            {availableTags.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Tag className="w-3 h-3" /> Tags
                </DropdownMenuLabel>
                {availableTags.slice(0, 10).map(tag => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={filters.tags.includes(tag)}
                    onCheckedChange={checked => {
                      updateFilter({
                        tags: checked
                          ? [...filters.tags, tag]
                          : filters.tags.filter(t => t !== tag),
                      });
                    }}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </>
            )}

            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="p-1">
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={clearFilters}>
                    <X className="w-3 h-3 mr-1" /> Clear all filters
                  </Button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.types.map(type => (
            <Badge key={type} variant="secondary" className="gap-1 text-xs capitalize">
              {type}
              <button onClick={() => updateFilter({ types: filters.types.filter(t => t !== type) })}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.dateRange !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {filters.dateRange === "today" ? "Today" : filters.dateRange === "week" ? "Last 7d" : "Last 30d"}
              <button onClick={() => updateFilter({ dateRange: "all" })}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.favoritesOnly && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Star className="w-3 h-3" /> Favorites
              <button onClick={() => updateFilter({ favoritesOnly: false })}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1 text-xs">
              #{tag}
              <button onClick={() => updateFilter({ tags: filters.tags.filter(t => t !== tag) })}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
