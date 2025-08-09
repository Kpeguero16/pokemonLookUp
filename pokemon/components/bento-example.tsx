"use client"

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"

export function BentoExample() {
  return (
    <BentoGrid className="max-w-7xl mx-auto">
      <BentoGridItem size="lg" variant="accent">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Featured Content</h3>
          <p className="text-muted-foreground">
            This is a larger card that spans multiple columns. Perfect for highlighting important content or featured articles.
          </p>
        </div>
      </BentoGridItem>
      
      <BentoGridItem size="sm" variant="default">
        <div className="space-y-2">
          <h4 className="font-medium">Quick Stats</h4>
          <p className="text-sm text-muted-foreground">
            Compact information display
          </p>
        </div>
      </BentoGridItem>
      
      <BentoGridItem size="md" variant="muted">
        <div className="space-y-2">
          <h4 className="font-medium">Updates</h4>
          <p className="text-sm text-muted-foreground">
            Latest news and updates in a medium-sized card
          </p>
        </div>
      </BentoGridItem>
      
      <BentoGridItem size="xl" variant="accent">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Main Feature</h3>
          <p className="text-muted-foreground">
            This is the largest card in the grid, spanning both multiple columns and rows. 
            It's perfect for showcasing detailed content, images, or comprehensive information.
          </p>
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              Additional details can go here with more space to expand on ideas.
            </p>
          </div>
        </div>
      </BentoGridItem>
      
      <BentoGridItem size="sm" variant="default">
        <div className="space-y-2">
          <h4 className="font-medium">Tips</h4>
          <p className="text-sm text-muted-foreground">
            Helpful tips and tricks
          </p>
        </div>
      </BentoGridItem>
      
      <BentoGridItem size="md" variant="muted">
        <div className="space-y-2">
          <h4 className="font-medium">Resources</h4>
          <p className="text-sm text-muted-foreground">
            Links and resources for users
          </p>
        </div>
      </BentoGridItem>
      
      <BentoGridItem size="lg" variant="default">
        <div className="space-y-2">
          <h4 className="font-medium">Community</h4>
          <p className="text-sm text-muted-foreground">
            Community highlights and user-generated content in a wider card format.
          </p>
        </div>
      </BentoGridItem>
      
      <BentoGridItem size="sm" variant="accent">
        <div className="space-y-2">
          <h4 className="font-medium">Events</h4>
          <p className="text-sm text-muted-foreground">
            Upcoming events
          </p>
        </div>
      </BentoGridItem>
    </BentoGrid>
  )
}
