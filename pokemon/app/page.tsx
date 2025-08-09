import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/toggle"
import { BentoExample } from "@/components/bento-example"

export default function Home() {
  return (
    <div className="min-h-screen p-4">
      <div className="mb-8">
        <span>I am a button</span> <Button>Search</Button>
        <ModeToggle />
      </div>
      
      <BentoExample />
    </div>
  )
}