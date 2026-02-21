"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

const ChartContext = React.createContext<{
  config: ChartConfig
} | null>(null)

export interface ChartConfig {
  [key: string]: {
    label?: React.ReactNode
    color?: string 
    icon?: React.ReactNode
  } & Record<string, unknown>
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  }
>(({ className, children, config, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean
    payload?: Array<{
      dataKey: string
      value: number | string
      color: string
      [key: string]: unknown
    }>
    label?: string
  }
>(({ active, payload, label, className, ...props }, ref) => {
  const { config } = React.useContext(ChartContext) || {}

  if (active && payload && payload.length) {
    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-32 items-start gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        {...props}
      >
        {label && <div className="text-stone-500">{label}</div>}
        {payload.map((item, index: number) => {
          const key = `${item.dataKey}`
          const itemConfig = config?.[key]
          const value = `${item.value}`

          return (
            <div
              key={`${item.dataKey}-${index}`}
              className="flex w-full flex-nowrap items-center gap-2 pt-1.5 text-xs font-medium last:pb-0"
            >
              <div
                className="shrink-0 rounded-xs border border-current"
                style={{
                  backgroundColor: item.color,
                  borderColor: item.color,
                }}
              />
              <div className="flex flex-1 justify-between gap-8">
                <span className="text-stone-500">{itemConfig?.label || key}</span>
                <span className="font-mono font-medium text-stone-900">{value}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return null
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorList = Object.entries(config).map(([, value]) => value.color)

  if (!colorList.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .map(([key, itemConfig]) => {
            const color = itemConfig.color
            return color ? `.${id} [data-chart-id="${key}"] { --chart-color: ${color}; }` : ""
          })
          .join(""),
      }}
    />
  )
}

export {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
}
