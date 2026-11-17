"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

type CollapsibleTriggerProps = CollapsiblePrimitive.Trigger.Props
type CollapsibleContentProps = CollapsiblePrimitive.Panel.Props

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content"  {...props} />
  )
}


export type {
  CollapsibleTriggerProps,
  CollapsibleContentProps
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
