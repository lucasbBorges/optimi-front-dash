import type { CSSProperties } from "react"
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import colors from "tailwindcss/colors"

import { ChartContainer } from "@/components/ui/chart"

type ChartProps = {
  color?: string
  radius: number
  metaAtingPercent: number
}

const chartData = [
  { browser: "safari", visitors: 248785.62, fill: "var(--color-safari)" },
]

const makeChartConfig = (color: string) => ({
  visitors: {
    label: "Faturado R$",
  },
  safari: {
    label: "Faturamento",
    color,
  },
})

export default function Chart({
  color = colors.sky[400],
  radius,
  metaAtingPercent,
}: ChartProps) {
  return (
    <ChartContainer
      config={makeChartConfig(color)}
      className="h-[92px] w-[92px]"
      style={{ ["--color-safari" as string]: color } as CSSProperties}
    >
      <RadialBarChart
        data={chartData}
        startAngle={0}
        endAngle={radius}
        innerRadius={28}
        outerRadius={42}
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-muted last:fill-background"
          polarRadius={[31, 26]}
        />
        <RadialBar dataKey="visitors" background cornerRadius={5} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground font-bold"
                      style={{ fontSize: "0.825rem" }}
                    >
                      {`${metaAtingPercent}%`}
                    </tspan>
                  </text>
                )
              }

              return null
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  )
}
