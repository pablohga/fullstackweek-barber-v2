"use client"

import { useEffect, useState, useTransition, useCallback } from "react"
import { getBarbershopMetrics } from "@/app/_actions/get-barbershop-metrics"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import {
  DollarSignIcon,
  CalendarCheckIcon,
  TrendingUpIcon,
  UsersIcon,
  ScissorsIcon,
  ClockIcon,
} from "lucide-react"
import { format, startOfMonth, endOfMonth, subDays } from "date-fns"

interface MetricsDashboardProps {
  barbershopId: string
}

export const MetricsDashboard = ({ barbershopId }: MetricsDashboardProps) => {
  const [isPending, startTransition] = useTransition()
  const [metrics, setMetrics] = useState<any>(null)

  const defaultStart = format(startOfMonth(new Date()), "yyyy-MM-dd")
  const defaultEnd = format(endOfMonth(new Date()), "yyyy-MM-dd")

  const [startDate, setStartDate] = useState(defaultStart)
  const [endDate, setEndDate] = useState(defaultEnd)

  const loadMetrics = useCallback(
    (start: string, end: string) => {
      startTransition(async () => {
        try {
          const data = await getBarbershopMetrics({
            barbershopId,
            startDate: start,
            endDate: end,
          })
          setMetrics(data)
        } catch (error) {
          console.error("Error loading metrics", error)
        }
      })
    },
    [barbershopId],
  )

  useEffect(() => {
    loadMetrics(startDate, endDate)
  }, [loadMetrics, startDate, endDate])

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault()
    loadMetrics(startDate, endDate)
  }

  const handleQuickFilter = (type: "month" | "30days" | "week") => {
    const now = new Date()
    let start = ""
    let end = format(now, "yyyy-MM-dd")

    if (type === "month") {
      start = format(startOfMonth(now), "yyyy-MM-dd")
      end = format(endOfMonth(now), "yyyy-MM-dd")
    } else if (type === "30days") {
      start = format(subDays(now, 30), "yyyy-MM-dd")
    } else if (type === "week") {
      start = format(subDays(now, 7), "yyyy-MM-dd")
    }

    setStartDate(start)
    setEndDate(end)
    loadMetrics(start, end)
  }

  if (!metrics) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        Carregando métricas...
      </div>
    )
  }

  const currencyFormatter = (value: number) =>
    Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      value,
    )

  return (
    <div className="space-y-6">
      {/* Filtros de Período */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold">Métricas do Negócio</h3>
          <p className="text-xs text-gray-400">
            Acompanhe o faturamento, desempenho e demanda da barbearia
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickFilter("month")}
          >
            Este Mês
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickFilter("30days")}
          >
            Últimos 30 dias
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickFilter("week")}
          >
            Últimos 7 dias
          </Button>
        </div>
      </div>

      <form
        onSubmit={handleApplyFilter}
        className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/20 p-4"
      >
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-400">
            Data Inicial
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-400">
            Data Final
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Filtrando..." : "Filtrar Período"}
        </Button>
      </form>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Faturamento Realizado
            </CardTitle>
            <DollarSignIcon className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {currencyFormatter(metrics.realizedRevenue)}
            </div>
            <p className="pt-1 text-xs text-gray-400">
              Serviços concluídos ({metrics.totalFinished} atendimentos)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Faturamento Previsto
            </CardTitle>
            <TrendingUpIcon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {currencyFormatter(metrics.projectedRevenue)}
            </div>
            <p className="pt-1 text-xs text-gray-400">
              Horários confirmados ({metrics.totalConfirmed} agendados)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total de Agendamentos
            </CardTitle>
            <CalendarCheckIcon className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalBookings}</div>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-gray-400">
              <span>{metrics.totalFinished} concl.</span>•
              <span>{metrics.totalConfirmed} conf.</span>•
              <span>{metrics.totalCancelled} canc.</span>•
              <span>{metrics.totalExpired} exp.</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Taxa de Conclusão
            </CardTitle>
            <UsersIcon className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalBookings > 0
                ? `${((metrics.totalFinished / (metrics.totalBookings - metrics.totalCancelled)) * 100 || 0).toFixed(0)}%`
                : "0%"}
            </div>
            <p className="pt-1 text-xs text-gray-400">
              Atendimentos realizados vs válidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Horários mais procurados */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ClockIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-bold">
              Horários Mais Procurados
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            {metrics.hourlyArray.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-gray-400">
                Nenhum dado no período selecionado.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.hourlyArray}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="hour" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: "#fff", fontWeight: "bold" }}
                  />
                  <Bar
                    dataKey="count"
                    name="Agendamentos"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Serviços mais vendidos */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ScissorsIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-bold">
              Serviços Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            {metrics.servicesArray.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-gray-400">
                Nenhum dado no período selecionado.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.servicesArray} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    type="number"
                    stroke="#888888"
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#888888"
                    fontSize={12}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: "#fff", fontWeight: "bold" }}
                    formatter={(val: any, name: any) => [
                      name === "revenue" ? currencyFormatter(val) : val,
                      name === "revenue" ? "Faturamento" : "Qtd",
                    ]}
                  />
                  <Bar
                    dataKey="count"
                    name="Qtd"
                    fill="#22c55e"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Desempenho por profissional */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <UsersIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-bold">
            Desempenho por Profissional
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] pt-4">
          {metrics.professionalsArray.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-gray-400">
              Nenhum dado de profissional no período selecionado.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.professionalsArray}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                <YAxis
                  yAxisId="left"
                  stroke="#888888"
                  fontSize={12}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#888888"
                  fontSize={12}
                  tickFormatter={(val) => `R$ ${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                  formatter={(val: any, name: any) => [
                    name === "revenue" ? currencyFormatter(val) : val,
                    name === "revenue" ? "Faturamento" : "Atendimentos",
                  ]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  name="Atendimentos"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  name="Faturamento"
                  fill="#eab308"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
