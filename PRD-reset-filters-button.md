# Product Requirements Document: Reset Filters Button on Dex Page

## Overview
Add a "Reset Filters" button to the Pokémon Dex page that clears all active filters and search inputs with a single click, improving user experience by providing a quick way to return to the default filtered view.

## Problem Statement
Currently, when users have applied multiple filters on the Dex page (generation, types, min BST, sort, search), they must manually clear each filter individually:
- Click individual type pills to deselect them
- Reset the generation filter back to "All"
- Drag the BST slider back to 0
- Clear the search input
- Reset the sort back to "Dex number"

This creates friction for users who want to quickly start over with a fresh view without remembering which filters were applied.

## Goals
1. Reduce friction for users who want to clear all filters quickly
2. Provide clear visual affordance for the reset action
3. Maintain consistency with existing UI patterns in the application
4. Improve discoverability of the reset capability

## Scope

### In Scope
- Add a reset button to the Dex page filter UI
- Reset the following filter states:
  - Search query (`q`)
  - Type filters (`typesOn`)
  - Min BST filter (`bstMin`)
  - Generation filter (`genFilter`)
  - Sort order (`sort`)
- Show/hide the button based on whether filters are active
- Provide visual feedback when reset is triggered

### Out of Scope
- Resetting view preference (grid/list toggle) - this is not a filter
- Persisting filter preferences across sessions
- Undo functionality for reset actions
- Keyboard shortcuts for reset

## Requirements

### Functional Requirements

#### FR1: Reset Functionality
- Button should reset all filter states to their default values:
  - `q` → `''` (empty string)
  - `typesOn` → `new Set()` (empty set)
  - `bstMin` → `0`
  - `genFilter` → `'all'`
  - `sort` → `'id'`

#### FR2: Button Visibility
- Button should only be visible when at least one filter is active
- Filter is considered "active" if any of the following conditions are true:
  - Search query is non-empty (`q.trim().length > 0`)
  - One or more types are selected (`typesOn.size > 0`)
  - Min BST is greater than 0 (`bstMin > 0`)
  - Generation filter is not 'all' (`genFilter !== 'all'`)
  - Sort is not 'id' (`sort !== 'id'`)

#### FR3: Button Placement
- Button should be located in the filter sidebar, near other filter controls
- Position: Below the sort dropdown or adjacent to the "Filters" header for easy discovery
- Clear visual separation from other filter controls

#### FR4: User Feedback
- Button click should provide immediate visual feedback
- The filter count badge should update after reset (disappear if no filters are active)

### Non-Functional Requirements

#### NFR1: Performance
- Reset operation should be instant (no async operations needed)
- No performance degradation when rendering with/without button

#### NFR2: Accessibility
- Button must have descriptive `aria-label` (e.g., "Reset all filters")
- Button should be keyboard accessible
- Focus management should follow standard patterns

#### NFR3: Responsive Design
- Button must be visible and functional on mobile, tablet, and desktop
- Adapt layout in mobile view if needed

## UI/UX Specifications

### Button Design
- **Style**: Match existing button styles in the filter sidebar (similar to "clear types" button)
- **Label**: "Reset Filters" or "Clear All Filters"
- **Icon** (optional): Consider adding a reset icon (↺) for visual clarity
- **Placement**: At the bottom of the filter sidebar or below the sort dropdown
- **Visibility**: Only show when at least one filter is active

### Accessibility
```tsx
<button
  onClick={handleResetFilters}
  aria-label="Reset all filters"
  // Additional classes/styles as appropriate
>
  Reset Filters
</button>
```

### Styling Suggestions
- Use low-contrast styling (similar to "clear types" button at line 196-199)
- Font size: 11px (monospace, matching existing clear buttons)
- Color: `var(--fg-3)` for subtle appearance
- Margin top: 8px for spacing consistency
- Hover state: Slight color change or underline

## Implementation Details

### Component Changes
**File**: `src/pages/LookupPage.tsx`

1. Create a new handler function:
```tsx
function resetAllFilters() {
  setQ('');
  setTypesOn(new Set());
  setBstMin(0);
  setGenFilter('all');
  setSort('id');
}
```

2. Add the button to the sidebar, conditionally rendered:
```tsx
{activeFilterCount > 0 && (
  <button
    onClick={resetAllFilters}
    aria-label="Reset all filters"
    // styling
  >
    ↺ Reset Filters
  </button>
)}
```

3. Update the `activeFilterCount` calculation if needed for consistency (already exists at line 148)

### CSS Considerations
- No new CSS classes required if using existing patterns
- Reuse `icon-btn` or similar utility classes if available
- Ensure button text wrapping on mobile is handled

## Success Criteria

- [ ] Button appears when any filter is active
- [ ] Button disappears when no filters are active
- [ ] Clicking button resets all filter states to defaults
- [ ] Filter count badge updates after reset (becomes invisible)
- [ ] Button is keyboard accessible and has proper focus states
- [ ] Button has descriptive accessibility labels
- [ ] Button works correctly on mobile, tablet, and desktop
- [ ] No performance regression in filter operations
- [ ] User testing shows improved discoverability of reset functionality

## Testing Considerations

### Manual Testing
1. Verify button visibility with various filter combinations
2. Test reset functionality for each filter type individually
3. Test reset with all filters active simultaneously
4. Verify mobile responsiveness
5. Test keyboard navigation to and interaction with button
6. Verify filter count badge updates correctly

### Edge Cases
- Reset when only search is active
- Reset when sort is the only active filter
- Reset multiple times in succession
- Reset immediately after applying filters
- Reset while viewing list vs grid view

## Design Mockup Notes
```
Filter Sidebar:
├─ Generation [All] [I] [II] [III] ...
├─ Types [with type pills]
│  └─ × clear types (existing)
├─ Min BST [slider]
├─ Sort by [dropdown]
└─ ↺ Reset Filters (NEW - only visible when filters active)
```

## Timeline & Effort
- **Estimated Effort**: Small (1-2 hours)
- **Complexity**: Low
- **Risk Level**: Minimal

## Acceptance Criteria Checklist
- [ ] PR includes implementation of reset button
- [ ] PR includes updated tests for new functionality
- [ ] All manual testing scenarios pass
- [ ] Code follows existing code style and patterns
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] No breaking changes to existing functionality
- [ ] Documentation updated if necessary

## Future Enhancements
- Add keyboard shortcut (e.g., Escape key) to reset filters
- Add confirmation dialog for reset action
- Persist filter preferences with reset override option
- Add animation/transition when filters reset
- Track reset button usage in analytics
